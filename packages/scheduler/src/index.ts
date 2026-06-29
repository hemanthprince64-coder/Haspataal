// ============================================================
// @haspataal/scheduler - BullMQ Cron Engine
// ============================================================
import { Queue, Worker, CronJob } from 'bullmq';

export interface CronOptions {
  name: string;
  cron: string;
  timezone?: string;
  handler: (job: CronJob) => Promise<void>;
}

export class Scheduler {
  private static instance: Scheduler;
  private queues: Map<string, Queue>;
  private workers: Map<string, Worker>;

  private constructor() {
    this.queues = new Map();
    this.workers = new Map();
  }

  static getInstance(): Scheduler {
    if (!Scheduler.instance) {
      Scheduler.instance = new Scheduler();
    }
    return Scheduler.instance;
  }

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      this.queues.set(
        name,
        new Queue(name, {
          connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
        }),
      );
    }
    return this.queues.get(name)!;
  }

  schedule(options: CronOptions): void {
    const queue = this.getQueue(options.name);
    const worker = new Worker(
      options.name,
      async (job) => {
        await options.handler(job);
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      },
    );
    this.workers.set(options.name, worker);

    queue.add(
      'cron-trigger',
      {},
      {
        jobId: `cron-${options.name}-${Date.now()}`,
        repeat: {
          cron: options.cron,
          timezone: options.timezone || 'Asia/Kolkata',
        },
      },
    );
  }

  async close(): Promise<void> {
    for (const worker of this.workers.values()) {
      await worker.close();
    }
    for (const queue of this.queues.values()) {
      await queue.close();
    }
  }
}

export const scheduler = Scheduler.getInstance();

// Cron job definitions
export const CRON_JOBS = {
  FOLLOW_UP_REMINDER: {
    name: 'follow-up-reminder',
    cron: '*/5 * * * *', // Every 5 minutes
  },
  ESCALATION_CHECK: {
    name: 'escalation-check',
    cron: '0 */1 * * *', // Every hour
  },
  SLOT_CLEANUP: {
    name: 'slot-cleanup',
    cron: '0 0 * * *', // Daily at midnight
  },
  PREGNANCY_REMINDER: {
    name: 'pregnancy-reminder',
    cron: '0 8 * * *', // Daily at 8 AM IST
  },
  VACCINATION_REMINDER: {
    name: 'vaccination-reminder',
    cron: '0 9 * * *', // Daily at 9 AM IST
  },
} as const;
