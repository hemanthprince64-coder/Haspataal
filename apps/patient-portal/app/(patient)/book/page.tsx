import { requirePatientAccess } from '@/lib/auth/patient-access';

import BookingWizardClient from './BookingWizardClient';

export default async function BookingPage({
  searchParams,
}: {
  searchParams: { doctorId?: string; hospitalId?: string };
}) {
  await requirePatientAccess();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Book Appointment
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Follow the steps to schedule your visit.
        </p>
      </div>

      <BookingWizardClient
        initialDoctorId={searchParams.doctorId}
        initialHospitalId={searchParams.hospitalId}
      />
    </div>
  );
}
