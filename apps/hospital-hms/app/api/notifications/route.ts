import { prisma } from '@haspataal/db';
import { z } from 'zod';

import { NextResponse } from 'next/server';

const CreateNotificationSchema = z.object({
  hospitalId: z.string().uuid(),
  patientId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  channel: z.enum(['SMS', 'WHATSAPP', 'EMAIL', 'PUSH', 'IN_APP']),
  priority: z
    .enum(['EMERGENCY', 'CRITICAL', 'HIGH', 'NORMAL', 'LOW', 'BACKGROUND'])
    .default('NORMAL'),
  recipient: z.string(),
  subject: z.string().optional(),
  body: z.string(),
  variables: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  scheduledAt: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

export async function POST(req: Request) {
  try {
    const body = CreateNotificationSchema.parse(await req.json());
    const notification = await prisma.notification.create({ data: body as any });
    return NextResponse.json({ success: true, data: notification });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get('hospitalId') || undefined;
    const status = searchParams.get('status') || undefined;

    const notifications = await prisma.notification.findMany({
      where: {
        ...(hospitalId && { hospitalId }),
        ...(status && { status }),
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
