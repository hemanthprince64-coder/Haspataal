import { prisma } from '@haspataal/db';
import { logger } from '@haspataal/logger';
import { UserRole } from '@haspataal/types';
import crypto from 'crypto';
import Redis from 'ioredis';
import { Counter } from 'prom-client';

import { SmsFactory } from './otp-dispatcher';

const otpRequestsCounter = new Counter({
  name: 'otp_requests_total',
  help: 'Total number of OTP requests',
  labelNames: ['entity_type', 'status'],
});

const otpVerificationsCounter = new Counter({
  name: 'otp_verifications_total',
  help: 'Total number of OTP verification attempts',
  labelNames: ['entity_type', 'status'],
});

const smsDispatchCounter = new Counter({
  name: 'sms_dispatch_total',
  help: 'Total number of SMS dispatches',
  labelNames: ['provider', 'status'],
});

export type EntityType = 'PATIENT' | 'HOSPITAL' | 'DOCTOR';

export interface OtpContext {
  entityType: EntityType;
  channel?: 'SMS' | 'WHATSAPP' | 'EMAIL';
  recipientName?: string;
}

export interface OtpUserResult {
  id: string;
  name: string;
  role: UserRole;
  entityType: EntityType;
  mobile: string;
  email?: string;
  hospitalId?: string;
}

export interface OtpResult {
  success: boolean;
  message?: string;
  user?: OtpUserResult;
  code?: string;
  expiresAt?: string | Date;
}

const OTP_RATE_LIMIT = 3;
const OTP_RATE_WINDOW_SECONDS = 15 * 60;
const OTP_TTL_SECONDS = 5 * 60;

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keyPrefix: 'haspataal:otp:',
  retryStrategy: (times: number) => Math.min(times * 100, 3000),
});

redisClient.on('error', () => {
  /* ignore connection errors - rate limiting degrades gracefully */
});

function normalizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, '').slice(-10);
}

async function checkRateLimit(key: string): Promise<boolean> {
  try {
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, OTP_RATE_WINDOW_SECONDS);
    }
    return count <= OTP_RATE_LIMIT;
  } catch {
    return true;
  }
}

async function checkCooldown(mobile: string): Promise<boolean> {
  try {
    const key = `cooldown:${mobile}`;
    const set = await redisClient.set(key, '1', 'EX', 60, 'NX');
    return set === 'OK'; // true if we successfully set it, false if it already exists
  } catch {
    return true; // fail open
  }
}

async function getEntityByMobile(mobile: string, entityType: EntityType): Promise<any | null> {
  switch (entityType) {
    case 'PATIENT':
      return prisma.patient.findUnique({ where: { phone: mobile } });
    case 'HOSPITAL': {
      const hospitals = await prisma.$queryRaw<any[]>`
        SELECT * FROM hospitals_master WHERE contact_number = ${mobile} LIMIT 1
      `;
      return hospitals?.[0] || null;
    }
    case 'DOCTOR':
      return prisma.doctorMaster.findUnique({ where: { mobile } });
    default:
      return null;
  }
}

function getAccountStatus(entity: any, entityType: EntityType): string | null {
  switch (entityType) {
    case 'PATIENT':
      return entity?.accountStatus || null;
    case 'HOSPITAL':
      return entity?.account_status || entity?.accountStatus || null;
    case 'DOCTOR':
      return entity?.accountStatus || null;
    default:
      return null;
  }
}

function sanitizeUser(entity: any, entityType: EntityType): OtpUserResult {
  switch (entityType) {
    case 'PATIENT':
      return {
        id: entity.id,
        name: entity.name || 'Patient',
        role: UserRole.PATIENT,
        entityType: 'PATIENT',
        mobile: entity.phone,
        email: entity.email,
      };
    case 'HOSPITAL':
      return {
        id: entity.id,
        name: entity.display_name || entity.legal_name || 'Hospital Admin',
        role: UserRole.HOSPITAL_ADMIN,
        entityType: 'HOSPITAL',
        mobile: entity.contact_number,
        email: entity.email,
        hospitalId: entity.id,
      };
    case 'DOCTOR':
      return {
        id: entity.id,
        name: entity.fullName,
        role: UserRole.DOCTOR,
        entityType: 'DOCTOR',
        mobile: entity.mobile,
        email: entity.email,
      };
    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }
}

