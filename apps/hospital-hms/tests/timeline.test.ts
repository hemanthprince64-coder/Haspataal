import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { TimelineQueryHandler, TimelineMutationHandler } from '@haspataal/timeline';

vi.mock('@prisma/client', () => {
  const mPrisma: any = {
    $use: vi.fn(),
    $transaction: vi.fn(async (callback: any) => callback(mPrisma)),
    $executeRawUnsafe: vi.fn(),
    timelineEvent: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    timelineBookmark: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
    },
    timelineExport: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    timelineAudit: {
      count: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(function PrismaClient() { return mPrisma; }) };
});

const prisma = new PrismaClient();

describe('Clinical Timeline Engine - Service Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('verifyIntegrity', () => {
    it('should return valid true if hashes match', async () => {
      const mockEvent = {
        patientId: 'patient-1',
        eventType: 'PrescriptionCreated',
        timestamp: new Date('2026-06-30T00:00:00Z'),
        metadata: { drug: 'Paracetamol' },
        integrityHash: 'e7e5f19e64ad4dc0cd4b8ce7884ca37bfbbfec690e65e96a63e19563a13fd3f3',
      };

      (prisma.timelineEvent.findUnique as any).mockResolvedValue(mockEvent);

      const query: any = { filters: { eventId: 'event-1' } };
      const result = await TimelineQueryHandler.verifyIntegrity(query);
      expect(result.valid).toBe(true);
      expect((result as any).tampered).toBe(false);
    });

    it('should return valid false and tampered true if hashes do not match', async () => {
      const mockEvent = {
        patientId: 'patient-1',
        eventType: 'PrescriptionCreated',
        timestamp: new Date('2026-06-30T00:00:00Z'),
        metadata: { drug: 'Paracetamol' },
        integrityHash: 'invalid-hash',
      };

      (prisma.timelineEvent.findUnique as any).mockResolvedValue(mockEvent);

      const query: any = { filters: { eventId: 'event-1' } };
      const result = await TimelineQueryHandler.verifyIntegrity(query);
      expect(result.valid).toBe(false);
      expect((result as any).tampered).toBe(true);
    });

    it('should return error if event not found', async () => {
      (prisma.timelineEvent.findUnique as any).mockResolvedValue(null);

      const query: any = { filters: { eventId: 'event-invalid' } };
      const result = await TimelineQueryHandler.verifyIntegrity(query);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Event not found');
    });
  });

  describe('Bookmarks', () => {
    it('should add bookmark successfully', async () => {
      const mockBookmark = { id: 'bookmark-1', userId: 'user-1', eventId: 'event-1' };
      (prisma.timelineBookmark.create as any).mockResolvedValue(mockBookmark);

      const result = await TimelineMutationHandler.addBookmark('user-1', 'event-1', 'Notes');
      expect(result).toEqual(mockBookmark);
    });
  });
});
