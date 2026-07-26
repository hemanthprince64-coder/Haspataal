import { describe, it, expect, vi, beforeEach } from 'vitest';

import prisma from '../prisma';
import { services } from '../services';

// Mock Prisma with vi.fn inside factory (hoisted-safe pattern)
vi.mock('../prisma', () => ({
  __esModule: true,
  default: {
    otpCode: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    doctorMaster: {
      findUnique: vi.fn(),
    },
  },
  prisma: {
    otpCode: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
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

vi.mock('../rate-limit', () => ({
  rateLimiter: vi.fn(() => ({ allowed: true })),
}));

describe('Doctor OTP Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requestOtp', () => {
    it('should generate and store OTP for valid mobile', async () => {
      vi.mocked(prisma.otpCode.upsert).mockResolvedValue({});

      const result = await services.doctor.requestOtp('9876543210');

      expect(result).toBe(true);
      expect(prisma.otpCode.upsert).toHaveBeenCalledTimes(1);
      const upsertCall = (prisma.otpCode.upsert as any).mock.calls[0][0];
      expect(upsertCall.where).toEqual({ phone: '9876543210' });
      expect(upsertCall.create.code).toMatch(/^\d{4}$/);
      expect(upsertCall.create.expiresAt).toBeInstanceOf(Date);
    });

    it('should normalize mobile number', async () => {
      vi.mocked(prisma.otpCode.upsert).mockResolvedValue({});

      await services.doctor.requestOtp('+91-98765-43210');

      expect(prisma.otpCode.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { phone: '9876543210' },
        }),
      );
    });

    it('should respect rate limiting', async () => {
      const { rateLimiter } = await import('../rate-limit');
      vi.mocked(rateLimiter).mockResolvedValueOnce({ allowed: false });

      await expect(services.doctor.requestOtp('9876543210')).rejects.toThrow(
        'Too many OTP requests',
      );
    });

    it('should overwrite existing OTP for same mobile', async () => {
      vi.mocked(prisma.otpCode.upsert).mockResolvedValue({});

      await services.doctor.requestOtp('9876543210');

      expect(prisma.otpCode.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.any(Object),
        }),
      );
    });
  });

  describe('verifyOtp', () => {
    it('should verify valid OTP and return doctor', async () => {
      vi.mocked(prisma.otpCode.findUnique).mockResolvedValue({
        id: 'otp-1',
        phone: '9876543210',
        code: '1234',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
      vi.mocked(prisma.otpCode.delete).mockResolvedValue({});
      vi.mocked(prisma.doctorMaster.findUnique).mockResolvedValue({
        id: 'doctor-1',
        fullName: 'Dr. Test',
        mobile: '9876543210',
        email: 'doctor@test.com',
        accountStatus: 'ACTIVE',
      });

      const result = await services.doctor.verifyOtp('9876543210', '1234');

      expect(result.user.id).toBe('doctor-1');
      expect(result.user.role).toBe('DOCTOR');
      expect(prisma.otpCode.delete).toHaveBeenCalledWith({ where: { id: 'otp-1' } });
    });

    it('should reject expired OTP', async () => {
      vi.mocked(prisma.otpCode.findUnique).mockResolvedValue({
        id: 'otp-1',
        phone: '9876543210',
        code: '1234',
        expiresAt: new Date(Date.now() - 60 * 1000),
      });

      await expect(services.doctor.verifyOtp('9876543210', '1234')).rejects.toThrow(
        'OTP has expired',
      );
    });

    it('should reject invalid OTP code', async () => {
      vi.mocked(prisma.otpCode.findUnique).mockResolvedValue({
        id: 'otp-1',
        phone: '9876543210',
        code: '1234',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      await expect(services.doctor.verifyOtp('9876543210', '0000')).rejects.toThrow('Invalid OTP');
    });

    it('should reject when OTP not found', async () => {
      vi.mocked(prisma.otpCode.findUnique).mockResolvedValue(null);

      await expect(services.doctor.verifyOtp('9876543210', '1234')).rejects.toThrow(
        'OTP not requested',
      );
    });

    it('should reject suspended accounts', async () => {
      vi.mocked(prisma.otpCode.findUnique).mockResolvedValue({
        id: 'otp-1',
        phone: '9876543210',
        code: '1234',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
      vi.mocked(prisma.doctorMaster.findUnique).mockResolvedValue({
        id: 'doctor-1',
        fullName: 'Dr. Test',
        mobile: '9876543210',
        email: 'doctor@test.com',
        accountStatus: 'SUSPENDED',
      });

      await expect(services.doctor.verifyOtp('9876543210', '1234')).rejects.toThrow(
        'Account is suspended',
      );
    });

    it('should prevent replay attacks by deleting OTP after success', async () => {
      vi.mocked(prisma.otpCode.findUnique).mockResolvedValue({
        id: 'otp-1',
        phone: '9876543210',
        code: '1234',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
      vi.mocked(prisma.otpCode.delete).mockResolvedValue({});
      vi.mocked(prisma.doctorMaster.findUnique).mockResolvedValue({
        id: 'doctor-1',
        fullName: 'Dr. Test',
        mobile: '9876543210',
        email: 'doctor@test.com',
        accountStatus: 'ACTIVE',
      });

      await services.doctor.verifyOtp('9876543210', '1234');

      expect(prisma.otpCode.delete).toHaveBeenCalledWith({ where: { id: 'otp-1' } });
    });
  });
});
