import { Redis } from 'ioredis';

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;
if (redis)
  redis.on('error', () => {
    /* ignore build-time connection errors */
  });

export class RedisRateLimiter {
  static async checkLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
    if (!redis) return true;

    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, windowSec);
    return current <= limit;
  }
}
