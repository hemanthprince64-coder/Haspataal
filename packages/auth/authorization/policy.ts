import { UserRole } from '@haspataal/types';

import { Permission } from './permission';

export const ROLE_PERMISSIONS = new Map<UserRole, ReadonlySet<Permission>>([
  [
    UserRole.PATIENT,
    new Set([
      Permission.PATIENT_VIEW,
      Permission.PATIENT_EDIT,
      Permission.APPOINTMENT_CREATE,
      Permission.APPOINTMENT_VIEW,
      Permission.APPOINTMENT_CANCEL,
      Permission.EMR_VIEW,
      Permission.BILLING_VIEW,
      Permission.DOCTOR_VIEW,
      Permission.CONSULTATION_VIEW,
    ]),
  ],
  [
    UserRole.DOCTOR,
    new Set([
      Permission.PATIENT_VIEW,
      Permission.APPOINTMENT_VIEW,
      Permission.APPOINTMENT_UPDATE,
      Permission.CONSULTATION_CREATE,
      Permission.CONSULTATION_VIEW,
      Permission.EMR_VIEW,
      Permission.EMR_EDIT,
      Permission.SCHEDULE_VIEW,
      Permission.SCHEDULE_MANAGE,
    ]),
  ],
  [
    UserRole.HOSPITAL_ADMIN,
    new Set([
      Permission.PATIENT_VIEW,
      Permission.APPOINTMENT_CREATE,
      Permission.APPOINTMENT_VIEW,
      Permission.APPOINTMENT_UPDATE,
      Permission.APPOINTMENT_CANCEL,
      Permission.CONSULTATION_VIEW,
      Permission.EMR_VIEW,
      Permission.SCHEDULE_VIEW,
      Permission.SCHEDULE_MANAGE,
      Permission.BILLING_VIEW,
      Permission.BILLING_EDIT,
      Permission.DOCTOR_VIEW,
      Permission.DOCTOR_MANAGE,
      Permission.HOSPITAL_SETTINGS,
      Permission.REPORTS_VIEW,
    ]),
  ],
  [
    UserRole.SUPER_ADMIN,
    new Set([
      // Super Admin effectively has all permissions, but explicitly listed for clarity
      Permission.PATIENT_VIEW,
      Permission.PATIENT_EDIT,
      Permission.APPOINTMENT_CREATE,
      Permission.APPOINTMENT_VIEW,
      Permission.APPOINTMENT_UPDATE,
      Permission.APPOINTMENT_CANCEL,
      Permission.CONSULTATION_CREATE,
      Permission.CONSULTATION_VIEW,
      Permission.EMR_VIEW,
      Permission.EMR_EDIT,
      Permission.SCHEDULE_VIEW,
      Permission.SCHEDULE_MANAGE,
      Permission.BILLING_VIEW,
      Permission.BILLING_EDIT,
      Permission.DOCTOR_VIEW,
      Permission.DOCTOR_MANAGE,
      Permission.HOSPITAL_SETTINGS,
      Permission.REPORTS_VIEW,
    ]),
  ],
  // You can expand agent, receptionist, etc. here as needed
]);

export function hasPermission(role: UserRole | string, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS.get(role as UserRole);
  if (!rolePermissions) return false;
  return rolePermissions.has(permission);
}
