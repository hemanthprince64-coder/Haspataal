import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

/**
 * BullMQ Queue Infrastructure (M3 Fix: migrated from bull to bullmq)
 * BullMQ uses ioredis connection and supports flows, sandboxed workers,
 * native backpressure, and better job lifecycle management.
 */
const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null, // Required by BullMQ
});

const defaultJobOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential' as const,
    delay: 5000,
  },
  removeOnComplete: { count: 1000 }, // Keep last 1000 completed jobs for audit
  removeOnFail: false, // Keep for DLQ investigation
};

// ── Queues ─────────────────────────────────────────────────────────────────
export const notificationQueue = new Queue('notifications', {
  connection,
  defaultJobOptions,
});

export const billingQueue = new Queue('billing', {
  connection,
  defaultJobOptions,
});

// ── Job Helper ─────────────────────────────────────────────────────────────
export const addJob = async (queue: Queue, name: string, data: unknown) => {
  return await queue.add(name, data, defaultJobOptions);
};

// ── Queue Backpressure / Rate Limiting ─────────────────────────────────────
export const notificationQueueEvents = new QueueEvents('notifications', { connection });

notificationQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`[BullMQ] Job ${jobId} in notifications failed: ${failedReason}`);
});

// ── Graceful Shutdown (M5 Fix for queue workers) ───────────────────────────
export async function closeQueues() {
  await notificationQueue.close();
  await billingQueue.close();
  await notificationQueueEvents.close();
  await connection.quit();
}
