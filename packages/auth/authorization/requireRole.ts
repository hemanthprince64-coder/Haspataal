import { UserRole } from '@haspataal/types';

import { requireAuth } from '../auth';

/**
 * Checks if the current authenticated user has the specified role(s).
 * This is useful for simple macro-level access control (e.g. login pages, layouts).
 * For fine-grained feature access, use requirePermission() instead.
 *
 * @param role Single UserRole or array of UserRoles
 * @param sessionName Cookie name for the session
 * @returns The authenticated user payload
 * @throws Error if unauthorized or forbidden
 */
export async function requireRole(role: UserRole | UserRole[], sessionName = 'session') {
  const user = await requireAuth(sessionName);
  const roles = Array.isArray(role) ? role : [role];

  if (!roles.includes(user.role as UserRole)) {
    throw new Error(`Forbidden: Role ${user.role} does not have access`);
  }

  return user;
}
