import { GetAvailableSlotsUseCase, PrismaAppointmentRepository } from '@haspataal/scheduling';

import { NextResponse } from 'next/server';

import { requirePatientAccess } from '@/lib/auth/patient-access';

export async function GET(request: Request) {
  try {
    await requirePatientAccess(); // Ensure only authenticated patients can query

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    if (!doctorId || !date) {
      return NextResponse.json({ error: 'Missing doctorId or date' }, { status: 400 });
    }

    const repo = new PrismaAppointmentRepository();
    const useCase = new GetAvailableSlotsUseCase(repo);

    const slots = await useCase.execute(doctorId, date);

    return NextResponse.json({ slots });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message.includes('Cannot book')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
