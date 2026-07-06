import { z } from 'zod';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { createPlatformCommandSchema, PlatformCommand } from '@haspataal/platform-contracts';
import { TimelineEventInput, TimelineEventSchema } from './index';

export const AddToTimelineCommandSchema = createPlatformCommandSchema(TimelineEventSchema as any);

export class TimelineCommandHandler {
  private queue: Queue;

  constructor(redisConnection?: IORedis) {
    const connection =
      redisConnection ??
      new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        maxRetriesPerRequest: null,
      });

    this.queue = new Queue('timeline-ingestion', { connection });
  }

  async handleAddToTimeline(rawCommand: unknown): Promise<void> {
    const command = AddToTimelineCommandSchema.parse(rawCommand) as PlatformCommand<TimelineEventInput>;
    const payload = command.payload;
    const correlationId = command.correlationId;

    // Enqueue on BullMQ for the legacy timeline worker to process
    await this.queue.add(
      payload.eventType,
      { ...payload, correlationId },
      {
        jobId: correlationId, // idempotent job ID for BullMQ de-dup
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { count: 100 },
        removeOnFail: false, // keep in DLQ for inspection
      }
    );
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
