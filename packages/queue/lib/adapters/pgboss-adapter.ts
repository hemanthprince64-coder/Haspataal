import PgBoss from 'pg-boss';
import { QueueService } from '../types';

export class PgBossQueueAdapter implements QueueService {
  private boss: PgBoss;
  private started = false;
  private startPromise: Promise<void> | null = null;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('[PgBossAdapter] DATABASE_URL environment variable must be set');
    }
    // Set up pg-boss using the database URL
    this.boss = new PgBoss(connectionString);
    this.boss.on('error', (err) => {
      console.error('[PgBossAdapter] pg-boss error:', err);
    });
  }

  private async ensureStarted() {
    if (this.started) return;
    if (!this.startPromise) {
      this.startPromise = this.boss.start().then(() => {
        this.started = true;
      });
    }
    await this.startPromise;
  }

  async addJob(queueName: string, jobName: string, data: any, options?: any): Promise<any> {
    await this.ensureStarted();
    
    // Translate standard options to pg-boss options
    const sendOptions: PgBoss.SendOptions = {
      retryLimit: options?.attempts ?? 5,
      retryBackoff: options?.backoff?.type === 'exponential' || options?.backoff === true,
    };
    
    if (options?.backoff?.delay) {
      // pg-boss retryDelay is in seconds
      sendOptions.retryDelay = Math.max(1, Math.round(options.backoff.delay / 1000));
    }
    
    const id = await this.boss.send(queueName, data || {}, sendOptions);
    console.log(`[PgBossAdapter] Sent job to queue "${queueName}" [Job ID: ${id}]`);
    return { id };
  }

  async registerWorker(queueName: string, handler: (data: any) => Promise<void>, _options?: any): Promise<any> {
    await this.ensureStarted();
    
    // We register the work handler
    await this.boss.work(queueName, async (job) => {
      await handler(job.data);
    });
    
    console.log(`[PgBossAdapter] Worker registered for queue: ${queueName}`);
    return { queueName };
  }

  async close(): Promise<void> {
    if (this.started) {
      await this.boss.stop();
      this.started = false;
      this.startPromise = null;
      console.log('[PgBossAdapter] Closed pg-boss queue service');
    }
  }
}
