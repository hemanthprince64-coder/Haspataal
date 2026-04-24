import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).max(10).optional(),
  type: z.enum(['OPD', 'IPD', 'BOTH', 'EMERGENCY']).optional(),
  headDoctorId: z.string().optional(),
  billingRules: z.any().optional(),
  analyticsEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const unitSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().default(0),
  bedType: z.enum(['GENERAL', 'ICU', 'NICU', 'PRIVATE', 'SEMI_PRIVATE', 'EMERGENCY']).default('GENERAL'),
  wardNumber: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 422 });

  const department = await prisma.department.updateMany({
    where: { id, hospitalId },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true, count: department.count });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Soft delete
  await prisma.department.updateMany({
    where: { id, hospitalId },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
