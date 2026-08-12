import { DomainEvent } from '@haspataal/events';
import {
  PrismaClient,
  PaymentIntent,
  PaymentStatus,
  PaymentIntentStatus,
  PaymentMethod,
  Payment,
} from '@prisma/client';
import { randomUUID } from 'crypto';

import { BillingEventTypes } from '../events/BillingEvents';
import { GatewayRegistry } from '../payments/processors/GatewayRegistry';
import { Money } from '../pricing/Money';

const prisma = new PrismaClient();

export class PaymentAggregate {
  static async capturePayment(
    intentId: string,
    hospitalId: string,
    cashierId: string,
    metadata: any = {},
  ): Promise<Payment> {
    // 1. Load Intent to check pre-conditions (outside tx)
    const intent = await prisma.paymentIntent.findUnique({
      where: { id: intentId },
    });

    if (!intent) {
      throw new Error(`PaymentIntent ${intentId} not found`);
    }

    if (intent.hospitalId !== hospitalId) {
      throw new Error(`Tenant mismatch on PaymentIntent ${intentId}`);
    }

    if (
      intent.status !== PaymentIntentStatus.PENDING &&
      intent.status !== PaymentIntentStatus.AUTHORIZED
    ) {
      throw new Error(`Cannot capture PaymentIntent in state ${intent.status}`);
    }

    if (!intent.paymentMethod) {
      throw new Error(`PaymentIntent ${intentId} has no payment method assigned`);
    }

    // 2. Resolve Processor
    const processor = GatewayRegistry.resolve(intent.paymentMethod);

    // 3. Invoke Processor (No Prisma access in processor, NO DB transaction held)
    let processorResult;
    try {
      processorResult = await processor.capture(intent, metadata);
    } catch (err: any) {
      // Handle unexpected gateway failure (outside of aggregate transaction)
      await prisma.$transaction(async (tx) => {
        await tx.paymentIntent.update({
          where: { id: intent.id },
          data: {
            status: PaymentIntentStatus.FAILED,
            retryCount: intent.retryCount + 1,
            lastFailureReason: err.message,
          },
        });
        await tx.billingAudit.create({
          data: {
            hospitalId,
            action: 'PAYMENT_FAILED',
            performedBy: cashierId,
            metadata: { error: err.message, ...metadata },
          },
        });
      });
      throw new Error(`Payment processing failed: ${err.message}`);
    }

    // 4. Handle declined processor result
    if (!processorResult.success) {
      await prisma.$transaction(async (tx) => {
        await tx.paymentIntent.update({
          where: { id: intent.id },
          data: {
            status: PaymentIntentStatus.FAILED,
            retryCount: intent.retryCount + 1,
            lastFailureReason: processorResult!.errorMessage,
          },
        });
        await tx.billingAudit.create({
          data: {
            hospitalId,
            action: 'PAYMENT_FAILED',
            performedBy: cashierId,
            metadata: {
              error: processorResult!.errorMessage,
              gatewayErrorCode: processorResult!.errorCode,
              ...metadata,
            },
          },
        });
      });
      throw new Error(`Payment capture declined: ${processorResult.errorMessage}`);
    }

    // 5. Success! Now persist in a short-lived transaction
    return prisma.$transaction(async (tx) => {
      // Re-fetch intent with write lock to ensure no concurrent modification
      // Prisma does not have raw row-locks on findUnique out of the box without raw queries,
      // but we can check status before updating. (In Postgres we'd do SELECT FOR UPDATE).
      const lockedIntent = await tx.paymentIntent.findUnique({
        where: { id: intent.id },
      });

      if (
        !lockedIntent ||
        (lockedIntent.status !== PaymentIntentStatus.PENDING &&
          lockedIntent.status !== PaymentIntentStatus.AUTHORIZED)
      ) {
        throw new Error(`PaymentIntent state changed concurrently`);
      }

      const intentMoney = new Money(lockedIntent.amount, lockedIntent.currency);

      const payment = await tx.payment.create({
        data: {
          hospitalId,
          patientId: lockedIntent.patientId,
          intentId: lockedIntent.id,
          amount: intentMoney.amount,
          currency: intentMoney.currency,
          method: lockedIntent.paymentMethod!,
          status: processorResult!.paymentStatus,
          gatewayName: processorResult!.gatewayName,
          gatewayPaymentId: processorResult!.gatewayPaymentId,
          gatewayOrderId: processorResult!.gatewayOrderId,
          gatewaySignature: processorResult!.gatewaySignature,
          gatewayPayload: processorResult!.rawPayload as any,
          receivedAt: processorResult!.processedAt,
        },
      });

      await tx.paymentIntent.update({
        where: { id: lockedIntent.id },
        data: { status: PaymentIntentStatus.CAPTURED },
      });

      await tx.billingAudit.create({
        data: {
          hospitalId,
          action: 'PAYMENT_COMPLETED',
          performedBy: cashierId,
          metadata: {
            paymentId: payment.id,
            gatewayName: payment.gatewayName,
            ...metadata,
          },
        },
      });

      const event: DomainEvent = {
        id: randomUUID(),
        type: BillingEventTypes.PAYMENT_CAPTURED,
        version: 1,
        eventVersion: 1,
        schemaVersion: 1,
        occurredAt: new Date(),
        aggregateId: payment.id,
        aggregateType: 'Payment',
        actor: { id: cashierId, type: 'USER' },
        hospitalId,
        payload: {
          intentId: lockedIntent.id,
          amount: Number(payment.amount),
          currency: payment.currency,
          method: payment.method,
        },
      };

      console.log(`[EventBus] Published ${event.type}`, event);

      return payment;
    });
  }
}
