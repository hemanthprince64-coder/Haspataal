import { cookies } from 'next/headers';
import { decrypt } from './session';

export async function requireAuth(sessionName: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get(sessionName)?.value;
  if (!session) throw new Error('Unauthorized: No session found');

  const payload = await decrypt(session);
  if (!payload || !payload.user) throw new Error('Unauthorized: Invalid session');

  return payload.user;
}

export async function getHospitalIdFromSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session_user')?.value;
    if (!session) return null;

    const payload = await decrypt(session);
    if (!payload || !payload.user) return null;

    return payload.user.hospitalId || null;
  } catch {
    return null;
  }
}
