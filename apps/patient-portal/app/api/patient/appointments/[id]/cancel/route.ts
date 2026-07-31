import { CancelAppointmentUseCase, PrismaAppointmentRepository } from '@haspataal/scheduling';

import { NextResponse } from 'next/server';

import { requirePatientAccess } from '@/lib/auth/patient-access';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requirePatientAccess();
    const appointmentId = params.id;

    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointment ID' }, { status: 400 });
    }

    const repo = new PrismaAppointmentRepository();
    const useCase = new CancelAppointmentUseCase(repo);

    await useCase.execute({
      appointmentId,
      patientId: session.user.id, // Enforce patient ownership and lead time domain rules
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error.message === 'APPOINTMENT_NOT_FOUND') {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (error.message === 'TOO_LATE_TO_CANCEL') {
      return NextResponse.json({ error: 'Too late to cancel appointment' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
