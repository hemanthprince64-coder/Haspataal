import { PrismaClient } from '@prisma/client';

import { OutboxService } from '../outbox/service';
import { ReferralExecutionService } from './ReferralExecutionService';

/**
 * ReferralConsumer — listens to canonical ORDER_REQUESTED events for REFERRAL orders.
 * Replay-safe: provisionExecution is idempotent via unique orderId constraint.
 */
export class ReferralConsumer {
  private executionService: ReferralExecutionService;

  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {
    this.executionService = new ReferralExecutionService(prisma, outbox);
  }

  async handleOrderRequested(
    eventPayload: {
      orderType?: string;
      orderId: string;
      hospitalId: string;
      patientId: string;
      orderedBy: string;
      items?: Array<{
        orderItemId: string;
        referralType?: string;
        priority?: string;
        clinicalSummary?: string;
        reasonForReferral?: string;
        recipients?: Array<{
          recipientType: string;
          recipientId?: string;
          recipientName: string;
          recipientHospitalId?: string;
          recipientSpecialty?: string;
        }>;
        specialtyCode?: string;
        departmentCode?: string;
      }>;
    },
    hospitalId: string,
    patientId: string,
  ) {
    if (eventPayload.orderType !== 'REFERRAL') {
      return; // Not a referral order — skip
    }

    const items = eventPayload.items ?? [];
    if (items.length === 0) {
      return; // Nothing to provision
    }

    for (const item of items) {
      // Check idempotency — skip if already provisioned for this orderItemId
      const existing = await this.prisma.referralExecutionItem.findUnique({
        where: { orderItemId: item.orderItemId },
      });

      if (existing) {
        continue; // Already provisioned — safe replay
      }

      await this.executionService.provisionExecution({
        orderId: eventPayload.orderId,
        orderItemId: item.orderItemId,
        hospitalId,
        patientId,
        referralType: item.referralType ?? 'INTERNAL_CROSS_DEPARTMENT',
        priority: item.priority ?? 'ROUTINE',
        clinicalSummary: item.clinicalSummary ?? '',
        reasonForReferral: item.reasonForReferral ?? '',
        requestingDoctorId: eventPayload.orderedBy,
        recipients: item.recipients ?? [],
        specialtyCode: item.specialtyCode,
        departmentCode: item.departmentCode,
      });
    }
  }
}
