import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import { getHospitalIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const copaySchema = z.object({
  insurerId: z.string().min(1),
  serviceType: z.string().optional(),
  serviceId: z.string().optional(),
  copayType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
  copayValue: z.number().positive(),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rules = await prisma.coPayRule.findMany({
    where: { hospitalId },
    orderBy: { createdAt: 'desc' },
    include: {
      insurer: {
        select: {
          id: true,
          insurerName: true,
          insurerType: true,
        },
      },
      service: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = copaySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );

  const rule = await prisma.coPayRule.create({
    data: { ...parsed.data, hospitalId },
    include: {
      insurer: {
        select: {
          id: true,
          insurerName: true,
          insurerType: true,
        },
      },
      service: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  return NextResponse.json({ rule }, { status: 201 });
}
