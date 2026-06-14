import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { QueueService } from '../types';

export class BullMQQueueAdapter implements QueueService {
  private connection: IORedis;
  private queues = new Map<string, Queue>();
  private workers = new Map<string, Worker>();

  constructor() {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379');
    
    this.connection = new IORedis({
      host: redisHost,
      port: redisPort,
      maxRetriesPerRequest: null, // Required by BullMQ
    });
    
    this.connection.on('error', (err) => {
      // Avoid process crashing on connection errors, but log it
      console.error('[BullMQAdapter] Redis connection error:', err);
    });
  }

  private getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      this.queues.set(
        queueName,
        new Queue(queueName, {
          connection: this.connection,
          defaultJobOptions: {
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
            removeOnComplete: { count: 1000 },
            removeOnFail: false,
          },
        })
      );
    }
    return this.queues.get(queueName)!;
  }

  async addJob(queueName: string, jobName: string, data: any, options?: any): Promise<any> {
    const queue = this.getQueue(queueName);
    return await queue.add(jobName, data, options);
  }

  async registerWorker(queueName: string, handler: (data: any) => Promise<void>, options?: any): Promise<any> {
    if (this.workers.has(queueName)) {
      throw new Error(`Worker already registered for queue: ${queueName}`);
    }
    const worker = new Worker(
      queueName,
      async (job) => {
        await handler(job.data);
      },
      {
        connection: this.connection,
        ...options,
      }
    );
    this.workers.set(queueName, worker);
    console.log(`[BullMQAdapter] Worker registered for queue: ${queueName}`);
    return worker;
  }

  async close(): Promise<void> {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    for (const worker of this.workers.values()) {
      await worker.close();
    }
    await this.connection.quit();
    console.log('[BullMQAdapter] Closed BullMQ queue service');
  }
}
