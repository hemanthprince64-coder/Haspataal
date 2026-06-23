import { requireHospitalAccess } from '@/lib/auth/hospital-access';
import { getHospitalInsurances } from '@/lib/hospital-actions';

import InsuranceSettingsClient from './insurance-settings-client';

export default async function InsuranceSettingsPage() {
  const access = await requireHospitalAccess('billing', 'read');
  const insurances = await getHospitalInsurances(access.hospitalId);

  // CastDecimal fields to primitive numbers for client safety
  const safeInsurances = insurances.map((ins) => ({
    ...ins,
    coPayPercentage: ins.coPayPercentage ? Number(ins.coPayPercentage) : null,
    validFrom: ins.validFrom.toISOString().split('T')[0],
    validTo: ins.validTo.toISOString().split('T')[0],
    createdAt: ins.createdAt.toISOString(),
    updatedAt: ins.updatedAt.toISOString(),
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Accepted Insurance</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure and manage accepted insurance panels, Third Party Administrators (TPA), and
          government schemes.
        </p>
      </div>
      <InsuranceSettingsClient initialInsurances={safeInsurances} hospitalId={access.hospitalId} />
    </div>
  );
}
