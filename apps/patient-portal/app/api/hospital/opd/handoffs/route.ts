import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import {
  hospitalAccessError,
  requireHospitalAccess,
  writeAuditLog,
} from '@/lib/auth/hospital-access';
import { prisma } from '@/lib/prisma';

const handoffSchema = z.object({
  visitId: z.string().min(1),
  toStage: z.enum([
    'RECEPTION',
    'TRIAGE',
    'CONSULTATION',
    'INVESTIGATION_LAB',
    'INVESTIGATION_RAD',
    'DISPENSARY_PHARMACY',
    'BILLING',
    'DISCHARGE',
  ]),
  notes: z.string().optional(),
  assignedStaffId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('opd', 'update');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = handoffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { visitId, toStage, notes, assignedStaffId } = parsed.data;

  const visit = await prisma.visit.findFirst({
    where: { id: visitId, hospitalId: access.hospitalId },
    select: { id: true, currentStage: true },
  });

  if (!visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
  }

  const handoff = await prisma.departmentHandoff.create({
    data: {
      visitId,
      hospitalId: access.hospitalId,
      fromStage: visit.currentStage,
      toStage,
      status: 'PENDING',
      notes: notes || null,
      assignedStaffId: assignedStaffId || null,
    },
  });

  await prisma.visit.update({
    where: { id: visitId },
    data: { currentStage: toStage },
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'transfer',
    entity: 'department_handoff',
    entityId: handoff.id,
    details: { from: visit.currentStage, to: toStage },
  });

  return NextResponse.json({ handoff }, { status: 201 });
}
