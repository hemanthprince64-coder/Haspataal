import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';

const permissionSchema = z.object({
  role: z.nativeEnum(Role),
  module: z.string().min(2),
  action: z.string().min(2),
  allowed: z.boolean().default(true),
  staffId: z.string().optional().nullable(),
  conditions: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  let access;
  try {
    access = await requireHospitalAccess('staff', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const permissions = await prisma.rolePermission.findMany({
    where: { hospitalId: access.hospitalId },
    orderBy: [{ role: 'asc' }, { module: 'asc' }, { action: 'asc' }],
  });
  return NextResponse.json({ permissions });
}

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('staff', 'update');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = permissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;
  const permission = await prisma.rolePermission.create({
    data: {
      hospitalId: access.hospitalId,
      role: data.role,
      module: data.module,
      action: data.action,
      allowed: data.allowed,
      staffId: data.staffId ?? null,
      conditions: (data.conditions ?? {}) as any,
    },
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'create',
    entity: 'role_permission',
    entityId: permission.id,
    details: data,
  });

  return NextResponse.json({ permission }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('staff', 'update');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = permissionSchema.extend({ id: z.string().min(1) }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const { id, ...data } = parsed.data;
  const result = await prisma.rolePermission.updateMany({
    where: { id, hospitalId: access.hospitalId },
    data: {
      role: data.role,
      module: data.module,
      action: data.action,
      allowed: data.allowed,
      staffId: data.staffId ?? null,
      conditions: (data.conditions ?? {}) as any,
    },
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'update',
    entity: 'role_permission',
    entityId: id,
    details: data,
  });

  return NextResponse.json({ ok: result.count > 0, count: result.count });
}

export async function DELETE(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('staff', 'delete');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const { id } = await req.json().catch(() => ({ id: '' }));
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const result = await prisma.rolePermission.deleteMany({ where: { id, hospitalId: access.hospitalId } });
  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'delete',
    entity: 'role_permission',
    entityId: id,
  });
  return NextResponse.json({ ok: result.count > 0, count: result.count });
}
