import { jwtVerify, JWTPayload } from 'jose';

import logger from '@/lib/logger';

// Define the shape of our Session User to match what's in lib/session.ts
export interface SessionUser {
  id: string;
  name: string;
  role: string;
  hospitalId?: string;
  doctorId?: string;
  mobile?: string;
  [key: string]: unknown;
}

export interface SessionPayload extends JWTPayload {
  user: SessionUser;
  expiresAt: string | Date;
}

/**
 * Returns the application secret key for JWT signing/verification.
 */
function getSecretKey(): Uint8Array {
  const secretKey = process.env.NEXTAUTH_SECRET;
  if (!secretKey) {
    throw new Error('NEXTAUTH_SECRET is required for session signing');
  }
  return new TextEncoder().encode(secretKey);
}

/**
 * Verify a JWT session token at the Edge (Middleware).
 * Performs strict validation on signature, expiration, and iat.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256'],
    });

    if (!payload.user || typeof payload.user !== 'object') {
      logger.warn('[Edge Auth] Invalid token payload structure: missing user object');
      return null;
    }

    const user = payload.user as SessionUser;

    if (!user.role) {
      logger.warn('[Edge Auth] Invalid token payload: missing role claim');
      return null;
    }

    return payload as SessionPayload;
  } catch (error: any) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      logger.warn('[Edge Auth] Token expired');
    } else {
      logger.warn('[Edge Auth] Token verification failed:', error.message);
    }
    return null;
  }
}
