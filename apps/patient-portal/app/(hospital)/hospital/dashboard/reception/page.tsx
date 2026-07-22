/* eslint-disable */
import { requireHospitalStaff } from '@haspataal/auth';

import ReceptionWorkflow from '@/components/hospital/reception-workflow';
import { getActiveBranchId } from '@/lib/branch';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Reception | Haspataal',
};

export default async function ReceptionPage() {
  await requireHospitalStaff();

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reception</h1>
        <p className="text-sm text-slate-500 mt-1">Patient registration and walk-in management.</p>
      </div>

      <ReceptionWorkflow />
    </div>
  );
}
