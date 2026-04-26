import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';

const appointmentSchema = z.object({
  patientId: z.string().optional(),
  patientName: z.string().optional(),
  patientPhone: z.string().optional(),
  doctorId: z.string().min(1),
  date: z.string().min(8),
  slot: z.string().optional(),
  source: z.enum(['WALK_IN', 'ONLINE', 'PHONE', 'REFERRAL']).default('WALK_IN'),
  notes: z.string().optional(),
});

async function nextToken(hospitalId: string, prefix: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const count = await prisma.appointment.count({
    where: { hospitalId, createdAt: { gte: start } },
  });
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
}

export async function GET(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('opd', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const date = req.nextUrl.searchParams.get('date');
  const doctorId = req.nextUrl.searchParams.get('doctorId');
  const where: any = { hospitalId: access.hospitalId };
  if (date) where.date = new Date(date);
  if (doctorId) where.doctorId = doctorId;

  const appointments = await prisma.appointment.findMany({
    where,
    include: { patient: { select: { id: true, name: true, phone: true } }, doctor: { select: { id: true, fullName: true } }, visit: true },
    orderBy: [{ date: 'asc' }, { slot: 'asc' }],
    take: 150,
  });
  return NextResponse.json({ appointments });
}

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('opd', 'create');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;
  if (!data.patientId && (!data.patientName || !data.patientPhone)) {
    return NextResponse.json({ error: 'patientId or patientName/patientPhone is required' }, { status: 422 });
  }

  const config = await prisma.opdConfig.findUnique({ where: { hospitalId: access.hospitalId } });
  const token = await nextToken(access.hospitalId, config?.tokenPrefix ?? 'OPD');
  const targetDate = new Date(data.date);
  targetDate.setHours(0, 0, 0, 0);
  const slot = data.slot ?? token;

  const appointment = await prisma.$transaction(async (tx) => {
    const patient = data.patientId
      ? await tx.patient.findUniqueOrThrow({ where: { id: data.patientId } })
      : await tx.patient.upsert({
          where: { phone: data.patientPhone! },
          update: { name: data.patientName! },
          create: {
            name: data.patientName!,
            phone: data.patientPhone!,
            password: await bcrypt.hash(`${data.patientPhone}-${Date.now()}`, 12),
          },
        });

    return tx.appointment.create({
      data: {
        hospitalId: access.hospitalId,
        patientId: patient.id,
        doctorId: data.doctorId,
        date: targetDate,
        slot,
        scheduledAt: data.slot ? new Date(`${data.date}T${data.slot.length === 5 ? `${data.slot}:00` : '00:00:00'}`) : null,
        status: data.source === 'ONLINE' ? 'AWAITING_PAYMENT' : 'BOOKED',
        notes: JSON.stringify({ token, source: data.source, notes: data.notes ?? '' }),
      },
      include: { patient: true, doctor: true },
    });
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'create',
    entity: 'appointment',
    entityId: appointment.id,
    details: { token, source: data.source },
  });

  return NextResponse.json({ appointment, token }, { status: 201 });
}
