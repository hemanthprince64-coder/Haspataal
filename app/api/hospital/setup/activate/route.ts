import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeSetupCompletion } from '@/lib/setup/completion-engine';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';

const CRITICAL_STEPS = ['identity', 'staff', 'doctors', 'opd', 'billing'];

export async function POST() {
  let access;
  try {
    access = await requireHospitalAccess('setup', 'activate');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const completion = await computeSetupCompletion(access.hospitalId);
  const missing = CRITICAL_STEPS.filter((step) => !completion.stepStatuses[step]?.complete);
  const encryptionConfigured = Boolean(process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length >= 32);

  if (missing.length > 0 || !encryptionConfigured) {
    return NextResponse.json(
      {
        error: 'Activation requirements not met',
        missing,
        security: encryptionConfigured ? [] : ['ENCRYPTION_KEY must be configured with at least 32 characters'],
        completion,
      },
      { status: 422 }
    );
  }

  const hospital = await prisma.hospitalsMaster.update({
    where: { id: access.hospitalId },
    data: {
      accountStatus: 'active',
      verificationStatus: 'verified',
    },
    select: { id: true, accountStatus: true, verificationStatus: true },
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'activate',
    entity: 'hospital',
    entityId: access.hospitalId,
    details: { completion: completion.totalWeightedScore },
  });

  return NextResponse.json({ hospital });
}
