import { SignJWT, jwtVerify } from 'jose';

import { cookies } from 'next/headers';

const secretKey = process.env.NEXTAUTH_SECRET;
// NEXTAUTH_SECRET throw removed to allow Next.js static build to succeed
const key = new TextEncoder().encode(secretKey || 'dummy-secret-for-build-purposes-only');

interface RefreshTokenPayload {
  sub: string;
  role: string;
  hospitalId?: string;
  tokenFamily: string;
  [key: string]: any;
}

export async function createRefreshToken(user: {
  id: string;
  role: string;
  hospitalId?: string;
}): Promise<{ token: string; familyId: string }> {
  const familyId = crypto.randomUUID();
  const payload: RefreshTokenPayload = {
    sub: user.id,
    role: user.role,
    hospitalId: user.hospitalId,
    tokenFamily: familyId,
    type: 'refresh',
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);

  return { token, familyId };
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload as RefreshTokenPayload;
  } catch {
    return null;
  }
}

export async function rotateRefreshToken(
  oldToken: string,
): Promise<{ newToken: string; familyId: string } | null> {
  const payload = await verifyRefreshToken(oldToken);
  if (!payload || payload.type !== 'refresh') {
    return null;
  }

  const { token: newToken } = await createRefreshToken({
    id: payload.sub,
    role: payload.role,
    hospitalId: payload.hospitalId,
  });

  return { newToken, familyId: payload.tokenFamily };
}

export async function setRefreshCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export async function deleteRefreshCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('refresh_token');
}
