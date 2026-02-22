import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { UserRole } from '../types'

const secretKey = process.env.SESSION_SECRET || 'default-secret-key-change-me-in-prod-1234567890'
const key = new TextEncoder().encode(secretKey)

interface SessionPayload {
    user: {
        id: string;
        name: string;
        role: UserRole;
        [key: string]: any; // Allow extended claims like hospitalId
    };
    expiresAt: Date;
    [key: string]: any;
}

export async function encrypt(payload: any): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key)
}

export async function decrypt(session: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(session, key, {
            algorithms: ['HS256'],
        })
        return payload as SessionPayload
    } catch (error) {
        return null
    }
}

export async function createSession(name: string, data: { user: { id: string; name: string; role: UserRole;[key: string]: any } }): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await encrypt({ ...data, expiresAt })
    const cookieStore = await cookies()

    cookieStore.set(name, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })
}

export async function verifySession(name: string): Promise<{ isAuth: true; user: SessionPayload['user'] } | null> {
    const cookieStore = await cookies()
    const cookie = cookieStore.get(name)?.value
    if (!cookie) return null;

    const session = await decrypt(cookie)

    if (!session?.user) {
        return null
    }

    return { isAuth: true, user: session.user }
}

export async function deleteSession(name: string): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(name)
}
