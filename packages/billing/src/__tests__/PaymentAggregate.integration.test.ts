import { PrismaClient, PaymentIntentStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { randomUUID } from 'crypto';

import { PaymentAggregate } from '../aggregates/PaymentAggregate';
import { CashProcessor } from '../payments/processors/CashProcessor';
import { GatewayRegistry } from '../payments/processors/GatewayRegistry';
import { PaymentProcessor, ProcessorResult } from '../payments/processors/interfaces';
import { Money } from '../pricing/Money';

const prisma = new PrismaClient();

// A dummy processor to test failures
class DummyFailingProcessor implements PaymentProcessor {
  capabilities = {
    supportsAuthorization: false,
    supportsCapture: true,
    supportsRefund: false,
    supportsPartialCapture: false,
    supportsWebhook: false,
    supportsVoid: false,
  };
  timeout = 5000;
  maxRetries = 3;

  async capture(intent: any, payload: any): Promise<ProcessorResult> {
    throw new Error('Simulated gateway failure');
  }
}

// A dummy processor to test declined payments
class DummyDeclinedProcessor implements PaymentProcessor {
  capabilities = {
    supportsAuthorization: false,
    supportsCapture: true,
    supportsRefund: false,
    supportsPartialCapture: false,
    supportsWebhook: false,
    supportsVoid: false,
  };
  timeout = 5000;
  maxRetries = 3;

  async capture(intent: any, payload: any): Promise<ProcessorResult> {
    return {
      success: false,
      paymentStatus: PaymentStatus.FAILED,
      gatewayName: 'DUMMY',
      errorCode: 'INSUFFICIENT_FUNDS',
      errorMessage: 'Card declined',
      processedAt: new Date(),
    };
  }
}

beforeAll(() => {
  GatewayRegistry.register('CASH', new CashProcessor());
  GatewayRegistry.register('FAILING_CARD', new DummyFailingProcessor());
  GatewayRegistry.register('DECLINED_CARD', new DummyDeclinedProcessor());
});

describe('PaymentAggregate', () => {
  const hospitalId = 'HOSP-123';
  let patientId: string;
  let invoiceId: string;

  beforeAll(async () => {
    // Setup hospital, patient, invoice
    await prisma.hospitalsMaster.upsert({
      where: { id: hospitalId },
      update: {},
      create: {
        id: hospitalId,
        displayName: 'Test Hospital',
        legalName: 'Test Hospital Pvt Ltd',
        registrationNumber: 'REG-123',
      },
    });

    const patient = await prisma.patient.create({
      data: {
        name: 'John Doe',
      },
    });
    patientId = patient.id;

    const invoice = await prisma.invoice.create({
      data: {
        hospitalId,
        patientId,
        invoiceNumber: 'INV-123',
        status: 'ISSUED',
        subtotal: 100,
        totalAmount: 100,
      },
    });
    invoiceId = invoice.id;
  });

  afterAll(async () => {
    await prisma.billingAudit.deleteMany({ where: { hospitalId } });
    await prisma.payment.deleteMany({ where: { hospitalId } });
    await prisma.paymentIntent.deleteMany({ where: { hospitalId } });
    await prisma.invoiceLineItem.deleteMany({ where: { invoice: { hospitalId } } });
    await prisma.invoice.deleteMany({ where: { hospitalId } });
    await prisma.patient.deleteMany({ where: { id: patientId } });
    await prisma.hospitalsMaster.deleteMany({ where: { id: hospitalId } });
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.billingAudit.deleteMany({ where: { hospitalId } });
    await prisma.payment.deleteMany({ where: { hospitalId } });
    await prisma.paymentIntent.deleteMany({ where: { hospitalId } });
  });

  it('should capture a cash payment successfully', async () => {
    const idempotencyKey = randomUUID();
    const intent = await prisma.paymentIntent.create({
      data: {
        hospitalId,
        invoiceId,
        patientId,
        idempotencyKey,
        amount: 100,
        currency: 'INR',
        status: PaymentIntentStatus.PENDING,
        paymentMethod: PaymentMethod.CASH,
      },
    });

    const payment = await PaymentAggregate.capturePayment(intent.id, hospitalId, 'CASHIER-1', {
      receiptNumber: 'RCPT-1',
    });

    expect(payment).toBeDefined();
    expect(payment.status).toBe(PaymentStatus.CAPTURED);
    expect(payment.gatewayPaymentId).toBe('RCPT-1');
    expect(Number(payment.amount)).toBe(100);

    // Verify Intent Status
    const updatedIntent = await prisma.paymentIntent.findUnique({ where: { id: intent.id } });
    expect(updatedIntent?.status).toBe(PaymentIntentStatus.CAPTURED);

    // Verify Audit
    const audit = await prisma.billingAudit.findFirst({
      where: { hospitalId, action: 'PAYMENT_COMPLETED' },
    });
    expect(audit).toBeDefined();
  });

  it('should handle gateway failures properly and not create a Payment', async () => {
    // Re-register CARD to the failing processor for this test
    GatewayRegistry.register('CARD', new DummyFailingProcessor());

    const idempotencyKey = randomUUID();
    const intent = await prisma.paymentIntent.create({
      data: {
        hospitalId,
        invoiceId,
        patientId,
        idempotencyKey,
        amount: 100,
        currency: 'INR',
        status: PaymentIntentStatus.PENDING,
        paymentMethod: PaymentMethod.CARD,
      },
    });

    await expect(
      PaymentAggregate.capturePayment(intent.id, hospitalId, 'CASHIER-1'),
    ).rejects.toThrow('Payment processing failed: Simulated gateway failure');

    // Verify Intent Status is FAILED and retryCount is 1
    const updatedIntent = await prisma.paymentIntent.findUnique({ where: { id: intent.id } });
    expect(updatedIntent?.status).toBe(PaymentIntentStatus.FAILED);
    expect(updatedIntent?.retryCount).toBe(1);
    expect(updatedIntent?.lastFailureReason).toBe('Simulated gateway failure');

    // Verify NO Payment record created
    const payments = await prisma.payment.findMany({ where: { intentId: intent.id } });
    expect(payments.length).toBe(0);

    // Verify Audit
    const audit = await prisma.billingAudit.findFirst({
      where: { hospitalId, action: 'PAYMENT_FAILED' },
    });
    expect(audit).toBeDefined();
  });

  it('should handle declined payments properly and not create a Payment', async () => {
    // Re-register UPI to the declined processor for this test
    GatewayRegistry.register('UPI', new DummyDeclinedProcessor());

    const idempotencyKey = randomUUID();
    const intent = await prisma.paymentIntent.create({
      data: {
        hospitalId,
        invoiceId,
        patientId,
        idempotencyKey,
        amount: 100,
        currency: 'INR',
        status: PaymentIntentStatus.PENDING,
        paymentMethod: PaymentMethod.UPI,
      },
    });

    await expect(
      PaymentAggregate.capturePayment(intent.id, hospitalId, 'CASHIER-1'),
    ).rejects.toThrow('Payment capture declined: Card declined');

    // Verify Intent Status is FAILED and retryCount is 1
    const updatedIntent = await prisma.paymentIntent.findUnique({ where: { id: intent.id } });
    expect(updatedIntent?.status).toBe(PaymentIntentStatus.FAILED);
    expect(updatedIntent?.retryCount).toBe(1);
    expect(updatedIntent?.lastFailureReason).toBe('Card declined');

    // Verify NO Payment record created
    const payments = await prisma.payment.findMany({ where: { intentId: intent.id } });
    expect(payments.length).toBe(0);

    // Verify Audit
    const audit = await prisma.billingAudit.findFirst({
      where: { hospitalId, action: 'PAYMENT_FAILED' },
    });
    expect(audit).toBeDefined();
    expect((audit?.metadata as any)?.gatewayErrorCode).toBe('INSUFFICIENT_FUNDS');
  });
});
