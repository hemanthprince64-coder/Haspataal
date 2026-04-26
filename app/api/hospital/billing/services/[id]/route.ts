import { NextRequest, NextResponse } from 'next/server';
import { ServiceType } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';

const updateSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  type: z.nativeEnum(ServiceType).optional(),
  departmentId: z.string().nullable().optional(),
  basePrice: z.coerce.number().positive().optional(),
  gstRate: z.coerce.number().min(0).max(28).optional(),
  gstInclusive: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let access;
  try {
    access = await requireHospitalAccess('billing', 'update');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const { id } = await params;
  const existing = await prisma.serviceCatalog.findFirst({
    where: { id, hospitalId: access.hospitalId },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

  const service = await prisma.serviceCatalog.update({
    where: { id },
    data: parsed.data,
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'billing.service.update',
    entity: 'ServiceCatalog',
    entityId: service.id,
    details: parsed.data,
  });

  return NextResponse.json({ service });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let access;
  try {
    access = await requireHospitalAccess('billing', 'delete');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const { id } = await params;
  const existing = await prisma.serviceCatalog.findFirst({
    where: { id, hospitalId: access.hospitalId },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

  const service = await prisma.serviceCatalog.update({
    where: { id },
    data: { isActive: false },
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'billing.service.deactivate',
    entity: 'ServiceCatalog',
    entityId: service.id,
    details: { isActive: false },
  });

  return NextResponse.json({ service });
}
