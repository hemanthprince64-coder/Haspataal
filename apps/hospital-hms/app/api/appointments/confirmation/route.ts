import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';

async function requireRole(role: string, headerName = 'authorization') {
  const user = (await checkRole({} as Request, [role as any])) as any;
  return user;
}

export async function PATCH(req: Request) {
  try {
    const user = (await requireRole(Roles.DOCTOR, 'session_user')) as any;
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get('appointmentId');
    const body = await req.json();
    const { action } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, doctorId: user.id },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    let newStatus: string;
    switch (action) {
      case 'accept':
        newStatus = 'CONFIRMED';
        break;
      case 'reject':
        newStatus = 'REJECTED';
        break;
      case 'reschedule':
        newStatus = 'RESCHEDULE_REQUESTED';
        break;
      case 'forward':
        newStatus = 'CANCELLED';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: newStatus as any },
    });

    // Send notification
    const { emitEvent } = await import('../../../../../../services/event-emitter');
    await emitEvent({
      eventType: `appointment_${action}d` as any,
      payload: {
        appointmentId,
        patientId: appointment.patientId,
        doctorId: user.id,
        status: newStatus,
      },
    });

    return NextResponse.json({ success: true, appointment: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
