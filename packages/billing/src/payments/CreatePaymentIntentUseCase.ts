import {
  PrismaClient,
  PaymentMethod,
  BillingAuditAction,
} from '@haspataal/db';
import { eventBus } from '@haspataal/events';
import { v4 as uuidv4 } from 'uuid';

import { BillingEventTypes } from '../events/BillingEvents';
import { ImmutableFinancialAggregateGuard } from '../guards/ImmutableFinancialAggregateGuard';
import { Money } from '../pricing/Money';

interface CreatePaymentIntentRequest {
  hospitalId: string;
  patientId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
  performedBy: string;
}

export class CreatePaymentIntentUseCase {
  constructor(private prisma: PrismaClient) {}

  public async execute(request: CreatePaymentIntentRequest): Promise<string> {
    const requestedMoney = new Money(request.amount, request.currency);

    if (!requestedMoney.isPositive()) {
      throw new Error('Payment intent amount must be greater than zero.');
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Fetch Invoice
      const invoice = await tx.invoice.findUnique({
        where: { id: request.invoiceId },
      });

      if (!invoice) {
        throw new Error('Invoice not found.');
      }

      if (invoice.hospitalId !== request.hospitalId) {
        throw new Error('Hospital ownership validation failed.');
      }

      // 2. Asserts
      ImmutableFinancialAggregateGuard.assertPayable(invoice.status);
      const invoicePayload = invoice.payload as any;
      const invoiceTotal = new Money(invoice.totalAmount, invoicePayload?.pricing?.currency || 'INR');

      // Strict currency check
      requestedMoney.add(new Money(0, invoiceTotal.currency)); // throws if mismatch

      // 3. Fetch active intents and captured allocations
      const activeIntents = await tx.paymentIntent.findMany({
        where: {
          invoiceId: invoice.id,
          status: { in: ['CREATED', 'PENDING', 'AUTHORIZED'] },
        },
      });

      let reservedAmount = new Money(0, invoiceTotal.currency);
      for (const intent of activeIntents) {
        // Enforce idempotency concurrently in memory (db unique constraint handles hard concurrency)
        if (intent.idempotencyKey === request.idempotencyKey) {
          return intent.id; // Idempotent return
        }
        reservedAmount = reservedAmount.add(new Money(intent.amount, intent.currency));
      }

      // Since Phase 10D.3 Allocation isn't fully active yet, we use invoice.paidAmount or just rely on intent sums
      // Assuming paidAmount tracks finalized captured money.
      const paidAmount = new Money(invoice.paidAmount, invoiceTotal.currency);

      const outstandingAmount = invoiceTotal.subtract(paidAmount).subtract(reservedAmount);

      if (requestedMoney.compare(outstandingAmount) > 0) {
        throw new Error(
          `Cannot reserve ${requestedMoney.amount}. Outstanding unreserved balance is ${outstandingAmount.amount}.`,
        );
      }

      // 4. Create PaymentIntent
      const intentId = uuidv4();

      await tx.paymentIntent.create({
        data: {
          id: intentId,
          hospitalId: request.hospitalId,
          patientId: invoice.patientId || request.patientId,
          invoiceId: invoice.id,
          amount: requestedMoney.toDecimal(),
          currency: requestedMoney.currency,
          paymentMethod: request.paymentMethod,
          status: 'CREATED',
          idempotencyKey: request.idempotencyKey,
        },
      });

      // 5. Audit Trail
      await tx.billingAudit.create({
        data: {
          hospitalId: request.hospitalId,
          patientId: invoice.patientId,
          invoiceId: invoice.id,
          action: BillingAuditAction.PAYMENT_INTENT_CREATED,
          performedBy: request.performedBy,
          metadata: { intentId, amount: request.amount, currency: request.currency },
        },
      });

      // 6. Optimistic Locking: Increment invoice version to ensure strict concurrency boundaries
      await tx.invoice.update({
        where: { id: invoice.id, version: invoice.version },
        data: { version: { increment: 1 } },
      });

      // 7. Publish Event
      await eventBus.publish({
        id: uuidv4(),
        type: BillingEventTypes.PAYMENT_INTENT_CREATED,
        version: 1,
        eventVersion: 1,
        schemaVersion: 1,
        occurredAt: new Date(),
        aggregateId: intentId,
        aggregateType: 'PaymentIntent',
        actor: { id: request.performedBy, type: 'USER' },
        hospitalId: request.hospitalId,
        payload: {
          intentId,
          invoiceId: invoice.id,
          amount: request.amount,
          currency: request.currency,
          paymentMethod: request.paymentMethod,
        },
      });

      return intentId;
    });
  }
}
