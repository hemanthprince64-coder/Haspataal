import { QueueService } from './types';
import { InProcessQueueAdapter } from './adapters/inprocess-adapter';
import { BullMQQueueAdapter } from './adapters/bullmq-adapter';
import { PgBossQueueAdapter } from './adapters/pgboss-adapter';

let instance: QueueService | null = null;

export function getQueueService(): QueueService {
  if (instance) return instance;

  const driver = process.env.QUEUE_DRIVER;
  const dbProvider = process.env.DATABASE_PROVIDER;

  // sqlite requires in-process because we don't assume Redis is running
  if (dbProvider === 'sqlite' || driver === 'in-process') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'PRODUCTION SECURITY VIOLATION: InProcessQueueAdapter is not allowed in production. Configure a real QUEUE_DRIVER (e.g. bullmq, pg-boss) or check DATABASE_PROVIDER.'
      );
    }
    console.log('[QueueFactory] Initializing InProcessQueueAdapter');
    instance = new InProcessQueueAdapter();
  } else if (driver === 'pg-boss') {
    console.log('[QueueFactory] Initializing PgBossQueueAdapter');
    instance = new PgBossQueueAdapter();
  } else {
    console.log('[QueueFactory] Initializing BullMQQueueAdapter (default)');
    instance = new BullMQQueueAdapter();
  }

  return instance;
}
