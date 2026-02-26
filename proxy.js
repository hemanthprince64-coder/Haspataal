import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    // Platform Admin Protection
    if (pathname.startsWith('/admin/dashboard')) {
        const session = request.cookies.get('session_admin')?.value;
        if (!session) return NextResponse.redirect(new URL('/admin', request.url));
        try {
            const payload = await decrypt(session);
            const role = payload?.user?.role;
            if (role !== 'PLATFORM_ADMIN' && role !== 'SUPER_ADMIN') {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    // Hospital/Doctor Protection
    if (pathname.startsWith('/hospital/dashboard')) {
        const session = request.cookies.get('session_user')?.value;
        if (!session) return NextResponse.redirect(new URL('/hospital/login', request.url));
        try {
            const payload = await decrypt(session);
            const role = payload?.user?.role;
            if (role !== 'HOSPITAL_ADMIN' && role !== 'DOCTOR' && role !== 'RECEPTIONIST') {
                return NextResponse.redirect(new URL('/hospital/login', request.url));
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/hospital/login', request.url));
        }
    }

    // Agent Protection
    if (pathname.startsWith('/agent/dashboard')) {
        const session = request.cookies.get('session_agent')?.value;
        if (!session) return NextResponse.redirect(new URL('/agent/login', request.url));
        // role check optional, relying on session existence for agent
    }

    // Patient Protection
    if (pathname.startsWith('/profile') || pathname === '/book') {
        const session = request.cookies.get('session_patient')?.value;
        if (!session) return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/dashboard/:path*',
        '/hospital/dashboard/:path*',
        '/agent/dashboard/:path*',
        '/profile/:path*',
        '/book'
    ]
};
