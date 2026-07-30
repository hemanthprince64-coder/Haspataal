import { logger } from '@haspataal/logger';

import { OtpGenerator } from './otp.generator';
import { OtpRedis } from './otp.redis';
import { OtpRepository } from './otp.repository';
import { SmsFactory } from './otp.sms';
import { SendOtpRequest, VerifyOtpRequest, OtpResult } from './otp.types';

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;

type OtpAuditEvent =
  | 'OTP_SENT'
  | 'OTP_RESENT'
  | 'OTP_VERIFIED'
  | 'OTP_FAILED'
  | 'OTP_LOCKED'
  | 'OTP_EXPIRED';

function auditLog(
  event: OtpAuditEvent,
  phone: string,
  purpose: string,
  tenantId: string | null,
  extra: any = {},
) {
  // Mask phone for audit logs (e.g. +91******1234)
  const maskedPhone = phone.length > 4 ? phone.slice(0, 3) + '******' + phone.slice(-4) : '***';
  logger.info(
    {
      audit: true,
      event,
      phone: maskedPhone,
      purpose,
      tenantId,
      timestamp: new Date().toISOString(),
      ...extra,
    },
    `OTP Audit: ${event}`,
  );
}

export class OtpService {
  /**
   * Generates a new OTP, hashes it, and stores it in the database.
   * This invalidates any existing OTP for the same tenant/phone/purpose.
   */
  static async sendOtp(request: SendOtpRequest): Promise<OtpResult> {
    const { phone, purpose, tenantId, ipAddress, userAgent } = request;

    // Redis: IP Rate Limiting
    if (ipAddress && !(await OtpRedis.checkIpRateLimit(ipAddress))) {
      return { success: false, message: 'Too many requests from this IP. Try again later.' };
    }

    // Redis: Tenant Rate Limiting
    if (tenantId && !(await OtpRedis.checkTenantRateLimit(tenantId))) {
      return { success: false, message: 'High volume of requests. Try again later.' };
    }

    // Redis: Phone Rate Limiting
    if (!(await OtpRedis.checkPhoneRateLimit(phone))) {
      return { success: false, message: 'Too many OTP requests for this phone number.' };
    }

    // Redis: Resend Cooldown
    if (await OtpRedis.isResendInCooldown(phone)) {
      return { success: false, message: 'Please wait 60 seconds before requesting a new OTP.' };
    }

    // Redis: Account Lockout check
    if (await OtpRedis.isLocked(phone)) {
      return {
        success: false,
        message: 'Account is temporarily locked due to too many failed attempts.',
      };
    }

    // 1. Generate Plaintext OTP
    const code = OtpGenerator.generatePlaintextOtp();

    // 2. Hash OTP via bcrypt
    const hash = await OtpGenerator.hashOtp(code);

    // 3. Invalidate previous OTP & Insert new one using Upsert
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    await OtpRepository.upsert(
      phone,
      purpose,
      tenantId ?? null,
      hash,
      expiresAt,
      ipAddress,
      userAgent,
    );

    // 4. Trigger SMS Provider & Set Cooldown
    await OtpRedis.setResendCooldown(phone);
    const smsProvider = SmsFactory.getProvider();
    await smsProvider.sendOTP(phone, code, purpose);

    auditLog('OTP_SENT', phone, purpose, tenantId ?? null, { ipAddress, userAgent });

    if (process.env.NODE_ENV !== 'production') {
      return { success: true, code, expiresAt };
    }

    return { success: true, expiresAt };
  }

  /**
   * Verifies an incoming OTP against the active database record.
   * Enforces expiry and attempt limits.
   */
  static async verifyOtp(request: VerifyOtpRequest): Promise<OtpResult> {
    const { phone, purpose, tenantId, otp } = request;

    if (await OtpRedis.isLocked(phone)) {
      return { success: false, message: 'Account is temporarily locked. Try again later.' };
    }

    // 1. Fetch active OTP
    const activeOtp = await OtpRepository.findActive(phone, purpose, tenantId ?? null);

    if (!activeOtp) {
      return { success: false, message: 'No active OTP found. Please request a new one.' };
    }

    if (activeOtp.verified) {
      return { success: false, message: 'This OTP has already been verified.' };
    }

    // 2. Check Expiry
    if (new Date() > activeOtp.expiresAt) {
      auditLog('OTP_EXPIRED', phone, purpose, tenantId ?? null);
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    // 3. Check Attempts
    if (activeOtp.attemptCount >= MAX_ATTEMPTS) {
      await OtpRedis.lockAccount(phone);
      auditLog('OTP_LOCKED', phone, purpose, tenantId ?? null, {
        reason: 'Max attempts exceeded prior to check',
      });
      return {
        success: false,
        message: 'Maximum verification attempts exceeded. Account locked for 5 minutes.',
      };
    }

    // 4. Compare Hash
    const isMatch = await OtpGenerator.verifyOtp(otp, activeOtp.otpHash);

    if (!isMatch) {
      const newAttempts = activeOtp.attemptCount + 1;
      await OtpRepository.incrementAttempts(activeOtp.id, newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        await OtpRedis.lockAccount(phone);
        auditLog('OTP_LOCKED', phone, purpose, tenantId ?? null, {
          reason: 'Max attempts reached',
        });
      }

      auditLog('OTP_FAILED', phone, purpose, tenantId ?? null, { attemptCount: newAttempts });
      return { success: false, message: 'Invalid OTP. Please try again.' };
    }

    // 5. Success Flow: Mark verified
    await OtpRepository.markVerified(activeOtp.id);

    // Clear Redis attempts / locks
    await OtpRedis.clearLocksAndAttempts(phone);

    auditLog('OTP_VERIFIED', phone, purpose, tenantId ?? null);

    return { success: true };
  }
}
