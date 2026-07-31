import { requirePatientAccess } from '@/lib/auth/patient-access';

import AppointmentsClient from './AppointmentsClient';

export default async function AppointmentsPage() {
  await requirePatientAccess();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          My Appointments
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          View your upcoming and past appointments.
        </p>
      </div>

      <AppointmentsClient />
    </div>
  );
}
