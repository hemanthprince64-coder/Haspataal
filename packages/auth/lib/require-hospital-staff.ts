import { UserRole } from '@haspataal/types';

import { requireAuth } from '../auth';

export const HOSPITAL_STAFF_ROLES = [
  UserRole.HOSPITAL_ADMIN,
  UserRole.DOCTOR,
  UserRole.RECEPTIONIST,
  UserRole.NURSE,
  UserRole.PHARMACIST,
  UserRole.LAB_TECH,
  UserRole.BILLING,
  UserRole.STAFF,
];

/**
 * Reusable predicate that verifies:
 * - Active account
 * - Hospital assignment
 * - Tenant membership
 * - Not suspended
 * - Has valid hospital staff role
 */
export async function requireHospitalStaff(sessionName = 'session_user') {
  const user = await requireAuth(sessionName);

  if (!user.hospitalId) {
    throw new Error('Unauthorized: No hospital assignment');
  }

  if (!HOSPITAL_STAFF_ROLES.includes(user.role as UserRole)) {
    throw new Error(`Unauthorized: Role ${user.role} is not authorized for hospital access`);
  }

  if (user.status && user.status === 'suspended') {
    throw new Error('Unauthorized: Account is suspended');
  }

  return user;
}
