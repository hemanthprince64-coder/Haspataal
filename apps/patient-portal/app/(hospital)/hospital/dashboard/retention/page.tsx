import { requireRole } from '@/lib/auth/requireRole';
import { UserRole } from '@/types';

import RetentionDetailsClient from './RetentionDetailsClient';

export default async function RetentionPage() {
  const user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], 'session_user');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Retention & Marketing</h1>
        <p className="text-sm text-slate-500 mt-1">
          Deep dive into patient recovery, follow-ups, and recall campaigns.
        </p>
      </div>

      <RetentionDetailsClient hospitalId={user.hospitalId as string} />
    </div>
  );
}
