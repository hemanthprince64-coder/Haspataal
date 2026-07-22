/* eslint-disable */
import Redlock from 'redlock';
import IORedis from 'ioredis';

const isSqlite = process.env.DATABASE_PROVIDER === 'sqlite';
const hasRedis = !!process.env.REDIS_HOST;

let redisConnection: IORedis | null = null;
let redlock: Redlock | null = null;

if (!isSqlite && hasRedis) {
  /**
   * Shared Redis connection for Redlock.
   * Using a single connection prevents connection pool exhaustion.
   */
  redisConnection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  });

  redisConnection.on('error', (err) => {
    // Silent fail - redlock handles its own retry logic
  });

  /**
   * REDLOCK instance for multi-node distributed locking (M2 Fix)
   * Replaces the simple SETNX approach in redis-lock.ts with
   * the Redlock algorithm for true multi-node safety.
   */
  redlock = new Redlock([redisConnection], {
    driftFactor: 0.01,
    retryCount: 10,
    retryDelay: 200,
    retryJitter: 200,
    automaticExtensionThreshold: 500,
  });

  redlock.on('error', (err) => {
    // Suppress "Unable to fully release lock" warnings which are expected
    // when the lock expires before explicit release (e.g., process crash)
    if (!String(err).includes('Unable to fully release lock')) {
      console.error('[Redlock] Error:', err);
    }
  });
}

/**
 * Acquire a named distributed lock.
 * @param resource - Unique lock key (e.g. `slot:${doctorId}:${slotTime}`)
 * @param ttlMs - Lock TTL in milliseconds (default 30s)
 * @returns Lock instance or null if acquisition failed
 */
export async function acquireDistributedLock(resource: string, ttlMs: number = 30_000) {
  if (isSqlite || !redlock) {
    // Return a dummy lock for local/offline modes
    return {
      release: async () => {}
    };
  }

  try {
    return await redlock.acquire([`lock:${resource}`], ttlMs);
  } catch {
    console.warn(`[Redlock] Could not acquire lock: ${resource}`);
    return null;
  }
}

export { redisConnection, redlock };

