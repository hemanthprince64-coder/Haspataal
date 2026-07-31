 
import { requireHospitalAccess } from '@/lib/auth/hospital-access';
import { prisma } from '@/lib/prisma';

import ScheduleClient from './schedule-client';

export default async function DoctorSchedulePage() {
  const access = await requireHospitalAccess('opd', 'manage_schedule');

  const affiliations = await prisma.doctorHospitalAffiliation.findMany({
    where: {
      hospitalId: access.hospitalId,
      isCurrent: true,
    },
    include: {
      doctor: true,
    },
  });

  const doctors = affiliations.map((aff) => ({
    id: aff.doctor.id,
    name: aff.doctor.fullName,
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Doctor Schedule & Slots
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Configure weekly template schedules, generate daily appointment slots, and manage block
          ranges.
        </p>
      </div>

      <ScheduleClient doctors={doctors} />
    </div>
  );
}
