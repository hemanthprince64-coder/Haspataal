import { describe, it, expect, vi, beforeEach } from 'vitest';

import { UnifiedOtpService } from '@/packages/auth';

import { services } from '../services';

vi.mock('@/packages/auth', () => ({
  UnifiedOtpService: {
    requestOtp: vi.fn(),
    verifyOtp: vi.fn(),
  },
}));

describe('Doctor OTP Service (Unified)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requestOtp', () => {
    it('should request OTP for valid mobile', async () => {
      vi.mocked(UnifiedOtpService.requestOtp).mockResolvedValueOnce({
        success: true,
        code: '123456',
        expiresAt: new Date(),
      });

      const result = await services.doctor.requestOtp('9876543210');

      expect(result).toBe(true);
      expect(UnifiedOtpService.requestOtp).toHaveBeenCalledWith('9876543210', {
        entityType: 'DOCTOR',
        channel: 'SMS',
      });
    });

    it('should normalize mobile number', async () => {
      vi.mocked(UnifiedOtpService.requestOtp).mockResolvedValueOnce({
        success: true,
        code: '123456',
        expiresAt: new Date(),
      });

      await services.doctor.requestOtp('+91-98765-43210');

      expect(UnifiedOtpService.requestOtp).toHaveBeenCalledWith(
        '+91-98765-43210',
        expect.objectContaining({ entityType: 'DOCTOR' }),
      );
    });

    it('should throw on OTP request failure', async () => {
      vi.mocked(UnifiedOtpService.requestOtp).mockResolvedValueOnce({
        success: false,
        message: 'Rate limited',
      });

      await expect(services.doctor.requestOtp('9876543210')).rejects.toThrow('Rate limited');
    });
  });

  describe('verifyOtp', () => {
    it('should verify valid OTP and return doctor', async () => {
      vi.mocked(UnifiedOtpService.verifyOtp).mockResolvedValueOnce({
        success: true,
        user: {
          id: 'doctor-1',
          name: 'Dr. Test',
          role: 'DOCTOR',
          entityType: 'DOCTOR',
          mobile: '9876543210',
          email: 'doctor@test.com',
        },
      });

      const result = await services.doctor.verifyOtp('9876543210', '123456');

      expect(result.user.id).toBe('doctor-1');
      expect(result.user.role).toBe('DOCTOR');
      expect(UnifiedOtpService.verifyOtp).toHaveBeenCalledWith('9876543210', '123456', {
        entityType: 'DOCTOR',
      });
    });

    it('should reject expired OTP', async () => {
      vi.mocked(UnifiedOtpService.verifyOtp).mockResolvedValueOnce({
        success: false,
        message: 'OTP has expired',
      });

      await expect(services.doctor.verifyOtp('9876543210', '123456')).rejects.toThrow(
        'OTP has expired',
      );
    });

    it('should reject invalid OTP code', async () => {
      vi.mocked(UnifiedOtpService.verifyOtp).mockResolvedValueOnce({
        success: false,
        message: 'Invalid OTP',
      });

      await expect(services.doctor.verifyOtp('9876543210', '000000')).rejects.toThrow(
        'Invalid OTP',
      );
    });

    it('should reject when OTP not found', async () => {
      vi.mocked(UnifiedOtpService.verifyOtp).mockResolvedValueOnce({
        success: false,
        message: 'OTP not requested',
      });

      await expect(services.doctor.verifyOtp('9876543210', '123456')).rejects.toThrow(
        'OTP not requested',
      );
    });

    it('should reject suspended accounts', async () => {
      vi.mocked(UnifiedOtpService.verifyOtp).mockResolvedValueOnce({
        success: false,
        message: 'Account is suspended',
      });

      await expect(services.doctor.verifyOtp('9876543210', '123456')).rejects.toThrow(
        'Account is suspended',
      );
    });
  });
});
