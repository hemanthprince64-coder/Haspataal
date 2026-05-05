import Redis from 'ioredis';
import { headers } from 'next/headers';
import redisClient from './redis';

/**
 * Core rate limiter using Redis INCR + EXPIRE pattern (Fixed Window).
 *
 * @param key The unique identifier for the rate limit (e.g., rl:action:127.0.0.1)
 * @param limit Max allowed requests within the window
 * @param windowSeconds Window duration in seconds
 */
export async function rateLimiter(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  if (!redisClient) {
    // Fail-open: If Redis is unavailable, allow the request
    return { allowed: true, remaining: limit };
  }

  try {
    const count = await redisClient.incr(key);

    // Set expiry only on the first increment
    if (count === 1) {
      await redisClient.expire(key, windowSeconds);
    }

    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);

    return { allowed, remaining };
  } catch (error) {
    console.error('[RATE-LIMIT] Redis error:', error);
    return { allowed: true, remaining: limit };
  }
}

/**
 * Reusable wrapper for Next.js Server Actions to enforce rate limits.
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  action: T,
  options: {
    actionName: string;
    limit: number;
    windowSeconds: number;
  },
): T {
  return (async (...args: any[]) => {
    // 1. Get Client IP (Next.js 14+ pattern)
    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    const realIp = headerList.get('x-real-ip');

    // Use the first IP in forwarded-for or fallback to real-ip / localhost
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    const key = `rl:${options.actionName}:${ip}`;

    // 2. Check Rate Limit
    const { allowed, remaining } = await rateLimiter(key, options.limit, options.windowSeconds);

    if (!allowed) {
      // 3. Get remaining TTL for retry-after calculation
      let retryAfter = options.windowSeconds;
      try {
        const ttl = await redisClient?.ttl(key);
        if (ttl && ttl > 0) retryAfter = ttl;
      } catch (e) {
        // Fallback to full window if TTL fetch fails
      }

      // 4. Return typed error for client-side handling
      return {
        error: 'RATE_LIMITED',
        message: `Too many attempts. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      };
    }

    // 5. Execute original action
    return await action(...args);
  }) as unknown as T;
}
