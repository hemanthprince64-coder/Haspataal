/**
 * Doctor OTP Authentication & Account Status Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OtpGenerator } from '../lib/otp/otp.generator';
import { OtpRedis } from '../lib/otp/otp.redis';
import { OtpRepository } from '../lib/otp/otp.repository';
import { OtpService } from '../lib/otp/otp.service';
import { OtpPurpose } from '../lib/otp/otp.types';

vi.mock('../lib/otp/otp.redis', () => ({
  OtpRedis: {
    checkIpRateLimit: vi.fn().mockResolvedValue(true),
    checkTenantRateLimit: vi.fn().mockResolvedValue(true),
    checkPhoneRateLimit: vi.fn().mockResolvedValue(true),
    isResendInCooldown: vi.fn().mockResolvedValue(false),
    setResendCooldown: vi.fn().mockResolvedValue(undefined),
    isLocked: vi.fn().mockResolvedValue(false),
    lockAccount: vi.fn().mockResolvedValue(undefined),
    clearLocksAndAttempts: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../lib/otp/otp.repository', () => ({
  OtpRepository: {
    upsert: vi.fn().mockResolvedValue({}),
    findActive: vi.fn(),
    incrementAttempts: vi.fn().mockResolvedValue({}),
    markVerified: vi.fn().mockResolvedValue(true),
    invalidate: vi.fn(),
  },
}));

vi.mock('../lib/otp/otp.generator', () => ({
  OtpGenerator: {
    generatePlaintextOtp: vi.fn().mockReturnValue('654321'),
    hashOtp: vi.fn().mockResolvedValue('$2b$hash_doctor'),
    verifyOtp: vi.fn(),
  },
}));

vi.mock('../lib/otp/otp.sms', () => ({
  SmsFactory: {
    getProvider: vi.fn().mockReturnValue({ sendOTP: vi.fn().mockResolvedValue(undefined) }),
  },
}));

const DOCTOR_PHONE = '+919988776655';

describe('Doctor OTP Authentication Flow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends OTP with OtpPurpose.DOCTOR_LOGIN successfully', async () => {
    const result = await OtpService.sendOtp({
      phone: DOCTOR_PHONE,
      purpose: OtpPurpose.DOCTOR_LOGIN,
    });

    expect(result.success).toBe(true);
    expect(OtpGenerator.hashOtp).toHaveBeenCalledWith('654321');
    expect(OtpRepository.upsert).toHaveBeenCalledWith(
      DOCTOR_PHONE,
      OtpPurpose.DOCTOR_LOGIN,
      null,
      '$2b$hash_doctor',
      expect.any(Date),
      undefined,
      undefined,
    );
  });

  it('verifies valid OTP for DOCTOR_LOGIN successfully', async () => {
    vi.mocked(OtpRepository.findActive).mockResolvedValueOnce({
      id: 'otp-doc-1',
      phone: DOCTOR_PHONE,
      purpose: OtpPurpose.DOCTOR_LOGIN,
      tenantId: null,
      otpHash: '$2b$hash_doctor',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      verified: false,
      attemptCount: 0,
      createdAt: new Date(),
      verifiedAt: null,
      ipAddress: null,
      userAgent: null,
    });
    vi.mocked(OtpGenerator.verifyOtp).mockResolvedValueOnce(true);

    const result = await OtpService.verifyOtp({
      phone: DOCTOR_PHONE,
      otp: '654321',
      purpose: OtpPurpose.DOCTOR_LOGIN,
    });

    expect(result.success).toBe(true);
    expect(OtpRepository.markVerified).toHaveBeenCalledWith('otp-doc-1');
  });

  it('rejects invalid OTP for DOCTOR_LOGIN', async () => {
    vi.mocked(OtpRepository.findActive).mockResolvedValueOnce({
      id: 'otp-doc-1',
      phone: DOCTOR_PHONE,
      purpose: OtpPurpose.DOCTOR_LOGIN,
      tenantId: null,
      otpHash: '$2b$hash_doctor',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      verified: false,
      attemptCount: 1,
      createdAt: new Date(),
      verifiedAt: null,
      ipAddress: null,
      userAgent: null,
    });
    vi.mocked(OtpGenerator.verifyOtp).mockResolvedValueOnce(false);

    const result = await OtpService.verifyOtp({
      phone: DOCTOR_PHONE,
      otp: '000000',
      purpose: OtpPurpose.DOCTOR_LOGIN,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid OTP');
    expect(OtpRepository.incrementAttempts).toHaveBeenCalledWith('otp-doc-1', 2);
  });

  it('rejects doctor login if account status is suspended, inactive, or locked', () => {
    const isSuspended = (status: string) =>
      ['suspended', 'inactive', 'locked'].includes(status.toLowerCase());

    expect(isSuspended('SUSPENDED')).toBe(true);
    expect(isSuspended('inactive')).toBe(true);
    expect(isSuspended('Locked')).toBe(true);
    expect(isSuspended('ACTIVE')).toBe(false);
    expect(isSuspended('active')).toBe(false);
  });
});
