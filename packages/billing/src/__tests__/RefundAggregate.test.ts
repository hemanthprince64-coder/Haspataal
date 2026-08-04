import { PrismaClient } from '@prisma/client';

import { Money } from '../pricing/Money';
import { RefundAggregate, CreateRefundCommand } from '../refunds/aggregates/RefundAggregate';

const prisma = new PrismaClient();

describe('RefundAggregate', () => {
  let testHospitalId: string;
  let testPatientId: string;
  let testInvoiceId: string;
  let testPaymentId: string;

  beforeAll(async () => {
    // Basic setup, this will rely on your test DB structure
    const hospital = await prisma.hospitalsMaster.findFirst();
    const patient = await prisma.patient.findFirst();
    if (!hospital || !patient) {
      console.warn('Need hospital and patient in test DB, skipping setup');
      return;
    }

    testHospitalId = hospital.id;
    testPatientId = patient.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should throw error if refund exceeds payment amount', async () => {
    // Setup dummy payment
    const payment = await prisma.payment.findFirst({
      where: { hospitalId: testHospitalId, status: 'CAPTURED' },
    });

    if (!payment) {
      console.log('Skipping test, no captured payment found');
      return;
    }

    const command: CreateRefundCommand = {
      paymentId: payment.id,
      hospitalId: testHospitalId,
      requestedBy: 'test-user',
      amount: payment.amount.toNumber() + 100, // Exceeds
      reason: 'Test Error Refund',
    };

    await expect(RefundAggregate.initiateRefund(command)).rejects.toThrow(
      /exceeds refundable balance/,
    );
  });
});
