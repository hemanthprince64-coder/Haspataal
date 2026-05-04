import Redis from 'ioredis';
import { headers } from 'next/headers';

// Create a global Redis instance or use an existing one
// Assuming you have a standard Redis connection string in process.env.REDIS_URL
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Lua script for atomic sliding window rate limit
const SLIDING_WINDOW_SCRIPT = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])

  -- Remove tokens older than the current window
  redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

  -- Count remaining tokens in the window
  local count = redis.call('ZCARD', key)
  local allowed = count < limit

  if allowed then
    -- Add the new request token
    redis.call('ZADD', key, now, now)
    -- Extend expiry of the key
    redis.call('PEXPIRE', key, window)
    count = count + 1
  end

  return { allowed and 1 or 0, count }
`;

export class RateLimiter {
  private redis: Redis;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
    // Define the custom command so ioredis knows about it
    this.redis.defineCommand('slidingWindowRateLimit', {
      numberOfKeys: 1,
      lua: SLIDING_WINDOW_SCRIPT,
    });
  }

  /**
   * Check rate limit using sliding window
   * @param key The unique key for the rate limit (e.g. rl:registerHospital:192.168.1.1)
   * @param limit Max number of requests allowed in the window
   * @param windowMs The time window in milliseconds
   * @returns { allowed: boolean, remaining: number, resetAt: Date }
   */
  async check(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const now = Date.now();
    
    // @ts-ignore - custom command created via defineCommand
    const result = await this.redis.slidingWindowRateLimit(key, limit, windowMs, now);
    
    const allowed = result[0] === 1;
    const count = result[1];
    const remaining = Math.max(0, limit - count);
    
    // The reset time is technically rolling, but we return the max window as the safe retry point
    const resetAt = new Date(now + windowMs);

    return { allowed, remaining, resetAt };
  }
}

export const rateLimiter = new RateLimiter(redisClient);

type RateLimitOptions = {
  actionName: string;
  limit: number;
  windowMs: number;
};

/**
 * Higher-order function to wrap Server Actions with rate limiting.
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  action: T,
  options: RateLimitOptions
): T {
  return (async (...args: Parameters<T>) => {
    // Get IP address from headers
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    
    let ip = '127.0.0.1';
    if (forwardedFor) {
      ip = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      ip = realIp;
    }

    const key = `rl:${options.actionName}:${ip}`;
    
    const { allowed, resetAt } = await rateLimiter.check(key, options.limit, options.windowMs);

    if (!allowed) {
      const retryAfter = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
      return {
        error: "TOO_MANY_REQUESTS",
        message: "Too many requests. Please try again later.",
        retryAfter,
      };
    }

    // Call the original action
    return await action(...args);
  }) as unknown as T;
}
