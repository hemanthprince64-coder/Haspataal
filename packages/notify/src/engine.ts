import { Queue } from 'bullmq';

import { ChannelAdapter } from './adapters';
import { NotificationRouter } from './router';
import { NotificationInput, Priority, Channel } from './types';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export class NotificationEngine {
  private adapters: ChannelAdapter[] = [];
  private queues: Map<string, Queue> = new Map();

  constructor(adapters: ChannelAdapter[] = []) {
    this.adapters = adapters;
  }

  async enqueue(input: NotificationInput): Promise<NotificationInput & { channel: Channel }> {
    const channel = await NotificationRouter.route(input);
    const queueName = NotificationRouter.getQueueName(channel, input.priority);

    let queue = this.queues.get(queueName);
    if (!queue) {
      queue = new Queue(queueName, { connection });
      this.queues.set(queueName, queue);
    }

    await queue.add('notification', input, {
      priority: this.getPriorityValue(input.priority),
      attempts: this.getMaxAttempts(input.priority),
      backoff: this.getBackoffStrategy(input.priority),
    });

    return { ...input, channel };
  }

  private getPriorityValue(priority: Priority): number {
    const map: Record<Priority, number> = {
      EMERGENCY: 100,
      CRITICAL: 75,
      HIGH: 50,
      NORMAL: 25,
      LOW: 10,
      BACKGROUND: 1,
    };
    return map[priority] || 25;
  }

  private getMaxAttempts(priority: Priority): number {
    const map: Record<Priority, number> = {
      EMERGENCY: 10,
      CRITICAL: 5,
      HIGH: 3,
      NORMAL: 3,
      LOW: 1,
      BACKGROUND: 1,
    };
    return map[priority] || 3;
  }

  private getBackoffStrategy(priority: Priority): { type: 'exponential' | 'fixed'; delay: number } {
    return { type: 'exponential', delay: priority === 'EMERGENCY' ? 1000 : 5000 };
  }
}
