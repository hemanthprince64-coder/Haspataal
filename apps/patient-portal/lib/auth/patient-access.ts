import { redirect } from 'next/navigation';

import { requireAuth } from '@/lib/auth';

export async function requirePatientAccess() {
  let session = null;
  try {
    session = await requireAuth('session_patient');
  } catch (e) {
    // Session not found or invalid
  }

  if (!session || session.role !== 'PATIENT') {
    redirect('/login');
  }

  return { user: session };
}
