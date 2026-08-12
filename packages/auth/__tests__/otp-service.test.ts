import { prisma } from '@haspataal/db';
import { logger } from '@haspataal/logger';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { UnifiedOtpService } from '../otp-service';

vi.mock('ioredis', () => {
  const createMockInstance = () => ({
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    on: vi.fn(),
    connect: vi.fn(),
  });
  return {
    __esModule: true,
    default: function () {
      return createMockInstance();
    },
    Redis: function () {
      return createMockInstance();
    },
  };
});

vi.mock('@haspataal/db', () => ({
  __esModule: true,
  prisma: {
    otpCode: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    patient: {
      findUnique: vi.fn(),
    },
    doctorMaster: {
      findUnique: vi.fn(),
    },
  },
  default: {
    otpCode: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    patient: {
      findUnique: vi.fn(),
    },
    doctorMaster: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@haspataal/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('UnifiedOtpService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requestOtp', () => {
    it('should generate and store OTP for patient', async () => {
      vi.mocked(prisma.otpCode.upsert).mockResolvedValue({} as any);

      const result = await UnifiedOtpService.requestOtp('9876543210', {
        entityType: 'PATIENT',
      } as any);

      expect(result.success).toBe(true);
      expect(result.code).toMatch(/^\d{6}$/);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(prisma.otpCode.upsert).toHaveBeenCalledTimes(1);
    });

    it('should generate and store OTP for doctor', async () => {
      vi.mocked(prisma.otpCode.upsert).mockResolvedValue({} as any);

      const result = await UnifiedOtpService.requestOtp('9876543210', {
        entityType: 'DOCTOR',
      } as any);

      expect(result.success).toBe(true);
      expect(result.code).toMatch(/^\d{6}$/);
      expect(prisma.otpCode.upsert).toHaveBeenCalledTimes(1);
    });

    it('should generate and store OTP for hospital', async () => {
      vi.mocked(prisma.otpCode.upsert).mockResolvedValue({} as any);

      const result = await UnifiedOtpService.requestOtp('9876543210', {
        entityType: 'HOSPITAL',
      } as any);

      expect(result.success).toBe(true);
      expect(result.code).toMatch(/^\d{6}$/);
      expect(prisma.otpCode.upsert).toHaveBeenCalledTimes(1);
    });

    it('should normalize mobile number', async () => {
      vi.mocked(prisma.otpCode.upsert).mockResolvedValue({} as any);

      await UnifiedOtpService.requestOtp('+91-98765-43210', {
        entityType: 'PATIENT',
      } as any);

      const upsertCall = (prisma.otpCode.upsert as any).mock.calls[0][0];
      expect(upsertCall.where.tenantId_phone_purpose.phone).toBe('9876543210');
    });

    it('should overwrite existing OTP for same mobile', async () => {
      vi.mocked(prisma.otpCode.upsert).mockResolvedValue({} as any);

      await UnifiedOtpService.requestOtp('9876543210', {
        entityType: 'PATIENT',
      } as any);

      const upsertCall = (prisma.otpCode.upsert as any).mock.calls[0][0];
      expect(upsertCall.update).toBeDefined();
      expect(upsertCall.create).toBeDefined();
    });
  });

  describe('verifyOtp', () => {
    it('should verify valid OTP and return patient', async () => {
      vi.mocked(prisma.otpCode.findUnique).mockResolvedValue({
        id: 'otp-1',
        phone: '9876543210',
        otpHash: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      } as any);
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({
        id: 'patient-1',
        name: 'Test Patient',
        phone: '9876543210',
        email: 'patient@test.com',
        accountStatus: 'ACTIVE',
      } as any);

      const result = await UnifiedOtpService.verifyOtp('9876543210', '123456', {
        entityType: 'PATIENT',
      } as any);

      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('patient-1');
      expect(result.user?.role).toBe('PATIENT');
      expect(prisma.otpCode.delete).toHaveBeenCalledWith({ where: { id: 'otp-1' } });
    });

    it('should verify valid OTP and return doctor', async () => {
      vi.mocked(prisma.otpCode.findUnique).mockResolvedValue({
        id: 'otp-1',
        phone: '9876543210',
        otpHash: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      } as any);
      vi.mocked(prisma.doctorMaster.findUnique).mockResolvedValue({
        id: 'doctor-1',
        fullName: 'Dr. Test',
        mobile: '9876543210',
        email: 'doctor@test.com',
        accountStatus: 'ACTIVE',
      } as any);

      const result = await UnifiedOtpService.verifyOtp('9876543210', '123456', {
        entityType: 'DOCTOR',
      } as any);

      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('doctor-1');
      expect(result.user?.role).toBe('DOCTOR');
      expect(prisma.otpCode.delete).toHaveBeenCalledWith({ where: { id: 'otp-1' } });
    });

    it('should reject expired OTP', async () => {
      vi.mocked(prisma.otpCode.findUnique).mockResolvedValue({
        id: 'otp-1',
        phone: '9876543210',
        otpHash: '123456',
        expiresAt: new Date(Date.now() - 60 * 1000),
      } as any);

      const result = await UnifiedOtpService.verifyOtp('9876543210', '123456', {
        entityType: 'PATIENT',
      } as any);

      expect(result.success).toBe(false);
      expect(result.message).toContain('expired');
    });

    it('should reject invalid OTP code', async () => {
      vi.mocked(prisma.otpCode.findUnique).mockResolvedValue({
        id: 'otp-1',
        phone: '9876543210',
        otpHash: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      } as any);

      const result = await UnifiedOtpService.verifyOtp('9876543210', '000000', {
        entityType: 'PATIENT',
      } as any);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid OTP');
    });

    it('should reject when OTP not found', async () => {
      vi.mocked(prisma.otpCode.findUnique).mockResolvedValue(null);

      const result = await UnifiedOtpService.verifyOtp('9876543210', '123456', {
        entityType: 'PATIENT',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('not requested');
    });

    it('should reject suspended accounts', async () => {
      vi.mocked(prisma.otpCode.findUnique).mockResolvedValue({
        id: 'otp-1',
        phone: '9876543210',
        otpHash: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      } as any);
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({
        id: 'patient-1',
        name: 'Test Patient',
        phone: '9876543210',
        email: 'patient@test.com',
        accountStatus: 'SUSPENDED',
      } as any);

      const result = await UnifiedOtpService.verifyOtp('9876543210', '123456', {
        entityType: 'PATIENT',
      } as any);

      expect(result.success).toBe(false);
      expect(result.message).toContain('suspended');
    });

    it('should reject when entity not found', async () => {
      vi.mocked(prisma.otpCode.findUnique).mockResolvedValue({
        id: 'otp-1',
        phone: '9876543210',
        otpHash: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      } as any);
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(null);

      const result = await UnifiedOtpService.verifyOtp('9876543210', '123456', {
        entityType: 'PATIENT',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });
  });
});
