import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimiter, withRateLimit } from '../lib/rate-limit';
import * as headersModule from 'next/headers';

const mockRedis = vi.hoisted(() => ({
  incr: vi.fn(),
  expire: vi.fn(),
  ttl: vi.fn(),
}));

vi.mock('../lib/redis', () => ({
  default: mockRedis,
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.TRUSTED_PROXY;
  });

  describe('fixed window check', () => {
    it('allows requests within the limit', async () => {
      mockRedis.incr.mockResolvedValueOnce(1);
      mockRedis.expire.mockResolvedValueOnce(1);

      const result = await rateLimiter('test-key', 10, 60);

      expect(result).toEqual({ allowed: true, remaining: 9 });
      expect(mockRedis.incr).toHaveBeenCalledWith('test-key');
      expect(mockRedis.expire).toHaveBeenCalledWith('test-key', 60);
    });

    it('denies requests after the limit is exceeded', async () => {
      mockRedis.incr.mockResolvedValueOnce(11);

      const result = await rateLimiter('test-key', 10, 60);

      expect(result).toEqual({ allowed: false, remaining: 0 });
      expect(mockRedis.expire).not.toHaveBeenCalled();
    });

    it('uses the stricter local fallback when Redis errors', async () => {
      mockRedis.incr.mockRejectedValueOnce(new Error('redis down'));

      const result = await rateLimiter('fallback-key', 4, 60);

      expect(result).toEqual({ allowed: true, remaining: 1 });
    });
  });

  describe('withRateLimit HOC', () => {
    it('extracts forwarded IP only when trusted proxy mode is enabled and blocks on limit exceeded', async () => {
      process.env.TRUSTED_PROXY = 'true';
      (headersModule.headers as any).mockResolvedValue(
        new Map([['x-forwarded-for', '192.168.1.1, 10.0.0.2']]) as any,
      );
      mockRedis.incr.mockResolvedValueOnce(6);
      mockRedis.ttl.mockResolvedValueOnce(42);

      const mockAction = vi.fn().mockResolvedValue({ success: true });
      const wrappedAction = withRateLimit(mockAction, {
        actionName: 'testAction',
        limit: 5,
        windowSeconds: 60,
      });

      const result = await wrappedAction();

      expect(result.error).toBe('RATE_LIMITED');
      expect(result.retryAfter).toBe(42);
      expect(mockAction).not.toHaveBeenCalled();
      expect(mockRedis.incr).toHaveBeenCalledWith('rl:testAction:192.168.1.1');
    });

    it('does not trust spoofable forwarded headers by default', async () => {
      (headersModule.headers as any).mockResolvedValue(
        new Map([['x-forwarded-for', '10.0.0.1']]) as any,
      );
      mockRedis.incr.mockResolvedValueOnce(1);
      mockRedis.expire.mockResolvedValueOnce(1);

      const mockAction = vi.fn().mockResolvedValue({ success: true, message: 'Done' });
      const wrappedAction = withRateLimit(mockAction, {
        actionName: 'testAction',
        limit: 5,
        windowSeconds: 60,
      });

      const result = await wrappedAction('arg1', 'arg2');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Done');
      expect(mockAction).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockRedis.incr).toHaveBeenCalledWith('rl:testAction:127.0.0.1');
    });
  });
});
