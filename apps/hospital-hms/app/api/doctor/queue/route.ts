import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

import { checkRole, Roles } from '../../../lib/auth/roleGuard';

async function requireRole(role: string, headerName = 'authorization') {
  const user = (await checkRole({} as Request, [role as any])) as any;
  return user;
}

export async function GET(req: Request) {
  try {
    const user = (await requireRole(Roles.DOCTOR, 'session_user')) as any;
    const doctorId = user.id;
    const hospitalId = user.hospitalId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch today's appointments with queue status
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        status: { in: ['BOOKED', 'CONFIRMED', 'COMPLETED'] },
      },
      include: {
        patient: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Build queue with status indicators
    const queue = appointments.map((app, idx) => {
      let status: 'waiting' | 'in-consultation' | 'completed' | 'no-show';
      if (app.status === 'COMPLETED') {
        status = 'completed';
      } else if (idx === appointments.findIndex((a) => a.status === 'BOOKED')) {
        status = 'in-consultation';
      } else {
        status = 'waiting';
      }

      return {
        id: app.id,
        patientId: app.patientId,
        patientName: app.patient?.name || 'Unknown',
        patientPhone: app.patient?.phone || null,
        slot: app.slot,
        status,
        queueToken: idx + 1,
        notes: app.notes,
        createdAt: app.createdAt,
      };
    });

    // Get statistics
    const stats = {
      waiting: queue.filter((q) => q.status === 'waiting').length,
      inConsultation: queue.filter((q) => q.status === 'in-consultation').length,
      completed: queue.filter((q) => q.status === 'completed').length,
      total: queue.length,
    };

    return NextResponse.json({ queue, stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = (await requireRole(Roles.DOCTOR, 'session_user')) as any;
    const body = await req.json();
    const { appointmentId, status } = body;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        doctorId: user.id,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Valid status transitions for queue
    const validTransitions: Record<string, string[]> = {
      BOOKED: ['CONFIRMED', 'COMPLETED', 'CANCELLED'],
      CONFIRMED: ['IN_CONSULTATION', 'COMPLETED', 'CANCELLED'],
      IN_CONSULTATION: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    const currentStatus = appointment.status;
    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${status}` },
        { status: 400 },
      );
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    return NextResponse.json({ success: true, appointment: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
