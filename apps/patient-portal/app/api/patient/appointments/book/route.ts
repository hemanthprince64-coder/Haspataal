import { BookAppointmentUseCase, PrismaAppointmentRepository } from '@haspataal/scheduling';

import { NextResponse } from 'next/server';

import { requirePatientAccess } from '@/lib/auth/patient-access';

export async function POST(request: Request) {
  try {
    const session = await requirePatientAccess();
    const body = await request.json();

    const { doctorId, hospitalId, date, slot } = body;

    if (!doctorId || !hospitalId || !date || !slot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const repo = new PrismaAppointmentRepository();
    const useCase = new BookAppointmentUseCase(repo);

    const appointment = await useCase.execute({
      patientId: session.user.id,
      doctorId,
      hospitalId,
      date: new Date(date),
      slot,
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      error.message === 'SLOT_ALREADY_TAKEN' ||
      error.message.includes('Lead time') ||
      error.message.includes('Cannot book')
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
