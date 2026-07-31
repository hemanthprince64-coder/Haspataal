'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.RedisRateLimiter = void 0;
const ioredis_1 = require('ioredis');
const redis = process.env.REDIS_URL ? new ioredis_1.Redis(process.env.REDIS_URL) : null;
if (redis)
  redis.on('error', () => {
    /* ignore build-time connection errors */
  });
class RedisRateLimiter {
  static async checkLimit(key, limit, windowSec) {
    if (!redis) return true;
    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, windowSec);
    return current <= limit;
  }
}
exports.RedisRateLimiter = RedisRateLimiter;
