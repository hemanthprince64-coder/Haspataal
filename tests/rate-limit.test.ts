import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimiter, withRateLimit } from '../lib/rate-limit';
import * as headersModule from 'next/headers';

// Mock ioredis
vi.mock('ioredis', () => {
  return {
    default: class RedisMock {
      defineCommand = vi.fn();
      slidingWindowRateLimit = vi.fn();
    }
  };
});

// Mock next/headers
vi.mock('next/headers', () => {
  return {
    headers: vi.fn(),
  };
});

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sliding window check', () => {
    it('should allow request when within limit', async () => {
      // Mock the Lua script response: [1 (allowed), 5 (count)]
      const mockRedisCheck = vi.spyOn(rateLimiter['redis'] as any, 'slidingWindowRateLimit')
        .mockResolvedValueOnce([1, 5]);

      const result = await rateLimiter.check('test-key', 10, 1000);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5); // 10 - 5 = 5 remaining
      expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
      expect(mockRedisCheck).toHaveBeenCalledWith('test-key', 10, 1000, expect.any(Number));
    });

    it('should deny request when limit exceeded', async () => {
      // Mock the Lua script response: [0 (denied), 10 (count)]
      const mockRedisCheck = vi.spyOn(rateLimiter['redis'] as any, 'slidingWindowRateLimit')
        .mockResolvedValueOnce([0, 10]);

      const result = await rateLimiter.check('test-key', 10, 1000);
      
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('withRateLimit HOC', () => {
    it('should extract IP from headers and block on limit exceeded', async () => {
      // Mock headers
      (headersModule.headers as any).mockResolvedValue(
        new Map([['x-forwarded-for', '192.168.1.1']]) as any
      );

      // Mock rate limiter to deny
      vi.spyOn(rateLimiter, 'check').mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetAt: new Date(Date.now() + 60000), // Reset in 60s
      });

      const mockAction = vi.fn().mockResolvedValue({ success: true });
      const wrappedAction = withRateLimit(mockAction, {
        actionName: 'testAction',
        limit: 5,
        windowMs: 60000,
      });

      const result = await wrappedAction();

      expect(result.error).toBe('TOO_MANY_REQUESTS');
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(mockAction).not.toHaveBeenCalled();
      expect(rateLimiter.check).toHaveBeenCalledWith('rl:testAction:192.168.1.1', 5, 60000);
    });

    it('should allow execution if rate limit is not exceeded', async () => {
      (headersModule.headers as any).mockResolvedValue(
        new Map([['x-forwarded-for', '10.0.0.1']]) as any
      );

      vi.spyOn(rateLimiter, 'check').mockResolvedValueOnce({
        allowed: true,
        remaining: 4,
        resetAt: new Date(),
      });

      const mockAction = vi.fn().mockResolvedValue({ success: true, message: 'Done' });
      const wrappedAction = withRateLimit(mockAction, {
        actionName: 'testAction',
        limit: 5,
        windowMs: 60000,
      });

      const result = await wrappedAction('arg1', 'arg2');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Done');
      expect(mockAction).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });
});
