import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

// Very basic in-memory rate limiting (per Edge isolate instance)
const ratelimit = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute per IP

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    // ── AUDIT LOGGING & RATE LIMITING ────────────────────────────
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    if (ip !== 'unknown') {
        const record = ratelimit.get(ip) || { count: 0, startTime: now };
        if (now - record.startTime > WINDOW_MS) {
            record.count = 1;
            record.startTime = now;
        } else {
            record.count += 1;
        }
        ratelimit.set(ip, record);

        if (record.count > MAX_REQUESTS) {
            console.warn(`[SECURITY AUDIT] Rate limit exceeded for IP: ${ip} on path: ${pathname}`);
            return new NextResponse('Too Many Requests', { status: 429 });
        }
    }

    // Basic Request Audit Log
    console.log(`[AUDIT LOG] ${request.method} ${pathname} - IP: ${ip}`);
    // ─────────────────────────────────────────────────────────────

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
