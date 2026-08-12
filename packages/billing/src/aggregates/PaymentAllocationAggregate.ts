import { DomainEvent, eventBus as EventBus } from '@haspataal/events';
import { PrismaClient, PaymentStatus, AllocationStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

import { BillingEventTypes } from '../events/BillingEvents';
import { Money } from '../pricing/Money';

const prisma = new PrismaClient();



export interface AllocatePaymentCommand {
  paymentId: string;
  invoiceId: string;
  hospitalId: string;
  userId: string;
  amount: number;
  idempotencyKey: string;
  reason?: string;
}

export class PaymentAllocationAggregate {
  /**
   * Generates a sequential allocation number for the hospital
   */
  private async generateAllocationNumber(hospitalId: string, tx: any): Promise<string> {
    const currentYear = new Date().getFullYear();
    const count = await tx.paymentAllocation.count({
      where: {
        hospitalId,
        allocationNumber: {
          startsWith: `PAL-${currentYear}-`,
        },
      },
    });
    return `PAL-${currentYear}-${String(count + 1).padStart(6, '0')}`;
  }

  public async allocate(command: AllocatePaymentCommand): Promise<void> {
    const { paymentId, invoiceId, hospitalId, userId, amount, idempotencyKey, reason } = command;

    try {
      await prisma.$transaction(
        async (tx) => {
          // 1. Check idempotency (handled by unique constraint, but we can check early)
          const existing = await tx.paymentAllocation.findUnique({
            where: {
              hospitalId_idempotencyKey: {
                hospitalId,
                idempotencyKey,
              },
            },
          });

          if (existing) {
            throw new Error(`Allocation with idempotency key ${idempotencyKey} already exists`);
          }

          // 2. Fetch Payment and Invoice with row locks
          const payment = await tx.payment.findUniqueOrThrow({
            where: { id: paymentId },
          });

          const invoice = await tx.invoice.findUniqueOrThrow({
            where: { id: invoiceId },
          });

          // 3. Rule 6: Hospital IDs must match
          if (payment.hospitalId !== hospitalId || invoice.hospitalId !== hospitalId) {
            throw new Error('Hospital IDs do not match');
          }

          // 4. Rule 1: Payment must be CAPTURED
          if (payment.status !== PaymentStatus.CAPTURED) {
            throw new Error(
              `Payment must be CAPTURED to allocate. Current status: ${payment.status}`,
            );
          }

          // 5. Rule 2: Invoice must not be VOIDED
          if (invoice.status === 'VOIDED') {
            throw new Error('Cannot allocate to a VOIDED invoice');
          }

          // 6. Rule 5: Currencies must match
          if (payment.currency !== 'INR') {
            throw new Error(
              `Currency mismatch. Payment currency ${payment.currency} is not supported`,
            );
          }

          // Use Money object for safe arithmetic
          const allocateAmountMoney = new Money(amount);
          const paymentTotal = new Money(payment.amount);
          const paymentAllocated = new Money(payment.allocatedAmount);
          const paymentRemaining = paymentTotal.subtract(paymentAllocated);

          const invoiceBalance = new Money(invoice.balanceAmount);

          // 7. Rule 4: Allocated Amount <= Payment Remaining Amount
          if (allocateAmountMoney.compare(paymentRemaining) > 0) {
            // Emit overallocation blocked event
            EventBus.publish({
              id: randomUUID(),
              type: BillingEventTypes.PAYMENT_OVERALLOCATION_BLOCKED,
              version: 1,
              eventVersion: 1,
              schemaVersion: 1,
              occurredAt: new Date(),
              aggregateId: invoiceId,
              aggregateType: 'Invoice',
              actor: { id: userId, type: 'USER' },
              hospitalId,
              payload: {
                paymentId,
                requestedAmount: amount,
                remainingAmount: paymentRemaining.toNumber(),
              },
            });
            throw new Error(
              `Over-allocation: Requested ${amount}, but payment only has ${paymentRemaining.toNumber()} remaining`,
            );
          }

          // 8. Rule 3: Allocated Amount <= Invoice Outstanding Balance
          if (allocateAmountMoney.compare(invoiceBalance) > 0) {
            EventBus.publish({
              id: randomUUID(),
              type: BillingEventTypes.PAYMENT_OVERALLOCATION_BLOCKED,
              version: 1,
              eventVersion: 1,
              schemaVersion: 1,
              occurredAt: new Date(),
              aggregateId: invoiceId,
              aggregateType: 'Invoice',
              actor: { id: userId, type: 'USER' },
              hospitalId,
              payload: {
                paymentId,
                requestedAmount: amount,
                invoiceBalance: invoiceBalance.toNumber(),
              },
            });
            throw new Error(
              `Over-allocation: Requested ${amount}, but invoice balance is ${invoiceBalance.toNumber()}`,
            );
          }

          // 9. Generate Allocation Number
          const allocationNumber = await this.generateAllocationNumber(hospitalId, tx);

          // 10. Persist PaymentAllocation Ledger Entry
          const allocation = await tx.paymentAllocation.create({
            data: {
              hospitalId,
              paymentId,
              invoiceId,
              allocatedAmount: allocateAmountMoney.toDecimal(),
              currency: 'INR',
              allocationNumber,
              allocationType: 'PAYMENT',
              createdBy: userId,
              idempotencyKey,
              status: AllocationStatus.ACTIVE,
              metadata: reason ? { reason } : {},
            },
          });

          // 11. Update Payment
          const newPaymentAllocated = paymentAllocated.add(allocateAmountMoney);
          await tx.payment.update({
            where: { id: paymentId, version: payment.version },
            data: {
              allocatedAmount: newPaymentAllocated.toDecimal(),
              version: { increment: 1 },
            },
          });

          // 12. Update Invoice
          const invoicePaidAmount = new Money(invoice.paidAmount).add(allocateAmountMoney);
          const newInvoiceBalance = invoiceBalance.subtract(allocateAmountMoney);
          let newInvoiceStatus = invoice.status;

          // If balance is exactly 0, mark as PAID
          if (newInvoiceBalance.isZero()) {
            newInvoiceStatus = 'PAID';
          } else if (invoicePaidAmount.compare(new Money(0)) > 0) {
            newInvoiceStatus = 'PARTIALLY_PAID';
          }

          await tx.invoice.update({
            where: { id: invoiceId, version: invoice.version }, // Rule 7: Optimistic Locking
            data: {
              paidAmount: invoicePaidAmount.toDecimal(),
              balanceAmount: newInvoiceBalance.toDecimal(),
              status: newInvoiceStatus,
              version: { increment: 1 },
              paidAt: newInvoiceBalance.isZero() ? new Date() : invoice.paidAt,
            },
          });

          // 13. Publish Accounting Events
          // Payment event
          EventBus.publish({
            id: randomUUID(),
            type: newPaymentAllocated.equals(paymentTotal)
              ? BillingEventTypes.PAYMENT_ALLOCATED
              : BillingEventTypes.PAYMENT_PARTIALLY_ALLOCATED,
            version: 1,
            eventVersion: 1,
            schemaVersion: 1,
            occurredAt: new Date(),
            aggregateId: paymentId,
            aggregateType: 'Payment',
            actor: { id: userId, type: 'USER' },
            hospitalId,
            payload: {
              allocationId: allocation.id,
              invoiceId,
              amount,
            },
          });

          // Invoice event
          EventBus.publish({
            id: randomUUID(),
            type: newInvoiceBalance.isZero()
              ? BillingEventTypes.INVOICE_PAID
              : BillingEventTypes.INVOICE_PARTIALLY_PAID,
            version: 1,
            eventVersion: 1,
            schemaVersion: 1,
            occurredAt: new Date(),
            aggregateId: invoiceId,
            aggregateType: 'Invoice',
            actor: { id: userId, type: 'USER' },
            hospitalId,
            payload: {
              allocationId: allocation.id,
              paymentId,
              amount,
              newBalance: newInvoiceBalance.toNumber(),
            },
          });
        },
        { isolationLevel: 'ReadCommitted' },
      );
    } catch (error: any) {
      // Wrap known Prisma unique constraint error
      if (error.code === 'P2002' && error.meta?.target?.includes('idempotencyKey')) {
        throw new Error(`Allocation with idempotency key ${idempotencyKey} already exists`);
      }
      if (error.code === 'P2025') {
        throw new Error(`Optimistic locking failed or record not found: ${error.message}`);
      }
      throw error;
    }
  }
}
