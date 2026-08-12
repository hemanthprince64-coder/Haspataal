/**
 * OtpService Unit Tests
 *
 * Tests the canonical OtpService (lib/otp/otp.service.ts) which:
 *   - Stores bcrypt hashes, never plaintext OTPs
 *   - Enforces rate limits via Redis
 *   - Scopes OTPs to phone + purpose + tenant
 *   - Uses atomic markVerified to prevent double-consumption
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
    generatePlaintextOtp: vi.fn().mockReturnValue('123456'),
    hashOtp: vi.fn().mockResolvedValue('$2b$hash'),
    verifyOtp: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('../lib/otp/otp.sms', () => ({
  SmsFactory: {
    getProvider: vi.fn().mockReturnValue({ sendOTP: vi.fn().mockResolvedValue(undefined) }),
  },
}));

const PHONE = '+919876543210';
const PURPOSE = OtpPurpose.LOGIN;

const makeActiveOtp = (overrides: Partial<{
  id: string;
  phone: string;
  purpose: OtpPurpose;
  tenantId: string | null;
  otpHash: string;
  expiresAt: Date;
  verified: boolean;
  attemptCount: number;
  createdAt: Date;
  verifiedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
}> = {}) => ({
  id: 'otp-1',
  phone: PHONE,
  purpose: PURPOSE,
  tenantId: null,
  otpHash: '$2b$hash',
  expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  verified: false,
  attemptCount: 0,
  createdAt: new Date(),
  verifiedAt: null,
  ipAddress: null,
  userAgent: null,
  ...overrides,
});

describe('OtpService.sendOtp', () => {
  beforeEach(() => vi.clearAllMocks());

  it('generates, hashes, and stores an OTP — never persists plaintext', async () => {
    const result = await OtpService.sendOtp({ phone: PHONE, purpose: PURPOSE });

    expect(result.success).toBe(true);
    expect(OtpGenerator.hashOtp).toHaveBeenCalledWith('123456');
    // upsert stores the hash, not the plaintext
    const upsertCall = vi.mocked(OtpRepository.upsert).mock.calls[0];
    expect(upsertCall[3]).toBe('$2b$hash'); // arg index 3 is otpHash
    expect(upsertCall[3]).not.toBe('123456'); // plaintext never stored
  });

  it('enforces resend cooldown', async () => {
    vi.mocked(OtpRedis.isResendInCooldown).mockResolvedValueOnce(true);
    const result = await OtpService.sendOtp({ phone: PHONE, purpose: PURPOSE });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/60 seconds/i);
  });

  it('enforces IP rate limit', async () => {
    vi.mocked(OtpRedis.checkIpRateLimit).mockResolvedValueOnce(false);
    const result = await OtpService.sendOtp({ phone: PHONE, purpose: PURPOSE, ipAddress: '1.2.3.4' });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/IP/i);
  });

  it('enforces phone rate limit', async () => {
    vi.mocked(OtpRedis.checkPhoneRateLimit).mockResolvedValueOnce(false);
    const result = await OtpService.sendOtp({ phone: PHONE, purpose: PURPOSE });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/phone number/i);
  });

  it('rejects when account is locked', async () => {
    vi.mocked(OtpRedis.isLocked).mockResolvedValueOnce(true);
    const result = await OtpService.sendOtp({ phone: PHONE, purpose: PURPOSE });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/locked/i);
  });
});

describe('OtpService.verifyOtp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(OtpRepository.findActive).mockResolvedValue(makeActiveOtp());
    vi.mocked(OtpGenerator.verifyOtp).mockResolvedValue(true);
    vi.mocked(OtpRepository.markVerified).mockResolvedValue(true);
  });

  it('verifies a valid OTP successfully', async () => {
    const result = await OtpService.verifyOtp({ phone: PHONE, otp: '123456', purpose: PURPOSE });
    expect(result.success).toBe(true);
    expect(OtpRepository.markVerified).toHaveBeenCalledWith('otp-1');
  });

  it('rejects expired OTP without touching markVerified', async () => {
    vi.mocked(OtpRepository.findActive).mockResolvedValue(
      makeActiveOtp({ expiresAt: new Date(Date.now() - 1000) }),
    );
    const result = await OtpService.verifyOtp({ phone: PHONE, otp: '123456', purpose: PURPOSE });
    expect(result.success).toBe(false);
    expect(OtpRepository.markVerified).not.toHaveBeenCalled();
  });

  it('rejects wrong OTP and increments attempts', async () => {
    vi.mocked(OtpGenerator.verifyOtp).mockResolvedValueOnce(false);
    const result = await OtpService.verifyOtp({ phone: PHONE, otp: '000000', purpose: PURPOSE });
    expect(result.success).toBe(false);
    expect(OtpRepository.incrementAttempts).toHaveBeenCalled();
  });

  it('rejects already-verified OTP (checked by verified flag)', async () => {
    vi.mocked(OtpRepository.findActive).mockResolvedValue(makeActiveOtp({ verified: true }));
    const result = await OtpService.verifyOtp({ phone: PHONE, otp: '123456', purpose: PURPOSE });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/already been verified/i);
  });

  it('rejects concurrent consumption (markVerified returns false)', async () => {
    vi.mocked(OtpRepository.markVerified).mockResolvedValueOnce(false);
    const result = await OtpService.verifyOtp({ phone: PHONE, otp: '123456', purpose: PURPOSE });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/already been verified/i);
  });

  it('rejects when no active OTP found', async () => {
    vi.mocked(OtpRepository.findActive).mockResolvedValue(null);
    const result = await OtpService.verifyOtp({ phone: PHONE, otp: '123456', purpose: PURPOSE });
    expect(result.success).toBe(false);
  });

  it('locks account after maximum failed attempts', async () => {
    vi.mocked(OtpGenerator.verifyOtp).mockResolvedValue(false);
    vi.mocked(OtpRepository.findActive).mockResolvedValue(makeActiveOtp({ attemptCount: 4 }));
    await OtpService.verifyOtp({ phone: PHONE, otp: '000000', purpose: PURPOSE });
    expect(OtpRedis.lockAccount).toHaveBeenCalledWith(PHONE);
  });

  it('rejects locked account without hitting the DB', async () => {
    vi.mocked(OtpRedis.isLocked).mockResolvedValue(true);
    await OtpService.verifyOtp({ phone: PHONE, otp: '123456', purpose: PURPOSE });
    expect(OtpRepository.findActive).not.toHaveBeenCalled();
  });
});
