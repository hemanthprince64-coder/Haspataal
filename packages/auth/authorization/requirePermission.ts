import { requireAuth } from '../auth';
import { Permission } from './permission';
import { hasPermission } from './policy';

/**
 * Checks if the current authenticated user has the specified permission.
 * This is the recommended way to protect fine-grained Server Actions and API Routes.
 *
 * @param permission The Permission required for this action
 * @param sessionName Cookie name for the session (default 'session')
 * @returns The authenticated user payload
 * @throws Error if unauthorized or forbidden
 */
export async function requirePermission(permission: Permission, sessionName = 'session') {
  const user = await requireAuth(sessionName);

  if (!hasPermission(user.role, permission)) {
    throw new Error(`Forbidden: Role ${user.role} lacks permission ${permission}`);
  }

  return user;
}
