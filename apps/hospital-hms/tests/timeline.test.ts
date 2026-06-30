import { PrismaClient } from '@prisma/client';

import * as TimelineService from '@/lib/services/timeline';

jest.mock('@prisma/client', () => {
  const mPrisma = {
    timelineEvent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    timelineBookmark: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
    },
    timelineExport: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    timelineAudit: {
      count: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

const prisma = new PrismaClient();

describe('Clinical Timeline Engine - Service Layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyIntegrity', () => {
    it('should return valid true if hashes match', async () => {
      const mockEvent = {
        patientId: 'patient-1',
        eventType: 'PrescriptionCreated',
        timestamp: new Date('2026-06-30T00:00:00Z'),
        metadata: { drug: 'Paracetamol' },
        integrityHash: 'f4d99dc0fb5fa1d29380a0684f5bc938367d057a6021666f7f259fe7b71946eb',
      };

      (prisma.timelineEvent.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      const result = await TimelineService.verifyIntegrity('event-1');
      expect(result.valid).toBe(true);
      expect(result.tampered).toBe(false);
    });

    it('should return valid false and tampered true if hashes do not match', async () => {
      const mockEvent = {
        patientId: 'patient-1',
        eventType: 'PrescriptionCreated',
        timestamp: new Date('2026-06-30T00:00:00Z'),
        metadata: { drug: 'Paracetamol' },
        integrityHash: 'invalid-hash',
      };

      (prisma.timelineEvent.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      const result = await TimelineService.verifyIntegrity('event-1');
      expect(result.valid).toBe(false);
      expect(result.tampered).toBe(true);
    });

    it('should return error if event not found', async () => {
      (prisma.timelineEvent.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await TimelineService.verifyIntegrity('event-invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Event not found');
    });
  });

  describe('Bookmarks', () => {
    it('should add bookmark successfully', async () => {
      const mockBookmark = { id: 'bookmark-1', userId: 'user-1', eventId: 'event-1' };
      (prisma.timelineBookmark.create as jest.Mock).mockResolvedValue(mockBookmark);

      const result = await TimelineService.addBookmark('user-1', 'event-1', 'Notes');
      expect(result).toEqual(mockBookmark);
    });
  });
});
