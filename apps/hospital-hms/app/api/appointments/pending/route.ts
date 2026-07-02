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

    const pendingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: user.id,
        status: 'PENDING_CONFIRMATION',
      },
      include: {
        patient: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = pendingAppointments.map((apt) => ({
      id: apt.id,
      patientName: apt.patient?.name || 'Unknown',
      patientPhone: apt.patient?.phone || '',
      slot: apt.slot,
      date: apt.date.toISOString(),
      status: apt.status,
      confirmationExpiresAt: apt.confirmationExpiresAt?.toISOString() || null,
      createdAt: apt.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
