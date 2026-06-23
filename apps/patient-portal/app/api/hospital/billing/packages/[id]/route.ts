import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import { getHospitalIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );

  const pkg = await prisma.billingPackage.findUnique({
    where: { id },
    select: { hospitalId: true },
  });

  if (!pkg || pkg.hospitalId !== hospitalId)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.billingPackage.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ package: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const pkg = await prisma.billingPackage.findUnique({
    where: { id },
    select: { hospitalId: true },
  });

  if (!pkg || pkg.hospitalId !== hospitalId)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.billingPackage.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
