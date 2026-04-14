import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

import redis from '@/lib/redis';

// Redis-backed rate limiting constants
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute per IP

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    // ── AUDIT LOGGING & RATE LIMITING (Redis Backed) ──────────────
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowKey = Math.floor(now / WINDOW_MS);
    const redisKey = `ratelimit:${ip}:${windowKey}`;

    let isBlocked = false;
    let currentCount = 0;

    if (ip !== 'unknown') {
        try {
            // Atomic increment and expire
            const multi = redis.multi();
            multi.incr(redisKey);
            multi.expire(redisKey, 65); // Slightly longer than window for stability
            
            const results = await multi.exec();
            if (results && results[0]) {
                currentCount = results[0][1];
            }

            if (currentCount > MAX_REQUESTS) {
                console.warn(`[SECURITY AUDIT] Redis-backed Rate limit exceeded for IP: ${ip} on path: ${pathname} (Count: ${currentCount})`);
                isBlocked = true;
            }
        } catch (error) {
            console.error('[REDIS RATE LIMIT ERROR]', error);
            // Fail open: don't block user if Redis is down, but log it
        }
    }

    if (isBlocked) {
        return new NextResponse('Too Many Requests', { status: 429 });
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
        try {
            const payload = await decrypt(session);
            const role = payload?.user?.role;
            if (role !== 'AGENT') {
                return NextResponse.redirect(new URL('/agent/login', request.url));
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/agent/login', request.url));
        }
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
