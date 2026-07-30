import { prisma } from '@haspataal/db';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { OtpRedis } from '../otp.redis';
import { OtpService } from '../otp.service';
import { OtpPurpose } from '../otp.types';

vi.mock('../otp.redis', () => ({
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

describe('OTP Platform Service Integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Clean DB before each test
    await prisma.otpCode.deleteMany();
  });

  it('should successfully send an OTP', async () => {
    const result = await OtpService.sendOtp({
      phone: '+919999999999',
      purpose: OtpPurpose.LOGIN,
      tenantId: 'tenant-123',
    });

    expect(result.success).toBe(true);
    expect(result.expiresAt).toBeDefined();

    // Verify DB insertion
    const dbRecord = await prisma.otpCode.findFirst({
      where: { phone: '+919999999999', purpose: OtpPurpose.LOGIN, tenantId: 'tenant-123' },
    });
    expect(dbRecord).toBeDefined();
    expect(dbRecord?.verified).toBe(false);
  });

  it('should enforce resend cooldown', async () => {
    vi.mocked(OtpRedis.isResendInCooldown).mockResolvedValueOnce(true);

    const result = await OtpService.sendOtp({
      phone: '+919999999999',
      purpose: OtpPurpose.LOGIN,
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/60 seconds/);
  });

  it('should lock account after 5 failed verification attempts', async () => {
    // 1. Send OTP
    const sendResult = await OtpService.sendOtp({
      phone: '+918888888888',
      purpose: OtpPurpose.LOGIN,
    });

    // In dev, the code is returned
    const code = sendResult.code || '000000';
    const wrongCode = code === '123456' ? '654321' : '123456';

    // 2. Fail 5 times
    for (let i = 0; i < 5; i++) {
      const verifyResult = await OtpService.verifyOtp({
        phone: '+918888888888',
        otp: wrongCode,
        purpose: OtpPurpose.LOGIN,
      });
      expect(verifyResult.success).toBe(false);
    }

    // The lock function should have been called
    expect(OtpRedis.lockAccount).toHaveBeenCalledWith('+918888888888');
  });

  it('should enforce multi-tenant isolation', async () => {
    // Send for Hospital A
    await OtpService.sendOtp({
      phone: '+917777777777',
      purpose: OtpPurpose.LOGIN,
      tenantId: 'hospital-A',
    });

    // Send for Hospital B (same phone)
    await OtpService.sendOtp({
      phone: '+917777777777',
      purpose: OtpPurpose.LOGIN,
      tenantId: 'hospital-B',
    });

    // Verify both exist in DB
    const count = await prisma.otpCode.count({
      where: { phone: '+917777777777' },
    });

    expect(count).toBe(2);
  });
});
