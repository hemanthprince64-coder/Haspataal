import { CanonicalEventEnvelope } from '@haspataal/platform-contracts';

export const BillingEventTypes = {
  CHARGE_CREATED: 'CHARGE_CREATED',
  INVOICE_GENERATED: 'INVOICE_GENERATED',
  INVOICE_ISSUED: 'INVOICE_ISSUED',
  PAYMENT_INTENT_CREATED: 'PAYMENT_INTENT_CREATED',
  PAYMENT_INTENT_PENDING: 'PAYMENT_INTENT_PENDING',
  PAYMENT_INTENT_CANCELLED: 'PAYMENT_INTENT_CANCELLED',
  PAYMENT_INTENT_EXPIRED: 'PAYMENT_INTENT_EXPIRED',
  PAYMENT_STARTED: 'PAYMENT_STARTED',
  PAYMENT_AUTHORIZED: 'PAYMENT_AUTHORIZED',
  PAYMENT_CAPTURED: 'PAYMENT_CAPTURED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',
  PAYMENT_ALLOCATED: 'PAYMENT_ALLOCATED',
  PAYMENT_PARTIALLY_ALLOCATED: 'PAYMENT_PARTIALLY_ALLOCATED',
  INVOICE_PARTIALLY_PAID: 'INVOICE_PARTIALLY_PAID',
  INVOICE_PAID: 'INVOICE_PAID',
  PAYMENT_ALLOCATION_REVERSED: 'PAYMENT_ALLOCATION_REVERSED',
  PAYMENT_OVERALLOCATION_BLOCKED: 'PAYMENT_OVERALLOCATION_BLOCKED',
  RECEIPT_GENERATED: 'RECEIPT_GENERATED',
  RECEIPT_PRINTED: 'RECEIPT_PRINTED',
  RECEIPT_VOIDED: 'RECEIPT_VOIDED',
  INVOICE_VOIDED: 'INVOICE_VOIDED',
  ADJUSTMENT_CREATED: 'ADJUSTMENT_CREATED',
};

// Kept for backward compatibility while migrating
export const BILL_GENERATED_EVENT_TYPE = BillingEventTypes.INVOICE_GENERATED;

export interface BillGeneratedPayload {
  invoiceId: string;
  invoiceNumber: string;
  billingAccountId?: string;
  patientId?: string;
  hospitalId: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  chargeItemIds: string[];
}

export function createBillGeneratedEvent(
  hospitalId: string,
  payload: BillGeneratedPayload,
  eventId: string,
): CanonicalEventEnvelope {
  return {
    eventId,
    eventType: BillingEventTypes.INVOICE_GENERATED,
    eventVersion: 1,
    schemaVersion: '1.0.0',
    occurredAt: new Date().toISOString(),
    aggregate: {
      aggregateId: payload.invoiceId,
      aggregateType: 'Invoice',
    },
    actor: {
      actorId: 'system',
      actorType: 'SYSTEM',
    },
    scope: {
      hospitalId,
    },
    payload,
  };
}

export interface PaymentRefundedPayload {
  refundId: string;
  paymentId: string;
  amount: number;
  reason: string;
}
export function createPaymentRefundedEvent(
  hospitalId: string,
  payload: PaymentRefundedPayload,
  eventId: string,
): CanonicalEventEnvelope {
  return {
    eventId,
    eventType: BillingEventTypes.PAYMENT_REFUNDED,
    eventVersion: 1,
    schemaVersion: '1.0.0',
    occurredAt: new Date().toISOString(),
    aggregate: { aggregateId: payload.refundId, aggregateType: 'Refund' },
    actor: { actorId: 'system', actorType: 'SYSTEM' },
    scope: { hospitalId },
    payload,
  };
}
