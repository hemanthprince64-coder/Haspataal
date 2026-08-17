import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
}

export class RateLimiter {
  private redis: Redis;
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions = {}) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
    this.redis.on('error', () => {
      /* ignore build-time connection errors */
    });
    this.options = {
      windowMs: 60000,
      maxRequests: 60,
      keyPrefix: 'rl',
      ...options,
    };
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const key = this.getKey(req);
      const now = Date.now();
      const window = Math.floor(now / this.options.windowMs!);
      const redisKey = `${this.options.keyPrefix}:${key}:${window}`;

      try {
        const current = await this.redis.incr(redisKey);
        if (current === 1) {
          await this.redis.expire(redisKey, (this.options.windowMs! / 1000) * 2);
        }

        const remaining = Math.max(0, this.options.maxRequests! - current);
        res.setHeader('X-RateLimit-Limit', String(this.options.maxRequests));
        res.setHeader('X-RateLimit-Remaining', String(remaining));
        res.setHeader('X-RateLimit-Reset', String(window + 1));

        if (current > this.options.maxRequests!) {
          return res.status(429).json({
            success: false,
            error: 'Too Many Requests',
            retryAfter: Math.ceil(
              (this.options.windowMs! * 2 - (now % this.options.windowMs!)) / 1000,
            ),
          });
        }

        next();
      } catch {
        next();
      }
    };
  }

  private getKey(req: Request): string {
    return `${req.ip}:${req.method}:${req.path}`;
  }

  async close() {
    await this.redis.quit();
  }
}

// Rate limiters for different endpoints
export const defaultRateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 100,
});

export const authRateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 5,
});

export const otpRateLimiter = new RateLimiter({
  windowMs: 300000,
  maxRequests: 3,
});

export function withRateLimit(options: RateLimitOptions) {
  const limiter = new RateLimiter(options);
  return limiter.middleware();
}
