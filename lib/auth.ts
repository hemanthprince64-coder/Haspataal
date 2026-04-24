import { cookies } from 'next/headers';
import { decrypt } from './session';
import { UserRole } from '../types';

export async function requireAuth(sessionName: string) {
    const cookieStore = await cookies();
    const session = cookieStore.get(sessionName)?.value;
    if (!session) throw new Error('Unauthorized: No session found');

    const payload = await decrypt(session);
    if (!payload || !payload.user) throw new Error('Unauthorized: Invalid session');

    return payload.user;
}

export async function requireRole(role: UserRole | UserRole[], sessionName: string) {
    const user = await requireAuth(sessionName);
    const roles = Array.isArray(role) ? role : [role];

    if (!roles.includes(user.role as UserRole)) {
        throw new Error(`Unauthorized: Role ${user.role} does not have access`);
    }

    return user;
}

export async function getHospitalIdFromSession(req: any) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session_user')?.value;
        if (!session) return null;

        const payload = await decrypt(session);
        if (!payload || !payload.user) return null;

        return payload.user.hospitalId || null;
    } catch {
        return null;
    }
}
