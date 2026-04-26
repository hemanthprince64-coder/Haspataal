import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';

const notificationSchema = z.object({
  patientId: z.string().optional().nullable(),
  channel: z.enum(['WHATSAPP', 'SMS', 'EMAIL', 'IN_APP']),
  templateKey: z.string().optional(),
  recipient: z.string().min(3),
  subject: z.string().optional(),
  body: z.string().min(1),
  scheduledAt: z.string().optional().nullable(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('notifications', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const status = req.nextUrl.searchParams.get('status') ?? undefined;
  const notifications = await prisma.notification.findMany({
    where: { hospitalId: access.hospitalId, ...(status ? { status } : {}) },
    include: { patient: { select: { id: true, name: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json({ notifications });
}

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('notifications', 'create');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = notificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;
  const notification = await prisma.notification.create({
    data: {
      hospitalId: access.hospitalId,
      patientId: data.patientId ?? null,
      channel: data.channel,
      templateKey: data.templateKey,
      recipient: data.recipient,
      subject: data.subject,
      body: data.body,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      payload: (data.payload ?? {}) as any,
    },
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'create',
    entity: 'notification',
    entityId: notification.id,
    details: { channel: data.channel, scheduled: Boolean(data.scheduledAt) },
  });

  return NextResponse.json({ notification }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('notifications', 'update');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = z.object({ id: z.string(), status: z.enum(['PENDING', 'SENT', 'FAILED', 'CANCELLED']), failureReason: z.string().optional() }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const notification = await prisma.notification.updateMany({
    where: { id: parsed.data.id, hospitalId: access.hospitalId },
    data: {
      status: parsed.data.status,
      failureReason: parsed.data.failureReason,
      sentAt: parsed.data.status === 'SENT' ? new Date() : undefined,
    },
  });
  return NextResponse.json({ ok: notification.count > 0, count: notification.count });
}
