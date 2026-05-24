import { redirect } from 'next/navigation';

import { requireRole } from '@/lib/auth/requireRole';
import { UserRole } from '@/types';

/**
 * Full-screen setup wizard layout — intentionally minimal.
 * No sidebar, no nav chrome. The wizard owns the entire viewport.
 * Once setup is complete, the user is redirected to /hospital/dashboard.
 */
export default async function SetupWizardLayout({ children }: { children: React.ReactNode }) {
  // Ensure the user is authenticated as a hospital admin
  try {
    await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], 'session_user');
  } catch {
    redirect('/hospital/login');
  }

  return <>{children}</>;
}
