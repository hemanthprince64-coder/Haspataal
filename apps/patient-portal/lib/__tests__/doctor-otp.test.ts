import { OtpService, OtpPurpose } from '@haspataal/auth';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { services } from '../services';

vi.mock('@haspataal/auth', () => ({
  OtpService: {
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
  },
  OtpPurpose: {
    HOSPITAL_LOGIN: 'HOSPITAL_LOGIN',
  },
}));

describe('Doctor OTP Service (Unified)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requestOtp', () => {
    it('should request OTP for valid mobile', async () => {
      vi.mocked(OtpService.sendOtp).mockResolvedValueOnce({
        success: true,
        code: '123456',
        expiresAt: new Date(),
      });

      const result = await services.doctor.requestOtp('9876543210');

      expect(result).toBe(true);
      expect(OtpService.sendOtp).toHaveBeenCalledWith(
        { phone: '9876543210', purpose: 'HOSPITAL_LOGIN' }
      );
    });

    it('should normalize mobile number', async () => {
      vi.mocked(OtpService.sendOtp).mockResolvedValueOnce({
        success: true,
        code: '123456',
        expiresAt: new Date(),
      });

      await services.doctor.requestOtp('+91-98765-43210');

      expect(OtpService.sendOtp).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '+91-98765-43210', purpose: 'HOSPITAL_LOGIN' })
      );
    });

    it('should throw on OTP request failure', async () => {
      vi.mocked(OtpService.sendOtp).mockResolvedValueOnce({
        success: false,
        message: 'Rate limited',
      });

      await expect(services.doctor.requestOtp('9876543210')).rejects.toThrow('Rate limited');
    });
  });

  describe('verifyOtp', () => {
    it('should verify valid OTP and return doctor', async () => {
      vi.mocked(OtpService.verifyOtp).mockResolvedValueOnce({
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
      expect(OtpService.verifyOtp).toHaveBeenCalledWith(
        { phone: '9876543210', otp: '123456', purpose: 'HOSPITAL_LOGIN' }
      );
    });

    it('should reject expired OTP', async () => {
      vi.mocked(OtpService.verifyOtp).mockResolvedValueOnce({
        success: false,
        message: 'OTP has expired',
      });

      await expect(services.doctor.verifyOtp('9876543210', '123456')).rejects.toThrow(
        'OTP has expired',
      );
    });

    it('should reject invalid OTP code', async () => {
      vi.mocked(OtpService.verifyOtp).mockResolvedValueOnce({
        success: false,
        message: 'Invalid OTP',
      });

      await expect(services.doctor.verifyOtp('9876543210', '000000')).rejects.toThrow(
        'Invalid OTP',
      );
    });

    it('should reject when OTP not found', async () => {
      vi.mocked(OtpService.verifyOtp).mockResolvedValueOnce({
        success: false,
        message: 'OTP not requested',
      });

      await expect(services.doctor.verifyOtp('9876543210', '123456')).rejects.toThrow(
        'OTP not requested',
      );
    });

    it('should reject suspended accounts', async () => {
      vi.mocked(OtpService.verifyOtp).mockResolvedValueOnce({
        success: false,
        message: 'Account is suspended',
      });

      await expect(services.doctor.verifyOtp('9876543210', '123456')).rejects.toThrow(
        'Account is suspended',
      );
    });
  });
});
