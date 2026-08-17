import { PrismaClient, Prisma, PaymentMethod } from '@haspataal/db';
import { eventBus } from '@haspataal/events';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CreatePaymentIntentUseCase } from '../payments/CreatePaymentIntentUseCase';

vi.mock('@haspataal/events', () => ({
  eventBus: {
    publish: vi.fn(),
  },
}));

describe('CreatePaymentIntentUseCase', () => {
  let prisma: PrismaClient;
  let useCase: CreatePaymentIntentUseCase;

  beforeEach(() => {
    prisma = new PrismaClient();
    useCase = new CreatePaymentIntentUseCase(prisma);
    vi.clearAllMocks();
  });

  it('creates intent if outstanding balance is sufficient', async () => {
    const txMock = {
      invoice: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'inv-1',
          hospitalId: 'hosp-1',
          patientId: 'pat-1',
          status: 'ISSUED',
          totalAmount: new Prisma.Decimal(1000),
          paidAmount: new Prisma.Decimal(0),
          payload: { currency: 'INR' },
          version: 1,
        }),
        update: vi.fn().mockResolvedValue({ id: 'inv-1', version: 2 }),
      },
      paymentIntent: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 'intent-1' }),
      },
      billingAudit: {
        create: vi.fn().mockResolvedValue({}),
      },
    };

    vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => cb(txMock));

    const result = await useCase.execute({
      hospitalId: 'hosp-1',
      patientId: 'pat-1',
      invoiceId: 'inv-1',
      amount: 500,
      currency: 'INR',
      paymentMethod: PaymentMethod.CASH,
      idempotencyKey: 'idemp-1',
      performedBy: 'user-1',
    });

    expect(result).toBeDefined();
    expect(txMock.paymentIntent.create).toHaveBeenCalled();
    expect(txMock.invoice.update).toHaveBeenCalledWith({
      where: { id: 'inv-1', version: 1 },
      data: { version: { increment: 1 } },
    });
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it('rejects if intent amount exceeds outstanding balance (due to existing intents)', async () => {
    const txMock = {
      invoice: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'inv-1',
          hospitalId: 'hosp-1',
          patientId: 'pat-1',
          status: 'ISSUED',
          totalAmount: new Prisma.Decimal(1000),
          paidAmount: new Prisma.Decimal(0),
          payload: { currency: 'INR' },
          version: 1,
        }),
      },
      paymentIntent: {
        findMany: vi.fn().mockResolvedValue([
          {
            amount: new Prisma.Decimal(800),
            currency: 'INR',
            status: 'PENDING',
            idempotencyKey: 'old-1',
          },
        ]),
      },
    };

    vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => cb(txMock));

    await expect(
      useCase.execute({
        hospitalId: 'hosp-1',
        patientId: 'pat-1',
        invoiceId: 'inv-1',
        amount: 500, // 800 + 500 = 1300 > 1000
        currency: 'INR',
        paymentMethod: PaymentMethod.CASH,
        idempotencyKey: 'idemp-new',
        performedBy: 'user-1',
      }),
    ).rejects.toThrow('Cannot reserve 500. Outstanding unreserved balance is 200.');
  });

  it('handles idempotency by returning existing intent id', async () => {
    const txMock = {
      invoice: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'inv-1',
          hospitalId: 'hosp-1',
          patientId: 'pat-1',
          status: 'ISSUED',
          totalAmount: new Prisma.Decimal(1000),
          paidAmount: new Prisma.Decimal(0),
          payload: { currency: 'INR' },
          version: 1,
        }),
      },
      paymentIntent: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'existing-intent-id',
            amount: new Prisma.Decimal(500),
            currency: 'INR',
            status: 'PENDING',
            idempotencyKey: 'idemp-1',
          },
        ]),
      },
    };

    vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => cb(txMock));

    const result = await useCase.execute({
      hospitalId: 'hosp-1',
      patientId: 'pat-1',
      invoiceId: 'inv-1',
      amount: 500,
      currency: 'INR',
      paymentMethod: PaymentMethod.CASH,
      idempotencyKey: 'idemp-1',
      performedBy: 'user-1',
    });

    expect(result).toBe('existing-intent-id');
    // Ensure we did not create a new one
    expect(txMock.paymentIntent?.create).toBeUndefined();
  });

  it('rejects currency mismatch', async () => {
    const txMock = {
      invoice: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'inv-1',
          hospitalId: 'hosp-1',
          patientId: 'pat-1',
          status: 'ISSUED',
          totalAmount: new Prisma.Decimal(1000),
          paidAmount: new Prisma.Decimal(0),
          payload: { currency: 'INR' },
          version: 1,
        }),
      },
    };

    vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => cb(txMock));

    await expect(
      useCase.execute({
        hospitalId: 'hosp-1',
        patientId: 'pat-1',
        invoiceId: 'inv-1',
        amount: 500,
        currency: 'USD',
        paymentMethod: PaymentMethod.CASH,
        idempotencyKey: 'idemp-1',
        performedBy: 'user-1',
      }),
    ).rejects.toThrow('Currency mismatch: Cannot operate on USD and INR');
  });
});
