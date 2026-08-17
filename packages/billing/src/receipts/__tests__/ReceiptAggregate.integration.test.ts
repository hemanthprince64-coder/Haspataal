import { PrismaClient } from '@prisma/client';

import { ReceiptAggregate } from '../aggregates/ReceiptAggregate';

const prisma = new PrismaClient();

describe('ReceiptAggregate Integration Test', () => {
  let hospitalId: string;
  let patientId: string;
  let invoiceId: string;
  let paymentId: string;
  let allocationId: string;
  let receiptAggregate: ReceiptAggregate;

  beforeAll(async () => {
    // 1. Setup minimal seed data
    const hospital = await prisma.hospitalsMaster.create({
      data: {
        legalName: 'Receipt Test Hospital',
        registrationNumber: `REG-RTH-${Date.now()}`,
      },
    });
    hospitalId = hospital.id;

    const patient = await prisma.patient.create({
      data: {
        name: 'John Receipt',
      },
    });
    patientId = patient.id;

    const invoice = await prisma.invoice.create({
      data: {
        hospitalId,
        patientId,
        invoiceNumber: `INV-RTH-${Date.now()}`,
        status: 'ISSUED',
        totalAmount: 1000,
        balanceAmount: 1000,
      },
    });
    invoiceId = invoice.id;

    const paymentIntent = await prisma.paymentIntent.create({
      data: {
        hospitalId,
        patientId,
        invoiceId,
        amount: 500,
        currency: 'INR',
        status: 'CAPTURED',
        expiresAt: new Date(Date.now() + 100000),
        idempotencyKey: 'test-idem-1',
      },
    });

    const payment = await prisma.payment.create({
      data: {
        hospital: { connect: { id: hospitalId } },
        patient: { connect: { id: patientId } },
        status: 'CAPTURED',
        amount: 500,
        method: 'CASH',
        gatewayTransactionId: 'TXN123',
        intent: { connect: { id: paymentIntent.id } },
      },
    });
    paymentId = payment.id;

    const allocation = await prisma.paymentAllocation.create({
      data: {
        allocationNumber: `ALLOC-${Date.now()}`,
        paymentId,
        invoiceId,
        hospitalId,
        allocatedAmount: 500,
        status: 'ACTIVE',
        currency: 'INR',
        createdBy: 'test-user',
        idempotencyKey: `alloc-idem-${Date.now()}`,
      },
    });
    allocationId = allocation.id;

    receiptAggregate = new ReceiptAggregate();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.receiptLine.deleteMany({ where: { receipt: { hospitalId } } });
    await prisma.receipt.deleteMany({ where: { hospitalId } });
    await prisma.paymentAllocation.deleteMany({ where: { id: allocationId } });
    await prisma.payment.deleteMany({ where: { id: paymentId } });
    await prisma.paymentIntent.deleteMany({ where: { invoiceId } });
    await prisma.invoice.deleteMany({ where: { id: invoiceId } });
    await prisma.patient.deleteMany({ where: { id: patientId } });
    await prisma.hospitalsMaster.deleteMany({ where: { id: hospitalId } });
    await prisma.$disconnect();
  });

  it('should generate a receipt for valid allocations', async () => {
    const receiptId = await receiptAggregate.generate({
      hospitalId,
      patientId,
      userId: 'u1',
      allocationIds: [allocationId],
    });

    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: { lines: true },
    });

    expect(receipt).toBeDefined();
    expect(receipt?.totalAmount.toNumber()).toBe(500);
    expect(receipt?.receiptNumber).toBeDefined();
    expect(receipt?.status).toBe('ISSUED');
    expect(receipt?.lines.length).toBe(1);
    expect(receipt?.lines[0].allocationId).toBe(allocationId);

    // Check snapshot
    const snapshot: any = receipt?.snapshot;
    expect(snapshot.patient.name).toBe('John Receipt');
    expect(snapshot.hospital.name).toBe('Receipt Test Hospital');
    expect(snapshot.allocations[0].amount).toBe(500);
  });

  it('should block generating a second receipt for the same allocation', async () => {
    await expect(
      receiptAggregate.generate({
        hospitalId,
        patientId,
        userId: 'u2',
        allocationIds: [allocationId],
      }),
    ).rejects.toThrow(/already receipted/);
  });
});
