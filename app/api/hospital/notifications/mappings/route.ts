import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';
import { z } from 'zod';

const mappingSchema = z.object({
  event: z.string(),
  templateId: z.string(),
  channel: z.enum(['WHATSAPP', 'SMS', 'EMAIL']),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const mappings = await prisma.notificationEventMapping.findMany({
    where: { hospitalId },
    include: {
      template: {
        select: {
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ mappings });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = mappingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { event, templateId, channel, isActive } = parsed.data;

  const mapping = await prisma.notificationEventMapping.upsert({
    where: {
      hospitalId_event: {
        hospitalId,
        event,
      },
    },
    update: {
      templateId,
      channel,
      isActive,
    },
    create: {
      hospitalId,
      event,
      templateId,
      channel,
      isActive,
    },
  });

  return NextResponse.json({ mapping });
}

export async function DELETE(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  await prisma.notificationEventMapping.deleteMany({
    where: {
      id,
      hospitalId,
    },
  });

  return NextResponse.json({ success: true });
}
