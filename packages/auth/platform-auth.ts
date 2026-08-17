import { cookies } from 'next/headers';

import { decrypt, verifySession } from './session';

export type AdminRole = 'PLATFORM_ADMIN' | 'NETWORK_ADMIN' | 'HOSPITAL_ADMIN';

export async function requirePlatformRole(role: AdminRole | AdminRole[]) {
  const session = await verifySession('session_admin');
  if (!session || !session.user) {
    throw new Error('Unauthorized: No session found');
  }

  const userRole = session.user.role as AdminRole;
  const roles = Array.isArray(role) ? role : [role];

  if (!roles.includes(userRole)) {
    throw new Error(`Unauthorized: Role ${userRole} does not have access`);
  }

  return session.user;
}

export async function withPlatformPermission(options: {
  scope: string;
  resource: string;
  action: string;
}) {
  const user = await verifySession('session_admin').then((s) => s?.user);
  if (!user) throw new Error('Unauthorized');

  // MVP: if PLATFORM_ADMIN, allow
  if ((user.role as string) === 'PLATFORM_ADMIN') return user;

  // In real implementation: check PlatformPermission table in DB using `user.id`, `scope`, `resource`, `action`
  throw new Error(
    `Forbidden: Lacks platform permission for ${options.scope}:${options.resource}:${options.action}`,
  );
}

export async function scopeContextMiddleware() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session_admin')?.value;
    if (!session) return { scope: 'PUBLIC', networkId: null };

    const payload = await decrypt(session);
    if (!payload || !payload.user) return { scope: 'PUBLIC', networkId: null };

    const role = payload.user.role;
    let scope = 'PUBLIC';
    if ((role as string) === 'PLATFORM_ADMIN') scope = 'PLATFORM';
    else if ((role as string) === 'NETWORK_ADMIN') scope = 'NETWORK';
    else if ((role as string) === 'HOSPITAL_ADMIN') scope = 'HOSPITAL';

    return {
      scope,
      networkId: payload.user.networkId || null,
    };
  } catch {
    return { scope: 'PUBLIC', networkId: null };
  }
}
