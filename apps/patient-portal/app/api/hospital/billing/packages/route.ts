import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import { getHospitalIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const packageSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const packages = await prisma.billingPackage.findMany({
    where: { hospitalId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ packages });
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

  const parsed = packageSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );

  const pkg = await prisma.billingPackage.create({
    data: { ...parsed.data, hospitalId },
  });

  return NextResponse.json({ package: pkg }, { status: 201 });
}
