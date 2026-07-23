/* eslint-disable */
import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import { getHospitalIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const doctorSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  speciality: z.string().min(1),
  experienceYears: z.number().min(0).default(0),
  consultationFee: z.number().default(500),
  followUpFee: z.number().default(0),
  followUpDays: z.number().default(7),
  deptIds: z.array(z.string()).default([]),
  branchIds: z.array(z.string()).default([]),
  medicalCouncilRegNo: z.string().min(1).optional(),
  qualification: z.string().min(1).optional(),
  consultationDurationMins: z.number().default(15),
  allowsOnlineBooking: z.boolean().default(true),
  availableFrom: z.string().optional(), // Date string
});

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const affiliations = await prisma.doctorHospitalAffiliation.findMany({
    where: { hospitalId },
    include: {
      doctor: {
        include: {
          registration: true,
        },
      },
    },
  });

  const doctors = affiliations.map((a) => ({
    id: a.doctor.id,
    name: a.doctor.fullName,
    email: a.doctor.email,
    mobile: a.doctor.mobile,
    speciality: (a.payload as any)?.speciality || 'General',
    experienceYears: a.experienceYears || a.doctor.experienceYears || 0,
    consultationFee: Number(a.consultationFee || 0),
    followUpFee: Number(a.followUpFee || 0),
    followUpDays: a.followUpWindowDays || 7,
    isActive: a.isCurrent,
    departments: (a.payload as any)?.departments || [],
    branchIds: a.branchIds,
    consultationDurationMins: a.consultationDurationMins,
    allowsOnlineBooking: a.allowsOnlineBooking,
    availableFrom: a.availableFrom,
    registration: a.doctor.registration
      ? {
          number: a.doctor.registration.registrationNumber,
          council: a.doctor.registration.councilName,
          degree: a.doctor.registration.degree,
        }
      : null,
  }));

  return NextResponse.json({ doctors });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = doctorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.format() },
      { status: 422 },
    );
  }

  const data = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Upsert Doctor Master
      const doctor = await tx.doctorMaster.upsert({
        where: { mobile: data.mobile },
        update: {
          fullName: data.name,
          email: data.email || `${data.mobile}@haspataal.com`,
          experienceYears: data.experienceYears,
        },
        create: {
          fullName: data.name,
          mobile: data.mobile,
          email: data.email || `${data.mobile}@haspataal.com`,
          experienceYears: data.experienceYears,
        },
      });

      // 2. Handle Registration if provided
      if (data.medicalCouncilRegNo || data.qualification) {
        await tx.doctorRegistration.upsert({
          where: { doctorId: doctor.id },
          update: {
            registrationNumber: data.medicalCouncilRegNo || 'PENDING',
            degree: data.qualification,
          },
          create: {
            doctorId: doctor.id,
            registrationNumber: data.medicalCouncilRegNo || `TEMP-${Date.now()}`,
            councilName: 'N/A', // Default or could be added to schema/UI
            degree: data.qualification,
          },
        });
      }

      // 3. Upsert Affiliation
      const existingAffiliation = await tx.doctorHospitalAffiliation.findUnique({
        where: { doctorId_hospitalId: { doctorId: doctor.id, hospitalId } },
      });

      const affiliationData = {
        consultationFee: data.consultationFee,
        followUpFee: data.followUpFee,
        followUpWindowDays: data.followUpDays,
        consultationDurationMins: data.consultationDurationMins,
        allowsOnlineBooking: data.allowsOnlineBooking,
        branchIds: data.branchIds,
        experienceYears: data.experienceYears,
        availableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
        isCurrent: true,
        role: 'DOCTOR',
        payload: {
          speciality: data.speciality,
          departments: data.deptIds,
        },
      };

      let affiliation;
      if (existingAffiliation) {
        affiliation = await tx.doctorHospitalAffiliation.update({
          where: { id: existingAffiliation.id },
          data: affiliationData,
        });
      } else {
        affiliation = await tx.doctorHospitalAffiliation.create({
          data: {
            ...affiliationData,
            doctorId: doctor.id,
            hospitalId,
          },
        });
      }

      return { doctor, affiliation };
    });

    return NextResponse.json({
      doctor: {
        id: result.doctor.id,
        name: result.doctor.fullName,
        speciality: data.speciality,
        isActive: true,
      },
      affiliationId: result.affiliation.id,
    });
  } catch (error: any) {
    console.error('[doctors POST] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create doctor' },
      { status: 500 },
    );
  }
}
