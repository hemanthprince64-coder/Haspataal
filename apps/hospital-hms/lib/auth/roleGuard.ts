import { verifyToken } from './jwt';

export type Role = 'admin' | 'doctor' | 'receptionist' | 'lab_tech';

export const Roles = {
  ADMIN: 'admin' as Role,
  DOCTOR: 'doctor' as Role,
  RECEPTIONIST: 'receptionist' as Role,
  LAB_TECH: 'lab_tech' as Role,
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
