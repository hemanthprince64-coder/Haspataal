import { Landmark } from 'lucide-react';

import { requireRole } from '@/lib/auth/requireRole';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types';

import SettlementManager from './SettlementManager';

export default async function SettlementsPage() {
  const user = await requireRole([UserRole.HOSPITAL_ADMIN], 'session_user');

  // Load affiliated doctors
  const affiliations = await prisma.doctorHospitalAffiliation.findMany({
    where: { hospitalId: user.hospitalId, isCurrent: true },
    include: { doctor: true },
  });

  const doctors = affiliations.map((aff) => {
    const payloadObj = aff.payload as any;
    return {
      id: aff.doctorId,
      fullName: aff.doctor.fullName,
      mobile: aff.doctor.mobile,
      speciality: aff.department || 'General',
      revenueSharePercent: payloadObj?.revenueSharePercent
        ? Number(payloadObj.revenueSharePercent)
        : 70,
    };
  });

  // Load calculated settlements
  const settlements = await prisma.consultantSettlement.findMany({
    where: { hospitalId: user.hospitalId },
    include: { doctor: { select: { fullName: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="h-6 w-6 text-slate-400" />
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Consultant Settlements
            </h1>
          </div>
          <p className="text-slate-500 font-medium">
            Calculate payouts, print slips, and export bank payment CSV files offline.
          </p>
        </div>
      </div>

      <SettlementManager
        hospitalId={user.hospitalId as string}
        initialDoctors={doctors}
        initialSettlements={settlements}
      />
    </div>
  );
}
