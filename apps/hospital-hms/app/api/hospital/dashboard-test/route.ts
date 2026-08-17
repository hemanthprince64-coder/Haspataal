/* eslint-disable */
import { NextResponse } from 'next/server';

import { requireHospital } from '@/lib/auth/middleware';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Endpoint not available in production' }, { status: 404 });
  }

  try {
    const auth = await requireHospital(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const hospitalId = auth.user.hospital_id;

    // Fetch hospital details via Prisma
    const hospital = await prisma.hospitalsMaster.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found in Prisma' }, { status: 404 });
    }

    // Fetch counts via Prisma (using staff and appointments linked to hospital)
    const usersCount = await prisma.staff.count({
      where: { hospitalId: hospitalId },
    });

    let patientsCount = 0;
    try {
      patientsCount = await prisma.patient.count({
        where: {
          appointments: {
            some: {
              hospitalId: hospitalId,
            },
          },
        },
      });
    } catch (e: any) {
      // ignore
    }

    return NextResponse.json({
      hospital_id: hospitalId,
      hospital_name: hospital.legalName || 'Unknown',
      users_count: usersCount || 0,
      patients_count: patientsCount || 0,
      user_role: auth.user.role,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Caught Exception', details: err.message }, { status: 500 });
  }
}
