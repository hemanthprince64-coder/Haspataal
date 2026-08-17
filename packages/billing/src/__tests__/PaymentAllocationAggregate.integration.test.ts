import { PrismaClient, PaymentStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

import { PaymentAllocationAggregate } from '../aggregates/PaymentAllocationAggregate';

const prisma = new PrismaClient();
const allocationAggregate = new PaymentAllocationAggregate();

describe('PaymentAllocationAggregate', () => {
  const hospitalId = 'HOSP-ALLOC-1';
  let patientId: string;
  let invoiceId: string;
  let paymentId: string;

  beforeAll(async () => {
    // Setup hospital, patient
    await prisma.hospitalsMaster.upsert({
      where: { id: hospitalId },
      update: {},
      create: {
        id: hospitalId,
        displayName: 'Alloc Hospital',
        legalName: 'Alloc Hospital Pvt Ltd',
        registrationNumber: 'REG-ALLOC-1',
      },
    });

    const patient = await prisma.patient.create({
      data: { name: 'Alloc Patient' },
    });
    patientId = patient.id;
  });

  afterAll(async () => {
    await prisma.billingAudit.deleteMany({ where: { hospitalId } });
    await prisma.paymentAllocation.deleteMany({ where: { hospitalId } });
    await prisma.payment.deleteMany({ where: { hospitalId } });
    await prisma.paymentIntent.deleteMany({ where: { hospitalId } });
    await prisma.invoice.deleteMany({ where: { hospitalId } });
    await prisma.patient.deleteMany({ where: { id: patientId } });
    await prisma.hospitalsMaster.deleteMany({ where: { id: hospitalId } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clear state before each test
    await prisma.paymentAllocation.deleteMany({ where: { hospitalId } });
    await prisma.payment.deleteMany({ where: { hospitalId } });
    await prisma.paymentIntent.deleteMany({ where: { hospitalId } });
    await prisma.invoice.deleteMany({ where: { hospitalId } });

    // Create a fresh invoice with balance 100
    const invoice = await prisma.invoice.create({
      data: {
        hospitalId,
        patientId,
        invoiceNumber: 'INV-ALLOC-1',
        status: 'ISSUED',
        subtotal: 100,
        totalAmount: 100,
        balanceAmount: 100,
      },
    });
    invoiceId = invoice.id;

    // Create a fresh payment intent and CAPTURED payment
    const intent = await prisma.paymentIntent.create({
      data: {
        hospitalId,
        invoiceId,
        patientId,
        amount: 100,
        idempotencyKey: randomUUID(),
        status: 'CAPTURED',
        paymentMethod: 'CASH',
      },
    });

    const payment = await prisma.payment.create({
      data: {
        hospitalId,
        patientId,
        intentId: intent.id,
        amount: 100,
        allocatedAmount: 0,
        method: 'CASH',
        status: PaymentStatus.CAPTURED,
        gatewayTransactionId: randomUUID(),
      },
    });
    paymentId = payment.id;
  });

  it('should successfully allocate a payment to an invoice', async () => {
    const idempotencyKey = randomUUID();
    await allocationAggregate.allocate({
      hospitalId,
      invoiceId,
      paymentId,
      amount: 100,
      idempotencyKey,
      userId: 'USER-1',
    });

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    expect(invoice?.status).toBe('PAID');
    expect(invoice?.balanceAmount.toNumber()).toBe(0);
    expect(invoice?.paidAmount.toNumber()).toBe(100);
    expect(invoice?.version).toBe(2);

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    expect(payment?.allocatedAmount.toNumber()).toBe(100);
    expect(payment?.version).toBe(2);

    const allocations = await prisma.paymentAllocation.findMany({ where: { paymentId } });
    expect(allocations.length).toBe(1);
    expect(allocations[0].allocatedAmount.toNumber()).toBe(100);
    expect(allocations[0].status).toBe('ACTIVE');
    expect(allocations[0].idempotencyKey).toBe(idempotencyKey);
  });

  it('should block allocation if invoice balance is exceeded (Rule 3)', async () => {
    // Attempt to allocate 150 from a payment of 100
    // Wait, first rule that will hit is payment remaining exceeded.
    // Let's create a payment of 200 and try to allocate 150 to an invoice of 100.
    const intent200 = await prisma.paymentIntent.create({
      data: {
        hospitalId,
        invoiceId,
        patientId,
        amount: 200,
        idempotencyKey: randomUUID(),
        status: 'CAPTURED',
        paymentMethod: 'CASH',
      },
    });

    const payment200 = await prisma.payment.create({
      data: {
        hospitalId,
        patientId,
        intentId: intent200.id,
        amount: 200,
        allocatedAmount: 0,
        method: 'CASH',
        status: PaymentStatus.CAPTURED,
        gatewayTransactionId: randomUUID(),
      },
    });

    await expect(
      allocationAggregate.allocate({
        hospitalId,
        invoiceId,
        paymentId: payment200.id,
        amount: 150,
        idempotencyKey: randomUUID(),
        userId: 'USER-1',
      }),
    ).rejects.toThrow('Over-allocation: Requested 150, but invoice balance is 100');
  });

  it('should block allocation if payment amount is exceeded (Rule 4)', async () => {
    await expect(
      allocationAggregate.allocate({
        hospitalId,
        invoiceId,
        paymentId,
        amount: 150,
        idempotencyKey: randomUUID(),
        userId: 'USER-1',
      }),
    ).rejects.toThrow('Over-allocation: Requested 150, but payment only has 100 remaining');
  });

  it('should enforce idempotency for duplicate allocations', async () => {
    const idempotencyKey = randomUUID();

    // First allocation succeeds
    await allocationAggregate.allocate({
      hospitalId,
      invoiceId,
      paymentId,
      amount: 50,
      idempotencyKey,
      userId: 'USER-1',
    });

    // Second allocation with same idempotency key fails
    await expect(
      allocationAggregate.allocate({
        hospitalId,
        invoiceId,
        paymentId,
        amount: 50,
        idempotencyKey,
        userId: 'USER-1',
      }),
    ).rejects.toThrow(`Allocation with idempotency key ${idempotencyKey} already exists`);
  });

  it('should block allocation if payment is not CAPTURED', async () => {
    // Make payment PENDING
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'PENDING' },
    });

    await expect(
      allocationAggregate.allocate({
        hospitalId,
        invoiceId,
        paymentId,
        amount: 100,
        idempotencyKey: randomUUID(),
        userId: 'USER-1',
      }),
    ).rejects.toThrow('Payment must be CAPTURED to allocate');
  });

  it('should reject allocation if currencies mismatch', async () => {
    // Make payment USD
    await prisma.payment.update({
      where: { id: paymentId },
      data: { currency: 'USD' },
    });

    await expect(
      allocationAggregate.allocate({
        hospitalId,
        invoiceId,
        paymentId,
        amount: 100,
        idempotencyKey: randomUUID(),
        userId: 'USER-1',
      }),
    ).rejects.toThrow('Currency mismatch. Payment currency USD is not supported');
  });
});
