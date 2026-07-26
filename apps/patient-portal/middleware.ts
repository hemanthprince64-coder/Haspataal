import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const method = request.method;
  const response = NextResponse.next();

  // For GET/HEAD requests, ensure a CSRF cookie exists so the client can read it
  if (['GET', 'HEAD'].includes(method)) {
    if (!request.cookies.has('csrf-token')) {
      const token = crypto.randomUUID();
      response.cookies.set('csrf-token', token, {
        httpOnly: false, // Must be readable by client JS to send in header
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }
    return response;
  }

  // Enforce CSRF protection on mutating routes
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    const csrfCookie = request.cookies.get('csrf-token')?.value;
    const csrfHeader = request.headers.get('x-csrf-token');

    // 1. Double Submit Cookie Pattern
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      // In a real strict implementation, we'd block this.
      // But Server Actions don't naturally send x-csrf-token unless we manually intercept `fetch`.
      // Let's enforce it strictly, but allow Next.js built-in Server Action origin protection as a fallback if the header is missing but Origin matches perfectly.
      const isServerAction = request.headers.get('next-action');

      if (!isServerAction) {
        return new NextResponse(JSON.stringify({ error: 'CSRF Token Mismatch or Missing' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 2. Strict Origin Matching (Defense in Depth)
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
      // In production, strictly require Origin header for mutating requests
      return new NextResponse(JSON.stringify({ error: 'Missing Origin Header' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
