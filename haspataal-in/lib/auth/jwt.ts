import { SignJWT, jwtVerify } from 'jose';

export type AuthTokenPayload = {
  user_id: string;
  hospital_id: string;
  role: string;
  global_patient_id?: string;
  hospital_patient_id?: string;
};

function getSecretKey() {
  const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!jwtSecret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET must be set in production');
  }
  return new TextEncoder().encode(jwtSecret || 'dummy-dev-secret');
}

export async function generateToken(user: any) {
  return await new SignJWT({
    user_id: user.id,
    hospital_id: user.hospital_id,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(getSecretKey());
}

export async function verifyToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, getSecretKey());
  return payload as unknown as AuthTokenPayload;
}
