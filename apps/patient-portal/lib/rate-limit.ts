/* eslint-disable */
import { headers } from 'next/headers';

import redisClient from './redis';

const fallbackHits = new Map<string, { count: number; resetAt: number }>();

function checkFallbackLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;
  const current = fallbackHits.get(key);
  const fallbackLimit = Math.max(1, Math.floor(limit / 2));

  if (!current || current.resetAt <= now) {
    fallbackHits.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: fallbackLimit - 1 };
  }

  current.count += 1;
  const allowed = current.count <= fallbackLimit;
  return { allowed, remaining: Math.max(0, fallbackLimit - current.count) };
}

function extractRateLimitIp(headerList: Pick<Headers, 'get'>): string {
  const trustedProxy = process.env.TRUSTED_PROXY === 'true';
  if (!trustedProxy) return '127.0.0.1';

  const forwardedFor = headerList.get('x-forwarded-for');
  const realIp = headerList.get('x-real-ip');
  return forwardedFor?.split(',')[0]?.trim() || realIp || '127.0.0.1';
}
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
  const client = redisClient;
  if (!client) {
    return checkFallbackLimit(key, limit, windowSeconds);
  }

  try {
    const count = await client.incr(key);

    // Set expiry only on the first increment
    if (count === 1) {
      await client.expire(key, windowSeconds);
    }

    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);

    return { allowed, remaining };
  } catch {
    // Redis unavailable (already announced once by lib/redis.ts on first error).
    // Silently fall back to in-memory limiter for this request and all future ones in this process.
    return checkFallbackLimit(key, limit, windowSeconds);
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
    const ip = extractRateLimitIp(headerList);

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
