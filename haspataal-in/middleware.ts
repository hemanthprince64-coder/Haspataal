
import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

export async function middleware(req: Request) {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        // If accessing API routes, return JSON error
        if (req.url.includes('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // Otherwise redirect to login
        return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
        const user = await verifyToken(token);

        // Subscription Check (Mock)
        // In production, we'd check DB or cached status here.
        // if (user.role === 'admin' && !user.subscription_active) return redirect...

        return NextResponse.next();
    } catch (error) {
        if (req.url.includes('/api/')) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', req.url));
    }
}

export const config = {
    matcher: [
        '/api/:path*',
        '/dashboard/:path*',
        '/patients/:path*'
    ],
};
