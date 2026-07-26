import { prisma } from '@haspataal/db';
import { logger } from '@haspataal/logger';
import { UserRole } from '@haspataal/types';
import crypto from 'crypto';
import Redis from 'ioredis';

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
    const normalizedMobile = normalizeMobile(mobile);

    const rateLimitKey = `request:${context.entityType}:${normalizedMobile}`;
    const allowed = await checkRateLimit(rateLimitKey);
    if (!allowed) {
      logger.warn(
        { action: 'otp_rate_limited', mobile: normalizedMobile, entityType: context.entityType },
        'OTP request rate limited',
      );
      return { success: false, message: 'Too many OTP requests. Please try again later.' };
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

    await prisma.otpCode.upsert({
      where: { phone: normalizedMobile },
      update: { code, expiresAt },
      create: { phone: normalizedMobile, code, expiresAt },
    });

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

    return { success: true, code, expiresAt };
  }

  static async verifyOtp(mobile: string, otp: string, context: OtpContext): Promise<OtpResult> {
    const normalizedMobile = normalizeMobile(mobile);

    const otpRecord = await prisma.otpCode.findUnique({ where: { phone: normalizedMobile } });

    if (!otpRecord) {
      return {
        success: false,
        message: 'OTP not requested for this number. Please request a new OTP.',
      };
    }
    if (otpRecord.code !== otp) {
      return { success: false, message: 'Invalid OTP. Please try again.' };
    }
    if (new Date() > otpRecord.expiresAt) {
      return { success: false, message: 'OTP has expired. Please request a new OTP.' };
    }

    await prisma.otpCode.delete({ where: { id: otpRecord.id } });

    const entity = await getEntityByMobile(normalizedMobile, context.entityType);
    if (!entity) {
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
      return { success: false, message: 'Account is suspended. Please contact support.' };
    }

    logger.info(
      { action: 'otp_verified', mobile: normalizedMobile, entityType: context.entityType },
      'OTP verified successfully',
    );

    return {
      success: true,
      user: sanitizeUser(entity, context.entityType),
    };
  }
}
