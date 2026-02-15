import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { ROLES } from "@/lib/permissions";
import { authRateLimit, bookingRateLimit, searchRateLimit } from "@/lib/ratelimit";

export default auth(async (req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;
    const user = req.auth?.user;
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

    // 0. Rate Limiting
    try {
        if (nextUrl.pathname.startsWith('/api/auth')) {
            const { success } = await authRateLimit.limit(ip);
            if (!success) return new NextResponse("Too Many Requests", { status: 429 });
        }
        if (nextUrl.pathname.startsWith('/api/booking') || nextUrl.pathname.startsWith('/book')) {
            // For booking, maybe limit by User ID if logged in, else IP
            const identifier = user ? user.id : ip;
            const { success } = await bookingRateLimit.limit(identifier);
            if (!success) return new NextResponse("Too Many Requests", { status: 429 });
        }
        if (nextUrl.pathname.startsWith('/search') || nextUrl.pathname.startsWith('/api/doctors')) {
            const { success } = await searchRateLimit.limit(ip);
            if (!success) return new NextResponse("Too Many Requests", { status: 429 });
        }
    } catch (e) {
        console.error("Rate limit error", e);
        // Fail open if Redis is down? Or block? Usually fail open for UX.
    }

    // 1. Redirect to login if not logged in
    // ... rest of RBAC logic ...
    // Exclude public routes (search, home, register, etc.) if needed via matcher, 
    // but here we check verified blocks.

    // 2. Dashboard Access (Hospital Side)
    if (nextUrl.pathname.startsWith('/dashboard')) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));

        // Doctor Dashboard
        if (nextUrl.pathname.startsWith('/dashboard/doctor')) {
            if (user.role !== ROLES.DOCTOR) return NextResponse.redirect(new URL('/login/doctor', nextUrl));
            return NextResponse.next();
        }

        // Hospital Admin (Root Dashboard or Staff Management)
        if (user.role === ROLES.HOSPITAL_ADMIN || user.role === ROLES.SUPER_ADMIN) {
            return NextResponse.next();
        }

        // Restrict others (Receptionist/Nurse) from Admin Dashboard for now
        // functionality for them will be added later or on specific routes
        return NextResponse.redirect(new URL('/', nextUrl));
    }

    // 3. Admin Routes (Super Admin)
    if (nextUrl.pathname.startsWith('/admin')) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
        if (user.role !== ROLES.SUPER_ADMIN) return NextResponse.redirect(new URL('/', nextUrl));
    }

    // 4. Booking/Profile (Patient) - generally open to authenticated users
    if (nextUrl.pathname.startsWith('/profile') || nextUrl.pathname.startsWith('/book')) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/dashboard/:path*', '/profile/:path*', '/book/:path*', '/admin/:path*']
};
