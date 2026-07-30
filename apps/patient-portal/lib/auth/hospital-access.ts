/* eslint-disable @typescript-eslint/no-unused-vars */
import { hasPermission, Permission } from '@haspataal/auth';
import 'server-only';

import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import type { UserRole } from '../../types';

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
  | 'staff'
  | 'radiology'
  | 'procedure';

type HospitalAction =
  | 'read'
  | 'write'
  | 'create'
  | 'update'
  | 'delete'
  | 'activate'
  | 'pay'
  | 'finalize'
  | 'discharge'
  | 'manage_schedule';

const ROLE_MODULES: Record<string, HospitalModule[]> = {
  SUPER_ADMIN: [
    'admin',
    'setup',
    'opd',
    'ipd',
    'billing',
    'pharmacy',
    'diagnostics',
    'notifications',
    'retention',
    'marketplace',
    'integrations',
    'staff',
  ],
  HOSPITAL_ADMIN: [
    'admin',
    'setup',
    'opd',
    'ipd',
    'billing',
    'pharmacy',
    'diagnostics',
    'notifications',
    'retention',
    'marketplace',
    'integrations',
    'staff',
  ],
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
  role: UserRole | string;
  staffId?: string;
}

export async function requireHospitalAccess(
  module: HospitalModule,
  action: HospitalAction = 'read',
): Promise<HospitalAccess> {
  const user = await requireAuth('session_user');
  const hospitalId = user?.hospitalId;
  if (!hospitalId) throw new Error('UNAUTHORIZED');

  const role = user.role as UserRole | string;

  // Delegate to new permission matrix
  let permissionToCheck = Permission.HOSPITAL_SETTINGS; // default fallback

  if (module === 'opd' && action === 'manage_schedule')
    permissionToCheck = Permission.SCHEDULE_MANAGE;
  else if (module === 'opd')
    permissionToCheck = action === 'read' ? Permission.SCHEDULE_VIEW : Permission.SCHEDULE_MANAGE;
  else if (module === 'billing')
    permissionToCheck = action === 'read' ? Permission.BILLING_VIEW : Permission.BILLING_EDIT;
  else if (module === 'diagnostics')
    permissionToCheck = action === 'read' ? Permission.EMR_VIEW : Permission.EMR_EDIT;
  else if (module === 'ipd')
    permissionToCheck = action === 'read' ? Permission.EMR_VIEW : Permission.EMR_EDIT;

  const isAllowed = hasPermission(role as UserRole, permissionToCheck);

  // If the new matrix denies access, but it's a legacy check, we might want to check DB overrides
  // if this is a STAFF role. For MVP, we trust the new policy matrix as authoritative.
  if (!isAllowed) {
    throw new Error('FORBIDDEN');
  }

  const staffId = role === 'HOSPITAL_ADMIN' && user.id === hospitalId ? undefined : user.id;
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
