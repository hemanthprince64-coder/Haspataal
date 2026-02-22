import 'server-only';
import { verifySession } from '../session';
import { UserRole } from '../../types';
import logger from '../logger';

/**
 * Server-only middleware guard to strictly enforce RBAC.
 * @param role Single UserRole or Array of allowed UserRoles
 * @param sessionCookieName Name of the cookie storing the JWT (e.g. 'admin_session', 'hospital_session', 'patient_session')
 * @throws Error if unauthenticated or if the role doesn't match
 */
export async function requireRole(allowedRoles: UserRole | UserRole[], sessionCookieName: string) {
    const session = await verifySession(sessionCookieName);

    if (!session || !session.isAuth) {
        logger.warn({ action: 'unauthenticated_access', sessionCookieName }, 'Unauthenticated access attempt blocked by requireRole');
        throw new Error('UNAUTHORIZED');
    }

    const { user } = session;
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesArray.includes(user.role)) {
        logger.warn({
            action: 'role_denied',
            userId: user.id,
            attemptedRole: user.role,
            requiredRoles: rolesArray,
            sessionType: sessionCookieName
        }, `Access blocked: Role ${user.role} attempted to access restricted resource requiring ${rolesArray.join(' or ')}`);

        throw new Error('FORBIDDEN');
    }

    return user;
}
