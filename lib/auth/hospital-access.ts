import 'server-only';

import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

type HospitalModule =
  | 'admin'
  | 'setup'
  | 'opd'
  | 'ipd'
  | 'billing'
  | 'pharmacy'
  | 'diagnostics'
  | 'notifications'
  | 'retention'
  | 'marketplace'
  | 'integrations'
  | 'staff';

type HospitalAction = 'read' | 'create' | 'update' | 'delete' | 'activate' | 'pay' | 'finalize' | 'discharge';

const ROLE_MODULES: Record<string, HospitalModule[]> = {
  SUPER_ADMIN: ['admin', 'setup', 'opd', 'ipd', 'billing', 'pharmacy', 'diagnostics', 'notifications', 'retention', 'marketplace', 'integrations', 'staff'],
  HOSPITAL_ADMIN: ['admin', 'setup', 'opd', 'ipd', 'billing', 'pharmacy', 'diagnostics', 'notifications', 'retention', 'marketplace', 'integrations', 'staff'],
  DOCTOR: ['opd', 'ipd', 'diagnostics', 'notifications', 'retention'],
  RECEPTIONIST: ['opd', 'ipd', 'billing', 'notifications'],
  BILLING: ['billing', 'opd', 'ipd'],
  PHARMACIST: ['pharmacy', 'billing'],
  LAB_TECH: ['diagnostics', 'notifications'],
  NURSE: ['opd', 'ipd', 'diagnostics'],
  STAFF: ['opd'],
};

export interface HospitalAccess {
  user: any;
  hospitalId: string;
  role: Role | string;
  staffId?: string;
}

export async function requireHospitalAccess(module: HospitalModule, action: HospitalAction = 'read'): Promise<HospitalAccess> {
  const user = await requireAuth('session_user');
  const hospitalId = user?.hospitalId;
  if (!hospitalId) throw new Error('UNAUTHORIZED');

  const role = user.role as Role | string;
  const defaultAllowed = ROLE_MODULES[role]?.includes(module) ?? false;
  if (!defaultAllowed) throw new Error('FORBIDDEN');

  const staffId = role === 'HOSPITAL_ADMIN' && user.id === hospitalId ? undefined : user.id;
  const override = await prisma.rolePermission.findFirst({
    where: {
      hospitalId,
      module,
      action,
      OR: [
        { staffId: staffId ?? null },
        { staffId: null, role: role as Role },
      ],
    },
    orderBy: { staffId: 'desc' },
  });

  if (override && !override.allowed) throw new Error('FORBIDDEN');
  return { user, hospitalId, role, staffId };
}

export function hospitalAccessError(error: unknown) {
  const message = error instanceof Error ? error.message : 'UNAUTHORIZED';
  if (message === 'FORBIDDEN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function writeAuditLog(input: {
  hospitalId?: string | null;
  userId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      hospitalId: input.hospitalId ?? undefined,
      userId: input.userId ?? 'system',
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      details: (input.details ?? {}) as any,
    },
  });
}
