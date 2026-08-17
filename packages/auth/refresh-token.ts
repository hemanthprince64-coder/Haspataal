import { SignJWT, jwtVerify } from 'jose';

import { cookies } from 'next/headers';

function getSecretKey() {
  const secretKey = process.env.NEXTAUTH_SECRET;
  if (!secretKey) {
    // Only allow dummy secret during Next.js static build phase if absolutely necessary, but fail in runtime
    if (process.env.npm_lifecycle_event === 'build') {
      return new TextEncoder().encode('dummy-secret-for-build-purposes-only');
    }
    throw new Error('NEXTAUTH_SECRET is not defined');
  }
  return new TextEncoder().encode(secretKey);
}

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
    .sign(getSecretKey());

  return { token, familyId };
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
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
