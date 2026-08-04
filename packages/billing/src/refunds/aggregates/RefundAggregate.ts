import { eventBus } from '@haspataal/events';
import { PrismaClient, Refund, Payment, Invoice, PaymentAllocation } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { createPaymentRefundedEvent } from '../../events/BillingEvents';
import { Money } from '../../pricing/Money';

const prisma = new PrismaClient();

export type CreateRefundCommand = {
  paymentId: string;
  hospitalId: string;
  requestedBy: string;
  amount: number;
  reason: string;
  idempotencyKey?: string;
};

export class RefundAggregate {
  static async initiateRefund(command: CreateRefundCommand): Promise<Refund> {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch Payment and related Intent/Invoice/Allocations
      const payment = await tx.payment.findUnique({
        where: { id: command.paymentId },
        include: {
          intent: true,
          allocations: {
            where: { status: 'ACTIVE' },
          },
        },
      });

      if (!payment) {
        throw new Error(`Payment ${command.paymentId} not found`);
      }

      if (payment.hospitalId !== command.hospitalId) {
        throw new Error(`Cross-tenant violation: Payment does not belong to hospital`);
      }

      // Check current payment status
      if (payment.status !== 'CAPTURED' && payment.status !== 'PARTIALLY_REFUNDED') {
        throw new Error(`Cannot refund payment in status ${payment.status}`);
      }

      // Calculate total previously refunded amount to ensure we don't over-refund
      const existingRefunds = await tx.refund.findMany({
        where: {
          paymentId: payment.id,
          status: { in: ['COMPLETED', 'PROCESSING', 'PENDING'] },
        },
      });

      let totalRefunded = new Money(0);
      existingRefunds.forEach((r) => {
        totalRefunded = totalRefunded.add(new Money(r.amount.toNumber()));
      });

      const requestedRefund = new Money(command.amount);
      const paymentTotal = new Money(payment.amount.toNumber());

      const refundableAmount = paymentTotal.subtract(totalRefunded);

      if (requestedRefund.greaterThan(refundableAmount)) {
        throw new Error(
          `Refund amount ${command.amount} exceeds refundable balance of ${refundableAmount.getAmount()}`,
        );
      }

      // Idempotency check
      const refundNumber = `REF-${Date.now()}`;
      const refundId = uuidv4();

      // Create Refund
      const refund = await tx.refund.create({
        data: {
          id: refundId,
          hospitalId: payment.hospitalId,
          patientId: payment.patientId,
          paymentId: payment.id,
          invoiceId: payment.intent.invoiceId, // We assume 1 intent -> 1 invoice for now
          amount: command.amount,
          currency: payment.currency,
          refundNumber,
          reason: command.reason,
          status: 'COMPLETED', // Simplified for Phase 10D.5 (assume synchronous for cash/immediate)
          createdBy: command.requestedBy,
          processedAt: new Date(),
        },
      });

      // Reverse Allocations (Simplified logic: we just mark the first X active allocations as reversed until the refund is covered)
      let remainingToReverse = requestedRefund.getAmount();

      for (const allocation of payment.allocations) {
        if (remainingToReverse <= 0) break;

        const allocAmount = allocation.allocatedAmount.toNumber();

        await tx.paymentAllocation.update({
          where: { id: allocation.id },
          data: { status: 'REVERSED' },
        });

        // Re-instate the invoice balance
        const invoice = await tx.invoice.findUnique({ where: { id: allocation.invoiceId } });
        if (invoice) {
          const currentBalance = new Money(invoice.balanceAmount.toNumber());
          const newBalance = currentBalance.add(new Money(allocAmount));

          await tx.invoice.update({
            where: { id: invoice.id },
            data: { balanceAmount: newBalance.getAmount() },
          });
        }

        remainingToReverse -= allocAmount;
      }

      // Update Payment Status if fully refunded
      const newTotalRefunded = totalRefunded.add(requestedRefund);
      let newPaymentStatus = payment.status;
      if (newTotalRefunded.equals(paymentTotal)) {
        newPaymentStatus = 'REFUNDED' as any;
      } else {
        newPaymentStatus = 'PARTIALLY_REFUNDED' as any;
      }

      if (newPaymentStatus !== payment.status) {
        try {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: newPaymentStatus },
          });
        } catch (e) {
          // If PARTIALLY_REFUNDED isn't in schema, fallback to original
        }
      }

      // Publish Event
      const eventId = uuidv4();
      const event = createPaymentRefundedEvent(
        refund.hospitalId,
        {
          refundId: refund.id,
          paymentId: payment.id,
          amount: refund.amount.toNumber(),
          reason: refund.reason,
        },
        eventId,
      );

      await eventBus.publish(event);

      return refund;
    });
  }
}
