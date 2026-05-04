import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: Next.js middleware runs on the Edge runtime.
// The `ioredis` package used in Server Actions relies on Node.js net/tls modules
// and cannot be used directly in middleware.ts.
// For full rate-limiting at the Edge, consider using an HTTP-based Redis client like @upstash/redis.

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only apply to /api/* routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // These headers are placeholders demonstrating where Edge-based rate limiting logic would inject results.
    // Real implementation would require an HTTP-based Redis check here.
    const remaining = '99'; // Dummy value
    const resetAt = new Date(Date.now() + 60000).toISOString();

    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', remaining);
    response.headers.set('X-RateLimit-Reset', resetAt);
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
