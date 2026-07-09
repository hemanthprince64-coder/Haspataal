import { PrismaClient } from '@prisma/client';
import { describe, it, expect, vi } from 'vitest';

import { IdentityCryptography } from './cryptography';
import { MobileNormalization } from './normalization';
import { IdentityService } from './service';

vi.mock('@prisma/client', () => {
  const mPrismaClient = {
    patientAlias: {
      findUnique: vi.fn(),
    },
    patientContactPoint: {
      findFirst: vi.fn(),
    },
    patient: {
      findUnique: vi.fn(),
    },
    mobileVerificationChallenge: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mPrismaClient) };
});

vi.mock('./cryptography', () => ({
  IdentityCryptography: {
    generateLookupHash: vi.fn(() => ({ hash: 'testhash', version: 'v1' })),
    encryptValue: vi.fn(() => ({ encrypted: 'testencrypted', version: 'v1' })),
  },
}));

describe('IdentityService', () => {
  const prisma = new PrismaClient() as any;

  describe('resolvePatientId', () => {
    it('should resolve a non-aliased patient ID to itself', async () => {
      prisma.patientAlias.findUnique.mockResolvedValueOnce(null);
      const result = await IdentityService.resolvePatientId('patient-1');
      expect(result).toBe('patient-1');
    });

    it('should resolve an aliased patient ID to its canonical ID', async () => {
      prisma.patientAlias.findUnique.mockResolvedValueOnce({
        aliasPatientId: 'alias-1',
        canonicalPatientId: 'canonical-1',
      });
      prisma.patientAlias.findUnique.mockResolvedValueOnce(null);
      const result = await IdentityService.resolvePatientId('alias-1');
      expect(result).toBe('canonical-1');
    });

    it('should throw on cyclic aliases exceeding depth 5', async () => {
      prisma.patientAlias.findUnique.mockResolvedValue({
        aliasPatientId: 'loop',
        canonicalPatientId: 'loop-next',
      });
      await expect(IdentityService.resolvePatientId('loop')).rejects.toThrow(
        /Alias resolution depth exceeded/,
      );
    });
  });

  describe('MobileNormalization', () => {
    it('should normalize valid Indian mobile numbers', () => {
      expect(MobileNormalization.normalize('9999999999')).toBe('+919999999999');
      expect(MobileNormalization.normalize('+919999999999')).toBe('+919999999999');
    });

    it('should throw on invalid numbers', () => {
      expect(() => MobileNormalization.normalize('12345')).toThrow();
    });
  });
});