export class UnifiedOtpService {
  static async requestOtp(mobile: string, context: OtpContext): Promise<OtpResult> {
    otpRequestsCounter.inc({ entity_type: context.entityType, status: 'attempted' });
    const normalizedMobile = normalizeMobile(mobile);

    const cooldownAllowed = await checkCooldown(normalizedMobile);
    if (!cooldownAllowed) {
      logger.warn(
        { action: 'otp_cooldown_active', mobile: normalizedMobile, entityType: context.entityType },
        'OTP request cooldown active',
      );
      otpRequestsCounter.inc({ entity_type: context.entityType, status: 'cooldown' });
      return { success: false, message: 'Please wait 60 seconds before requesting a new OTP.' };
    }

    const rateLimitKey = `request:${context.entityType}:${normalizedMobile}`;
    const allowed = await checkRateLimit(rateLimitKey);
    if (!allowed) {
      logger.warn(
        { action: 'otp_rate_limited', mobile: normalizedMobile, entityType: context.entityType },
        'OTP request rate limited',
      );
      otpRequestsCounter.inc({ entity_type: context.entityType, status: 'rate_limited' });
      return { success: false, message: 'Too many OTP requests. Please try again later.' };
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

    await prisma.otpCode.upsert({
      where: { phone: normalizedMobile },
      update: { code, expiresAt },
      create: { phone: normalizedMobile, code, expiresAt },
    });

    try {
      const provider = SmsFactory.getProvider();
      await provider.sendOTP(normalizedMobile, code, 'login');
      smsDispatchCounter.inc({ provider: provider.constructor.name, status: 'success' });
    } catch (error: any) {
      logger.error(
        { action: 'otp_dispatch_failed', error: error.message },
        'Failed to dispatch SMS',
      );
      smsDispatchCounter.inc({ provider: 'any', status: 'failure' });
      // We don't fail the request here, but log it. Next time they retry, it might succeed, or they can use dev fallback
    }

    logger.info(
      { action: 'otp_generated', mobile: normalizedMobile, entityType: context.entityType },
      'OTP generated',
    );

    if (process.env.NODE_ENV === 'development') {
      console.log(
        '%c[DEMO OTP]',
        'background: #0f766e; color: black; font-weight: bold; padding: 2px 8px; border-radius: 4px;',
        `Mobile: ${mobile} | Code: ${code} | Entity: ${context.entityType} | Expires: ${expiresAt.toISOString()}`,
      );
    }

    otpRequestsCounter.inc({ entity_type: context.entityType, status: 'success' });
    return { success: true, code, expiresAt };
  }

  static async verifyOtp(mobile: string, otp: string, context: OtpContext): Promise<OtpResult> {
    otpVerificationsCounter.inc({ entity_type: context.entityType, status: 'attempted' });
    const normalizedMobile = normalizeMobile(mobile);

    const otpRecord = await prisma.otpCode.findUnique({ where: { phone: normalizedMobile } });

    if (!otpRecord) {
      otpVerificationsCounter.inc({ entity_type: context.entityType, status: 'not_requested' });
      return {
        success: false,
        message: 'OTP not requested for this number. Please request a new OTP.',
      };
    }
    if (otpRecord.code !== otp) {
      otpVerificationsCounter.inc({ entity_type: context.entityType, status: 'invalid_code' });
      return { success: false, message: 'Invalid OTP. Please try again.' };
    }
    if (new Date() > otpRecord.expiresAt) {
      otpVerificationsCounter.inc({ entity_type: context.entityType, status: 'expired' });
      return { success: false, message: 'OTP has expired. Please request a new OTP.' };
    }

    await prisma.otpCode.delete({ where: { id: otpRecord.id } });

    const entity = await getEntityByMobile(normalizedMobile, context.entityType);
    if (!entity) {
      otpVerificationsCounter.inc({ entity_type: context.entityType, status: 'account_not_found' });
      return { success: false, message: 'Account not found. Please register first.' };
    }

    const accountStatus = getAccountStatus(entity, context.entityType);
    if (
      accountStatus === 'SUSPENDED' ||
      accountStatus === 'suspended' ||
      accountStatus === 'inactive'
    ) {
      logger.warn(
        {
          action: 'otp_suspended_account',
          mobile: normalizedMobile,
          entityType: context.entityType,
        },
        'Suspended account attempted OTP login',
      );
      otpVerificationsCounter.inc({ entity_type: context.entityType, status: 'suspended' });
      return { success: false, message: 'Account is suspended. Please contact support.' };
    }

    logger.info(
      { action: 'otp_verified', mobile: normalizedMobile, entityType: context.entityType },
      'OTP verified successfully',
    );

    otpVerificationsCounter.inc({ entity_type: context.entityType, status: 'success' });

    return {
      success: true,
      user: sanitizeUser(entity, context.entityType),
    };
  }
}
