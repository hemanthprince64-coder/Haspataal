import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/admin/dashboard')) {
        const session = request.cookies.get('session_admin')?.value;
        if (!session) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }

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

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/dashboard/:path*']
};
