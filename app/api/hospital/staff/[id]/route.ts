import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

const updateSchema = z.object({
  name: z.string().optional(),
  role: z.enum(['DOCTOR', 'NURSE', 'RECEPTIONIST', 'BILLING', 'PHARMACIST', 'LAB_TECH', 'HOSPITAL_ADMIN', 'SUPER_ADMIN']).optional(),
  shift: z.enum(['MORNING', 'EVENING', 'NIGHT', 'ROTATIONAL']).nullable().optional(),
  isActive: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });

  const staff = await prisma.staff.updateMany({
    where: { id, hospitalId },
    data: parsed.data as any,
  });

  return NextResponse.json({ ok: true, count: staff.count });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Safety check: Cannot delete the last admin
  const member = await prisma.staff.findUnique({ where: { id } });
  if (member?.role === 'HOSPITAL_ADMIN') {
    const adminCount = await prisma.staff.count({ 
      where: { hospitalId, role: 'HOSPITAL_ADMIN', isActive: true } 
    });
    if (adminCount <= 1) {
      return NextResponse.json({ error: 'Cannot delete the last active administrator' }, { status: 400 });
    }
  }

  await prisma.staff.deleteMany({
    where: { id, hospitalId },
  });

  return NextResponse.json({ ok: true });
}
