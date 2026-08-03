import { verifyToken } from './jwt';

export type Role =
  | 'super_admin'
  | 'admin'
  | 'doctor'
  | 'receptionist'
  | 'lab_tech'
  | 'nurse'
  | 'pharmacist'
  | 'billing'
  | 'patient';

export const Roles = {
  SUPER_ADMIN: 'super_admin' as Role,
  ADMIN: 'admin' as Role,
  DOCTOR: 'doctor' as Role,
  RECEPTIONIST: 'receptionist' as Role,
  LAB_TECH: 'lab_tech' as Role,
  NURSE: 'nurse' as Role,
  PHARMACIST: 'pharmacist' as Role,
  BILLING: 'billing' as Role,
  PATIENT: 'patient' as Role,
};

export async function checkRole(req: Request, allowedRoles: Role[]) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }

  try {
    const user = await verifyToken(token);
    if (!allowedRoles.includes(user.role as Role)) {
      throw new Error(`Forbidden: Role ${user.role} not allowed`);
    }
    return user;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Forbidden')) {
      throw error;
    }
    throw new Error('Unauthorized: Invalid token');
  }
}

// Temporary Permission Mapping for MVP
const RolePermissions: Record<string, string[]> = {
  [Roles.SUPER_ADMIN]: ['*'],
  [Roles.ADMIN]: ['*'],
  [Roles.PHARMACIST]: ['PHARMACY_VIEW', 'PHARMACY_VERIFY', 'PHARMACY_DISPENSE', 'PHARMACY_CANCEL'],
  [Roles.DOCTOR]: [
    'PHARMACY_VIEW',
    'PHARMACY_CANCEL', // Doctors can cancel their prescriptions
  ],
};

export async function requirePermission(req: Request, permission: string) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) throw new Error('Unauthorized: No token provided');

  try {
    const user = await verifyToken(token);
    const userRole = user.role;
    const permissions = RolePermissions[userRole] || [];

    if (!permissions.includes('*') && !permissions.includes(permission)) {
      throw new Error(`Forbidden: Missing permission ${permission}`);
    }
    return user;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Forbidden')) {
      throw error;
    }
    throw new Error('Unauthorized: Invalid token');
  }
}
