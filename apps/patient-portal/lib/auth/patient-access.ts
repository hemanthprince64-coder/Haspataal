import { requireAuth } from '@/lib/auth';

export async function requirePatientAccess() {
  const session = await requireAuth('session_patient');
  if (!session || session.role !== 'PATIENT') {
    throw new Error('UNAUTHORIZED');
  }
  return { user: session };
}
