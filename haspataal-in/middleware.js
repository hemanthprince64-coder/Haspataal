import { auth } from "@/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')

    if (isOnDashboard) {
        if (isLoggedIn) return true
        return Response.redirect(new URL('/login', req.nextUrl))
    } else if (isLoggedIn) {
        // Redirect to dashboard if already logged in and trying to visit login
        // ... logic if needed
    }
    return true
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
