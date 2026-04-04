import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookSmartSlot } from '../slot-engine';
import { prisma } from '../../util/prisma-singleton';
import { acquireDistributedLock } from '../redlock';

// Mock dependencies
vi.mock('../../util/prisma-singleton', () => ({
  prisma: {
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
    appointment: {
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    doctorSlotBlock: {
      findFirst: vi.fn(),
    },
    outboxEvent: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('../redlock', () => ({
  acquireDistributedLock: vi.fn(),
}));

vi.mock('../../util/safe-transaction', () => ({
  withRetry: vi.fn((fn) => fn()),
}));

describe('Slot Engine: bookSmartSlot', () => {
  const mockData = {
    hospitalId: 'hosp-1',
    doctorId: 'doc-1',
    patientGlobalId: 'pat-1',
    slotTime: new Date('2026-04-05T10:00:00Z'),
    idempotencyKey: 'idem-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should prevent booking if distributed lock is unavailable', async () => {
    (acquireDistributedLock as any).mockResolvedValue(null);

    await expect(bookSmartSlot(mockData)).rejects.toThrow('Conflict: Slot is currently being processed');
  });

  it('should return existing appointment if idempotency key matches', async () => {
    const mockLock = { release: vi.fn() };
    (acquireDistributedLock as any).mockResolvedValue(mockLock);
    
    const mockExisting = { id: 'app-existing', status: 'BOOKED' };
    (prisma.$transaction as any).mockImplementation(async (callback) => {
      return await callback({
        appointment: { findUnique: vi.fn().mockResolvedValue(mockExisting) }
      });
    });

    const result = await bookSmartSlot(mockData);
    expect(result).toEqual(mockExisting);
    expect(mockLock.release).toHaveBeenCalled();
  });

  it('should throw error if doctor has an emergency block', async () => {
    const mockLock = { release: vi.fn() };
    (acquireDistributedLock as any).mockResolvedValue(mockLock);

    (prisma.$transaction as any).mockImplementation(async (callback) => {
      return await callback({
        appointment: { findUnique: vi.fn().mockResolvedValue(null) },
        doctorSlotBlock: { findFirst: vi.fn().mockResolvedValue({ id: 'block-1' }) }
      });
    });

    await expect(bookSmartSlot(mockData)).rejects.toThrow('Doctor is currently unavailable');
    expect(mockLock.release).toHaveBeenCalled();
  });

  it('should throw error if slot is at full capacity', async () => {
    const mockLock = { release: vi.fn() };
    (acquireDistributedLock as any).mockResolvedValue(mockLock);

    (prisma.$transaction as any).mockImplementation(async (callback) => {
      const tx = {
        appointment: { 
            findUnique: vi.fn().mockResolvedValue(null),
            count: vi.fn().mockResolvedValue(1) 
        },
        doctorSlotBlock: { findFirst: vi.fn().mockResolvedValue(null) },
        $queryRaw: vi.fn().mockResolvedValue([{ id: 'slot-1', capacity: 1 }])
      };
      return await callback(tx);
    });

    await expect(bookSmartSlot(mockData)).rejects.toThrow('Slot is at full capacity');
  });
});
