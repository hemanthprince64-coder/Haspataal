import { PrismaClient, MARAttemptStatus } from '@prisma/client';

export class MARService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Records a medication administration attempt.
   */
  async recordAdministrationAttempt(
    orderItemId: string,
    attemptedById: string,
    hospitalId: string,
    patientId: string,
    options: {
      dispenseItemId?: string;
      status?: MARAttemptStatus;
      scheduledFor?: Date;
      clinicalNotes?: string;
    } = {},
  ): Promise<string> {
    return await this.prisma.$transaction(async (tx) => {
      // Create the MAR record
      const attempt = await tx.medicationAdministrationAttempt.create({
        data: {
          hospitalId,
          patientId,
          orderItemId,
          dispenseItemId: options.dispenseItemId,
          attemptedById,
          status: options.status ?? MARAttemptStatus.ADMINISTERED,
          scheduledFor: options.scheduledFor,
          clinicalNotes: options.clinicalNotes,
        },
      });

      // Find the associated order for the outbox event
      const orderItem = await tx.orderItem.findUnique({
        where: { id: orderItemId },
        select: { orderId: true },
      });

      if (!orderItem) {
        throw new Error(`Order item ${orderItemId} not found`);
      }

      // Emit milestone event to Outbox
      await tx.outboxEvent.create({
        data: {
          aggregateType: 'ORDER',
          aggregateId: orderItem.orderId,
          eventType: 'MEDICATION_ADMINISTERED',
          payload: {
            marAttemptId: attempt.id,
            orderId: orderItem.orderId,
            orderItemId,
            dispenseItemId: options.dispenseItemId,
            status: attempt.status,
            attemptedAt: attempt.attemptedAt.toISOString(),
            attemptedBy: attemptedById,
            notes: options.clinicalNotes,
          },
        },
      });

      // If the execution is FULLY_DISPENSED and we administer it, we might consider the execution COMPLETED.
      // But usually COMPLETED requires all intended administrations.
      // We will skip full completion logic in this step to keep it simple,
      // or we can mark it COMPLETED if this was the last dose.

      return attempt.id;
    });
  }
}
