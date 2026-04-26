import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';

const queueSchema = z.object({
  appointmentId: z.string().min(1),
  action: z.enum(['CHECK_IN', 'COMPLETE', 'NO_SHOW', 'CANCEL']),
  diagnosis: z.string().optional(),
});

export async function GET(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('opd', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const date = req.nextUrl.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const queue = await prisma.appointment.findMany({
    where: {
      hospitalId: access.hospitalId,
      date: targetDate,
      status: { in: ['BOOKED', 'CONFIRMED', 'AWAITING_PAYMENT'] },
    },
    include: { patient: { select: { id: true, name: true, phone: true } }, doctor: { select: { id: true, fullName: true } }, visit: true },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ queue });
}

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('opd', 'update');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = queueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const { appointmentId, action, diagnosis } = parsed.data;
  const result = await prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findFirst({
      where: { id: appointmentId, hospitalId: access.hospitalId },
      include: { patient: true },
    });
    if (!appointment) throw new Error('NOT_FOUND');

    if (action === 'CHECK_IN') {
      const updated = await tx.appointment.update({ where: { id: appointmentId }, data: { status: 'CONFIRMED' } });
      const visit = await tx.visit.upsert({
        where: { appointmentId },
        update: {},
        create: {
          appointmentId,
          hospitalId: access.hospitalId,
          patientName: appointment.patient.name,
          patientPhone: appointment.patient.phone,
          diagnosis: 'OPD Visit',
          amount: 0,
        },
      });
      return { appointment: updated, visit };
    }

    const status = action === 'COMPLETE' ? 'COMPLETED' : action === 'NO_SHOW' ? 'NO_SHOW' : 'CANCELLED';
    const updated = await tx.appointment.update({ where: { id: appointmentId }, data: { status } });
    if (action === 'COMPLETE') {
      await tx.visit.updateMany({
        where: { appointmentId, hospitalId: access.hospitalId },
        data: { diagnosis: diagnosis ?? 'Completed OPD Visit' },
      });
    }
    return { appointment: updated };
  }).catch((error) => {
    if (error instanceof Error && error.message === 'NOT_FOUND') return null;
    throw error;
  });

  if (!result) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: action.toLowerCase(),
    entity: 'opd_queue',
    entityId: appointmentId,
  });

  return NextResponse.json(result);
}
