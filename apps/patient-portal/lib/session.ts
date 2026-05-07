import 'server-only';
import { jwtVerify } from 'jose';

const secretKey = process.env.NEXTAUTH_SECRET;
// In production, we require the secret. During build (NEXT_PHASE) or CI, we can skip or use a dummy.
if (!secretKey && process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
  throw new Error('NEXTAUTH_SECRET is required for session signing');
}
const key = new TextEncoder().encode(secretKey || 'dummy-secret-for-build-purposes-only');

interface SessionPayload {
  user: {
    id: string;
    name: string;
    role: string;
    [key: string]: any; // Allow extended claims like hospitalId
  };
  expiresAt: Date;
  [key: string]: any;
}

export async function decrypt(session: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}