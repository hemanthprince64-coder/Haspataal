import { prisma } from '@/lib/prisma';

export interface MarkBillPaidOptions {
  billId: string;
  hospitalId: string;
  source?: string;
  followUpId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Centralized bill payment function.
 * Always sets payload.source + payload.paidAt.
 * If source === 'retention_followup' and followUpId is provided,
 * also marks the FollowUp as COMPLETED.
 */
export async function markBillPaid(options: MarkBillPaidOptions) {
  const {
    billId,
    hospitalId,
    source = 'direct',
    followUpId,
    metadata = {},
  } = options;

  const paidAt = new Date();

  const payload = {
    source,
    paidAt: paidAt.toISOString(),
    followUpId: followUpId ?? null,
    ...metadata,
  };

  // Update bill
  const bill = await prisma.bill.update({
    where: { id: billId, hospitalId },
    data: {
      status: 'PAID',
      paidAt,
      source,
      followUpId: followUpId ?? null,
      payload,
    },
  });

  // If retention follow-up, mark it complete
  if (source === 'retention_followup' && followUpId) {
    await prisma.followUp.update({
      where: { id: followUpId },
      data: {
        status: 'COMPLETED',
        completedAt: paidAt,
      },
    });
  }

  return bill;
}
