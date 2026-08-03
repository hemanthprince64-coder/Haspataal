import { logger } from '@haspataal/logger';
import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: (times: number) => Math.min(times * 100, 3000),
});

redisClient.on('error', (err) => {
  logger.error({ err }, 'Redis connection error in OtpRedis service');
});

// Keys Structure
// otp:resend:+91xxxxxxxxxx
// otp:attempts:+91xxxxxxxxxx
// otp:lock:+91xxxxxxxxxx
// otp:rate:ip:192.168.0.1
// otp:rate:tenant:tenant_id

export class OtpRedis {
  // Helper to gracefully fallback if Redis is down (especially in dev)
  private static async safeRedisCall<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await operation();
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        logger.warn({ err: err.message }, 'Redis unavailable, bypassing OTP rate limit');
        return fallback;
      }
      throw err;
    }
  }

  // 1. IP Rate Limiting: 20 requests per minute
  static async checkIpRateLimit(ip: string): Promise<boolean> {
    return this.safeRedisCall(async () => {
      const key = `otp:rate:ip:${ip}`;
      const count = await redisClient.incr(key);
      if (count === 1) await redisClient.expire(key, 60);
      return count <= 20;
    }, true);
  }

  // 2. Phone Rate Limiting: 3 OTPs per 15 minutes
  static async checkPhoneRateLimit(phone: string): Promise<boolean> {
    return this.safeRedisCall(async () => {
      const key = `otp:attempts:${phone}`;
      const count = await redisClient.incr(key);
      if (count === 1) await redisClient.expire(key, 15 * 60);
      return count <= 3;
    }, true);
  }

  // 3. Tenant Rate Limiting: 500 OTPs per 15 minutes
  static async checkTenantRateLimit(tenantId: string): Promise<boolean> {
    return this.safeRedisCall(async () => {
      const key = `otp:rate:tenant:${tenantId}`;
      const count = await redisClient.incr(key);
      if (count === 1) await redisClient.expire(key, 15 * 60);
      return count <= 500;
    }, true);
  }

  // 4. Resend Cooldown: 60 seconds
  static async setResendCooldown(phone: string): Promise<void> {
    return this.safeRedisCall(async () => {
      const key = `otp:resend:${phone}`;
      await redisClient.set(key, '1', 'EX', 60);
    }, undefined);
  }

  static async isResendInCooldown(phone: string): Promise<boolean> {
    return this.safeRedisCall(async () => {
      const key = `otp:resend:${phone}`;
      const exists = await redisClient.exists(key);
      return exists === 1;
    }, false);
  }

  // 5. Account Lockout: 5 failed attempts locks for 5 minutes
  static async isLocked(phone: string): Promise<boolean> {
    return this.safeRedisCall(async () => {
      const key = `otp:lock:${phone}`;
      const exists = await redisClient.exists(key);
      return exists === 1;
    }, false);
  }

  static async lockAccount(phone: string): Promise<void> {
    return this.safeRedisCall(async () => {
      const key = `otp:lock:${phone}`;
      await redisClient.set(key, '1', 'EX', 5 * 60);
    }, undefined);
  }

  // Clear all limits on success
  static async clearLocksAndAttempts(phone: string): Promise<void> {
    return this.safeRedisCall(async () => {
      await redisClient.del(`otp:lock:${phone}`);
      await redisClient.del(`otp:attempts:${phone}`);
      await redisClient.del(`otp:resend:${phone}`);
    }, undefined);
  }
}
