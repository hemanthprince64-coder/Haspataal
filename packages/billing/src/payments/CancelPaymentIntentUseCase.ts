import { PrismaClient, BillingAuditAction } from '@haspataal/db';
import { eventBus } from '@haspataal/events';
import { v4 as uuidv4 } from 'uuid';

import { BillingEventTypes } from '../events/BillingEvents';
import { PaymentIntentStateMachine } from './PaymentIntentStateMachine';

export class CancelPaymentIntentUseCase {
  constructor(private prisma: PrismaClient) {}

  public async execute(hospitalId: string, intentId: string, performedBy: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const intent = await tx.paymentIntent.findUnique({
        where: { id: intentId },
      });

      if (!intent) {
        throw new Error('Payment intent not found.');
      }

      if (intent.hospitalId !== hospitalId) {
        throw new Error('Hospital ownership validation failed.');
      }

      // 1. Assert state machine transition
      PaymentIntentStateMachine.assertCanTransition(intent.status, 'CANCELLED');

      // 2. Update status
      await tx.paymentIntent.update({
        where: { id: intent.id },
        data: { status: 'CANCELLED' },
      });

      // 3. Audit Trail
      await tx.billingAudit.create({
        data: {
          hospitalId: intent.hospitalId,
          patientId: intent.patientId,
          invoiceId: intent.invoiceId,
          action: BillingAuditAction.PAYMENT_CANCELLED,
          performedBy,
          metadata: { intentId, reason: 'Manually cancelled' },
        },
      });

      // 4. Publish Event
      await eventBus.publish({
        eventId: uuidv4(),
        eventType: BillingEventTypes.PAYMENT_INTENT_CANCELLED,
        eventVersion: 1,
        schemaVersion: '1.0.0',
        occurredAt: new Date().toISOString(),
        aggregate: { aggregateId: intent.id, aggregateType: 'PaymentIntent' },
        actor: { actorId: performedBy, actorType: 'USER' },
        scope: { hospitalId: intent.hospitalId },
        payload: {
          intentId: intent.id,
          invoiceId: intent.invoiceId,
        },
      });
    });
  }
}
