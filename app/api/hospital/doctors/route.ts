import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

const doctorSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  speciality: z.string().min(1),
  experienceYears: z.number().default(0),
  consultationFee: z.number().default(500),
  followUpFee: z.number().default(0),
  followUpDays: z.number().default(7),
  deptIds: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // In this schema, doctors are Staff with role DOCTOR or via Affiliations.
  // For the setup wizard, we track them via DoctorHospitalAffiliation and HospitalRole.
  const affiliations = await prisma.doctorHospitalAffiliation.findMany({
    where: { hospitalId },
    include: { doctor: true },
  });

  // Map to a common UI structure
  const doctors = affiliations.map(a => ({
    id: a.doctor.id,
    name: a.doctor.fullName,
    email: a.doctor.email,
    mobile: a.doctor.mobile,
    speciality: (a.payload as any)?.speciality || "General",
    experienceYears: (a.payload as any)?.experienceYears || 0,
    consultationFee: Number(a.consultationFee || 0),
    followUpFee: Number(a.followUpFee || 0),
    followUpDays: a.followUpWindowDays || 7,
    isActive: a.isCurrent,
    departments: (a.payload as any)?.departments || [],
  }));

  return NextResponse.json({ doctors });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = doctorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.format() },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Wrap in transaction to ensure atomicity
  try {
    // Upsert doctor by mobile (atomic) — prevents duplicate doctor race condition
    const doctor = await prisma.doctorMaster.upsert({
      where: { mobile: data.mobile },
      update: {
        fullName: data.name,
        email: data.email || null,
      },
      create: {
        fullName: data.name,
        mobile: data.mobile,
        email: data.email || null,
      }
    });

    // Check for existing affiliation (idempotency)
    const existingAffiliation = await prisma.doctorHospitalAffiliation.findFirst({
      where: { doctorId: doctor.id, hospitalId },
    });

    if (existingAffiliation) {
      // Update existing affiliation with new fees/speciality
      const updated = await prisma.doctorHospitalAffiliation.update({
        where: { id: existingAffiliation.id },
        data: {
          consultationFee: data.consultationFee,
          followUpFee: data.followUpFee,
          followUpWindowDays: data.followUpDays,
          isCurrent: true,
          payload: {
            speciality: data.speciality,
            experienceYears: data.experienceYears,
            departments: data.deptIds,
          }
        }
      });
      return NextResponse.json({ 
        doctor: {
          id: doctor.id,
          name: doctor.fullName,
          speciality: data.speciality,
          consultationFee: data.consultationFee,
          isActive: true,
          departments: data.deptIds
        },
        affiliationId: updated.id
      });
    }

    // Create new affiliation
    const affiliation = await prisma.doctorHospitalAffiliation.create({
      data: {
        hospitalId,
        doctorId: doctor.id,
        consultationFee: data.consultationFee,
        followUpFee: data.followUpFee,
        followUpWindowDays: data.followUpDays,
        isCurrent: true,
        role: "DOCTOR",
        payload: {
          speciality: data.speciality,
          experienceYears: data.experienceYears,
          departments: data.deptIds,
        }
      }
    });

    return NextResponse.json({ 
      doctor: {
        id: doctor.id,
        name: doctor.fullName,
        speciality: data.speciality,
        consultationFee: data.consultationFee,
        isActive: true,
        departments: data.deptIds
      },
      affiliationId: affiliation.id
    });
  } catch (error) {
    console.error('[doctors POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create doctor. Please try again.' },
      { status: 500 }
    );
  }
}
