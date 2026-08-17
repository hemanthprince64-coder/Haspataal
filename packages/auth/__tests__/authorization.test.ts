import { UserRole } from '@haspataal/types';
import { describe, it, expect } from 'vitest';

import { Permission } from '../authorization/permission';
import { hasPermission } from '../authorization/policy';

describe('RBAC Policy Matrix', () => {
  it('should allow DOCTOR to have EMR_EDIT', () => {
    expect(hasPermission(UserRole.DOCTOR, Permission.EMR_EDIT)).toBe(true);
  });

  it('should prevent PATIENT from having EMR_EDIT', () => {
    expect(hasPermission(UserRole.PATIENT, Permission.EMR_EDIT)).toBe(false);
  });

  it('should allow HOSPITAL_ADMIN to have DOCTOR_MANAGE', () => {
    expect(hasPermission(UserRole.HOSPITAL_ADMIN, Permission.DOCTOR_MANAGE)).toBe(true);
  });

  it('should allow SUPER_ADMIN to have REPORTS_VIEW', () => {
    expect(hasPermission(UserRole.SUPER_ADMIN, Permission.REPORTS_VIEW)).toBe(true);
  });

  it('should deny unknown roles', () => {
    expect(hasPermission('UNKNOWN_ROLE' as UserRole, Permission.PATIENT_VIEW)).toBe(false);
  });

  it('should deny undefined permissions', () => {
    // If somehow an undefined permission is passed in
    expect(hasPermission(UserRole.DOCTOR, undefined as any)).toBe(false);
  });
});
