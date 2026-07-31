import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

import { requireHospitalAccess } from '@/lib/auth/hospital-access';

export async function GET(request: Request) {
  try {
    const access = await requireHospitalAccess('opd', 'manage_schedule');

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const doctorId = searchParams.get('doctorId');

    const targetDate = dateStr ? new Date(dateStr) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const appointments = await prisma.appointment.findMany({
      where: {
        hospitalId: access.hospitalId,
        date: targetDate,
        ...(doctorId ? { doctorId } : {}),
      },
      include: {
        patient: {
          select: { fullName: true, mobileNumber: true },
        },
        doctor: {
          select: { fullName: true, specializations: true },
        },
      },
      orderBy: {
        slot: 'asc',
      },
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
