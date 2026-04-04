import IORedis from 'ioredis';

const redis = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

/**
 * Simple single-node Redis slot lock (optimistic fast path).
 * For multi-node deployments, the slot-engine uses Redlock instead.
 *
 * @param doctorId - Doctor identifier
 * @param slotTime - Slot timestamp string
 * @param ttlSeconds - Lock TTL (default 30s)
 * @returns true if lock acquired, false if already locked
 */
export async function acquireSlotLock(doctorId: string, slotTime: string, ttlSeconds: number = 30): Promise<boolean> {
  const lockKey = `slot:lock:${doctorId}:${slotTime}`;

  // ioredis v5 accepts SET options as an object
  const result = await redis.set(lockKey, 'LOCKED', 'EX', ttlSeconds, 'NX');

  return result === 'OK';
}

export async function releaseSlotLock(doctorId: string, slotTime: string): Promise<void> {
  const lockKey = `slot:lock:${doctorId}:${slotTime}`;
  await redis.del(lockKey);
}
