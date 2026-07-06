import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { verifyToken } from './lib/auth/jwt';

export async function middleware(req: Request) {
  const url = new URL(req.url);

  // Bypass middleware for authentication routes and the dashboard-test which has its own auth
  if (
    url.pathname.startsWith('/api/hospital/auth') ||
    url.pathname.startsWith('/api/auth') ||
    url.pathname.startsWith('/api/hospital/dashboard-test')
  ) {
    return NextResponse.next();
  }

  const token =
    req.headers.get('authorization')?.split(' ')[1] ?? (await cookies()).get('auth-token')?.value;

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

    // Wave 2: Context Normalization
    // Inject canonical platform contexts for downstream engine evaluation
    const requestHeaders = new Headers(req.headers);
    
    // Construct TenantContext
    const tenantContext = {
      platformId: 'haspataal-core',
      hospitalId: user.hospital_id,
      branchId: 'default',
      activeScope: 'HOSPITAL',
    };
    
    // Construct ActorContext
    const actorContext = {
      actorId: user.user_id,
      actorType: 'USER',
      userId: user.user_id,
      roleIds: [user.role],
      permissionIds: [], // Populated downstream if needed
      authenticationStrength: 'PASSWORD',
      delegatedAccess: false,
    };
    
    requestHeaders.set('x-tenant-context', JSON.stringify(tenantContext));
    requestHeaders.set('x-actor-context', JSON.stringify(actorContext));

    // Subscription Check (Mock)
    // if (user.role === 'admin' && !user.subscription_active) return redirect...

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  } catch (error) {
    if (req.url.includes('/api/')) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/patients/:path*'],
};
