import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { verifySessionToken } from './lib/auth/edge-session';

// --- RBAC Configuration ---

const PUBLIC_ROUTES = [
  // Patient
  '/login',
  '/register',
  '/forgot-password',
];

const PROTECTED_ROUTES: Array<{ prefix: string; cookie: string; role: string; login: string }> = [];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const method = request.method;

  // --- 1. CSRF Protection (Mutating Routes) ---
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    const csrfCookie = request.cookies.get('csrf-token')?.value;
    const csrfHeader = request.headers.get('x-csrf-token');

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      const isServerAction = request.headers.get('next-action');
      if (!isServerAction) {
        return new NextResponse(JSON.stringify({ error: 'CSRF Token Mismatch or Missing' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return new NextResponse(JSON.stringify({ error: 'CSRF Origin Mismatch' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch (e) {
        return new NextResponse(JSON.stringify({ error: 'Invalid Origin Header' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else if (!origin && process.env.NODE_ENV === 'production') {
      return new NextResponse(JSON.stringify({ error: 'Missing Origin Header' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // --- 2. CSRF Token Setup (GET/HEAD) ---
  const response = NextResponse.next();
  if (['GET', 'HEAD'].includes(method)) {
    if (!request.cookies.has('csrf-token')) {
      const token = crypto.randomUUID();
      response.cookies.set('csrf-token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }
  }

  // --- 3. Role-Based Authorization ---

  // Skip API routes from RBAC (handled by API route logic internally for MVP)
  if (pathname.startsWith('/api/')) {
    return response;
  }

  // Check if exactly matching a public route or root
  if (PUBLIC_ROUTES.includes(pathname) || pathname === '/') {
    return response;
  }

  // Find matching protected route config
  const matchedRoute = PROTECTED_ROUTES.find((route) => pathname.startsWith(route.prefix));

  if (matchedRoute) {
    const token = request.cookies.get(matchedRoute.cookie)?.value;

    if (!token) {
      console.warn(
        `[Edge Auth] Missing session cookie for ${pathname} (expected ${matchedRoute.cookie})`,
      );
      const redirectUrl = new URL(matchedRoute.login, request.url);
      redirectUrl.searchParams.set('next', pathname + search);
      return NextResponse.redirect(redirectUrl);
    }

    const session = await verifySessionToken(token);

    if (!session) {
      console.warn(`[Edge Auth] Invalid/Expired session for ${pathname}`);
      const redirectUrl = new URL(matchedRoute.login, request.url);
      redirectUrl.searchParams.set('next', pathname + search);
      return NextResponse.redirect(redirectUrl);
    }

    if (session.user.role !== matchedRoute.role) {
      console.warn(
        `[Edge Auth] Role mismatch for ${pathname}. Expected ${matchedRoute.role}, got ${session.user.role}`,
      );
      const redirectUrl = new URL(matchedRoute.login, request.url);
      redirectUrl.searchParams.set('next', pathname + search);
      return NextResponse.redirect(redirectUrl);
    }

    // Ensure Hospital Admins have a hospital context
    if (matchedRoute.role === 'HOSPITAL_ADMIN' && !session.user.hospitalId) {
      console.warn(`[Edge Auth] Missing hospitalId in token for ${pathname}`);
      const redirectUrl = new URL(matchedRoute.login, request.url);
      redirectUrl.searchParams.set('next', pathname + search);
      return NextResponse.redirect(redirectUrl);
    }

    // Ensure Doctors have a doctor context
    if (matchedRoute.role === 'DOCTOR' && !session.user.doctorId) {
      console.warn(`[Edge Auth] Missing doctorId in token for ${pathname}`);
      const redirectUrl = new URL(matchedRoute.login, request.url);
      redirectUrl.searchParams.set('next', pathname + search);
      return NextResponse.redirect(redirectUrl);
    }
  } else {
    // Patient Routes Catch-All
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/appointments')
    ) {
      const token = request.cookies.get('session_patient')?.value;

      if (!token) {
        console.warn(`[Edge Auth] Missing patient session cookie for ${pathname}`);
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('next', pathname + search);
        return NextResponse.redirect(redirectUrl);
      }

      const session = await verifySessionToken(token);
      if (!session || session.user.role !== 'PATIENT') {
        console.warn(`[Edge Auth] Invalid/Expired patient session for ${pathname}`);
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('next', pathname + search);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
