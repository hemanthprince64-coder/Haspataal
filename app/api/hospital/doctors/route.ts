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
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 422 });

  const data = parsed.data;

  // 1. Find or create doctor in global DoctorsMaster (or simplified Doctor model)
  // For this implementation, we'll assume a simplified link to a Doctor record.
  let doctor = await prisma.doctorMaster.findUnique({ where: { mobile: data.mobile } });
  if (!doctor) {
    doctor = await prisma.doctorMaster.create({
      data: {
        fullName: data.name,
        mobile: data.mobile,
        email: data.email || null,
      }
    });
  }

  // 2. Create affiliation with specific fees and payload for this hospital
  const affiliation = await prisma.doctorHospitalAffiliation.create({
    data: {
      hospitalId: hospitalId as string,
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
    } 
  });
}
