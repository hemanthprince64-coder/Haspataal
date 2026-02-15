import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;
    const user = req.auth?.user;

    // Protect Dashboard Routes (Hospital Admin)
    if (nextUrl.pathname.startsWith('/dashboard')) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
        if (user.role !== 'HOSPITAL_ADMIN' && user.role !== 'SUPER_ADMIN') return NextResponse.redirect(new URL('/', nextUrl));
    }

    // Protect Admin Routes (Super Admin)
    if (nextUrl.pathname.startsWith('/admin')) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
        if (user.role !== 'SUPER_ADMIN') return NextResponse.redirect(new URL('/', nextUrl));
    }

    // Protect Patient Profile
    if (nextUrl.pathname.startsWith('/profile') || nextUrl.pathname.startsWith('/book')) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
        // allow both PATIENT and others? Generally booking is for patients.
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/dashboard/:path*', '/profile/:path*', '/book/:path*', '/admin/:path*']
};
