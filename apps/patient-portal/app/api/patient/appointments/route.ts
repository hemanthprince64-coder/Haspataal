import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

import { requirePatientAccess } from '@/lib/auth/patient-access';

export async function GET(request: Request) {
  try {
    const session = await requirePatientAccess();

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: session.user.id,
      },
      include: {
        doctor: {
          select: { fullName: true },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
