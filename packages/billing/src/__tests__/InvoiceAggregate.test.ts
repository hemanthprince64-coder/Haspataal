import { PrismaClient, Prisma } from '@haspataal/db';
import { eventBus } from '@haspataal/events';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { InvoiceAggregate } from '../aggregates/InvoiceAggregate';
import { InvoiceNumberGenerator } from '../services/InvoiceNumberGenerator';

// Mock the eventBus and InvoiceNumberGenerator
vi.mock('@haspataal/events', () => ({
  eventBus: {
    publish: vi.fn(),
  },
}));

vi.mock('../services/InvoiceNumberGenerator', () => ({
  InvoiceNumberGenerator: {
    generate: vi.fn().mockResolvedValue('INV-2026-001001'),
  },
}));

describe('InvoiceAggregate', () => {
  let prisma: PrismaClient;
  let invoiceAggregate: InvoiceAggregate;

  beforeEach(() => {
    prisma = new PrismaClient();
    invoiceAggregate = new InvoiceAggregate(prisma);
    vi.clearAllMocks();
  });

  it('Multiple ChargeItems -> One Invoice, Multiple LineItems', async () => {
    // We will use vi.spyOn to mock prisma.$transaction and the nested calls
    // But testing prisma with mocks can be brittle, let's just mock what we need.
    const mockChargeItems = [
      {
        id: 'charge-1',
        hospitalId: 'hosp-1',
        patientId: 'pat-1',
        sourceEvent: 'CONSULTATION_COMPLETED',
        status: 'UNBILLED',
        currency: 'INR',
        grossAmount: new Prisma.Decimal(500),
        taxAmount: new Prisma.Decimal(25),
        discountAmount: new Prisma.Decimal(0),
        netAmount: new Prisma.Decimal(525),
        quantity: new Prisma.Decimal(1),
        unitPrice: new Prisma.Decimal(500),
      },
      {
        id: 'charge-2',
        hospitalId: 'hosp-1',
        patientId: 'pat-1',
        sourceEvent: 'LAB_RESULT_VERIFIED',
        status: 'UNBILLED',
        currency: 'INR',
        grossAmount: new Prisma.Decimal(300),
        taxAmount: new Prisma.Decimal(0),
        discountAmount: new Prisma.Decimal(0),
        netAmount: new Prisma.Decimal(300),
        quantity: new Prisma.Decimal(1),
        unitPrice: new Prisma.Decimal(300),
      },
    ];

    const txMock = {
      chargeItem: {
        findMany: vi.fn().mockResolvedValue(mockChargeItems),
        updateMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      patient: {
        findUnique: vi.fn().mockResolvedValue({ id: 'pat-1', name: 'John Doe' }),
      },
      hospitalsMaster: {
        findUnique: vi.fn().mockResolvedValue({ id: 'hosp-1', name: 'General Hospital' }),
      },
      billingAudit: {
        createMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      invoice: {
        create: vi.fn().mockResolvedValue({ id: 'invoice-123' }),
      },
    };

    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
      return (callback as any)(txMock);
    });

    const result = await invoiceAggregate.generate('hosp-1', 'pat-1');

    expect(result).toBeDefined();

    // Check allocations happened correctly
    expect(txMock.chargeItem.updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        id: { in: ['charge-1', 'charge-2'] },
        status: 'UNBILLED',
      },
      data: { status: 'ALLOCATED' },
    });

    // Check Invoice Creation
    expect(txMock.invoice.create).toHaveBeenCalled();
    const createArgs = txMock.invoice.create.mock.calls[0][0];
    expect(createArgs.data.hospitalId).toBe('hosp-1');
    expect(createArgs.data.patientId).toBe('pat-1');
    expect(createArgs.data.subtotal.toNumber()).toBe(800);
    expect(createArgs.data.gstTotal.toNumber()).toBe(25);
    expect(createArgs.data.totalAmount.toNumber()).toBe(825);
    expect(createArgs.data.lineItems.createMany.data).toHaveLength(2);

    // Check INVOICED transition
    expect(txMock.chargeItem.updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: { in: ['charge-1', 'charge-2'] } },
      data: { status: 'INVOICED' },
    });

    // Check event emission
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const eventArg = vi.mocked(eventBus.publish).mock.calls[0][0] as any;
    expect(eventArg.type).toBe('INVOICE_GENERATED');
    expect(eventArg.payload.subtotal).toBe(800);
    expect(eventArg.payload.totalAmount).toBe(825);
  });

  it('No UNBILLED charges -> No invoice generated', async () => {
    const txMock = {
      chargeItem: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };

    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
      return (callback as any)(txMock);
    });

    const result = await invoiceAggregate.generate('hosp-1', 'pat-1');
    expect(result).toBeNull();
    expect(txMock.chargeItem.findMany).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('Transaction Rollback -> ChargeItems remain UNBILLED if allocation count mismatches', async () => {
    const mockChargeItems = [{ id: 'charge-1', status: 'UNBILLED' }];

    const txMock = {
      chargeItem: {
        findMany: vi.fn().mockResolvedValue(mockChargeItems),
        // Simulate concurrency where it fails to update the row
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    };

    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
      return (callback as any)(txMock);
    });

    await expect(invoiceAggregate.generate('hosp-1', 'pat-1')).rejects.toThrow(
      'Concurrency conflict: Some charge items were modified by another process.',
    );

    // Publish not called
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('Duplicate Worker Test -> Prevents duplicate invoice if another worker allocates first', async () => {
    // Worker A succeeds in allocation
    // Worker B fails allocation check because rows were updated
    const mockChargeItems = [
      {
        id: 'charge-1',
        status: 'UNBILLED',
        currency: 'INR',
        grossAmount: new Prisma.Decimal(100),
        taxAmount: new Prisma.Decimal(10),
        discountAmount: new Prisma.Decimal(0),
        netAmount: new Prisma.Decimal(110),
        quantity: new Prisma.Decimal(1),
        unitPrice: new Prisma.Decimal(100),
      },
    ];

    const txMockA = {
      chargeItem: {
        findMany: vi.fn().mockResolvedValue(mockChargeItems),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }), // Worker A allocates
      },
      patient: { findUnique: vi.fn().mockResolvedValue({ id: 'pat-1', name: 'John Doe' }) },
      hospitalsMaster: {
        findUnique: vi.fn().mockResolvedValue({ id: 'hosp-1', name: 'General Hospital' }),
      },
      billingAudit: { createMany: vi.fn().mockResolvedValue({ count: 2 }) },
      invoice: { create: vi.fn().mockResolvedValue({ id: 'inv-1' }) },
    };

    const txMockB = {
      chargeItem: {
        findMany: vi.fn().mockResolvedValue(mockChargeItems), // B reads before A commits
        updateMany: vi.fn().mockResolvedValue({ count: 0 }), // B tries to allocate but A locked it
      },
      patient: { findUnique: vi.fn().mockResolvedValue({ id: 'pat-1', name: 'John Doe' }) },
      hospitalsMaster: {
        findUnique: vi.fn().mockResolvedValue({ id: 'hosp-1', name: 'General Hospital' }),
      },
      billingAudit: { createMany: vi.fn().mockResolvedValue({ count: 2 }) },
    };

    // Spy implementation that alternates between txMockA and txMockB
    let callCount = 0;
    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
      callCount++;
      return (callback as any)(callCount === 1 ? txMockA : txMockB);
    });

    // Run both (simulating concurrent requests entering at the same time)
    const results = await Promise.allSettled([
      invoiceAggregate.generate('hosp-1', 'pat-1'),
      invoiceAggregate.generate('hosp-1', 'pat-1'),
    ]);

    // One should fulfill, one should reject
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    if (rejected[0].status === 'rejected') {
      expect(rejected[0].reason.message).toContain('Concurrency conflict');
    }
  });

  it('Large Invoice Stress Test', async () => {
    const mockChargeItems = Array.from({ length: 1000 }).map((_, i) => ({
      id: `charge-${i}`,
      hospitalId: 'hosp-1',
      patientId: 'pat-1',
      sourceEvent: 'CONSULTATION_COMPLETED',
      status: 'UNBILLED',
      currency: 'INR',
      grossAmount: new Prisma.Decimal(10),
      taxAmount: new Prisma.Decimal(1),
      discountAmount: new Prisma.Decimal(0),
      netAmount: new Prisma.Decimal(11),
      quantity: new Prisma.Decimal(1),
      unitPrice: new Prisma.Decimal(10),
    }));

    const txMock = {
      chargeItem: {
        findMany: vi.fn().mockResolvedValue(mockChargeItems),
        updateMany: vi.fn().mockResolvedValue({ count: 1000 }),
      },
      patient: { findUnique: vi.fn().mockResolvedValue({ id: 'pat-1', name: 'John Doe' }) },
      hospitalsMaster: {
        findUnique: vi.fn().mockResolvedValue({ id: 'hosp-1', name: 'General Hospital' }),
      },
      billingAudit: { createMany: vi.fn().mockResolvedValue({ count: 2 }) },
      invoice: {
        create: vi.fn().mockResolvedValue({ id: 'invoice-large' }),
      },
    };

    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
      return (callback as any)(txMock);
    });

    const result = await invoiceAggregate.generate('hosp-1', 'pat-1');
    expect(result).toBeDefined();

    expect(txMock.invoice.create).toHaveBeenCalled();
    const createArgs = txMock.invoice.create.mock.calls[0][0];
    expect(createArgs.data.lineItems.createMany.data).toHaveLength(1000);
    expect(createArgs.data.totalAmount.toNumber()).toBe(11000); // 1000 * 11
  });
});
