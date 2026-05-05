import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * INTERNAL TEST ENDPOINT - ONLY FOR E2E TESTING
 * DO NOT USE IN PRODUCTION
 */
export async function GET(req: NextRequest) {
  // Simple check to prevent accidental production usage if needed
  // if (process.env.NODE_ENV === 'production') {
  //   return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  // }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const mobile = searchParams.get('mobile');
  const hospitalId = searchParams.get('hospitalId');
  const doctorId = searchParams.get('doctorId');

  try {
    if (type === 'patient') {
      const patient = await prisma.patient.findUnique({
        where: { mobile: mobile || '' },
        select: { id: true, name: true, mobile: true },
      });
      return NextResponse.json(patient);
    }

    if (type === 'hospital') {
      const hospital = await prisma.hospital.findFirst({
        where: { name: searchParams.get('name') || '' },
      });
      return NextResponse.json(hospital);
    }

    if (type === 'affiliation') {
      const affiliation = await prisma.doctorHospital.findFirst({
        where: {
          hospitalId: hospitalId || '',
          doctor: { mobile: mobile || '' },
        },
        include: { doctor: true },
      });
      return NextResponse.json(affiliation);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
