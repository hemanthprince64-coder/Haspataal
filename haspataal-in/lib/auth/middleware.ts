import { verifyToken } from './jwt';
import { NextResponse } from 'next/server';

export async function requireAuth(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Unauthorized', status: 401 };
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = await verifyToken(token);
        return { user: decoded };
    } catch (e) {
        return { error: 'Invalid token', status: 401 };
    }
}

export async function requireRole(req: Request, allowedRoles: string[]) {
    const auth = await requireAuth(req);
    if (auth.error) return auth;

    if (!allowedRoles.includes(auth.user.role)) {
        return { error: 'Forbidden', status: 403 };
    }
    return auth;
}

export const requireHospital = (req: Request) => requireRole(req, ['hospital_admin', 'admin', 'super_admin']);
export const requireAdmin = (req: Request) => requireRole(req, ['admin', 'super_admin']);
