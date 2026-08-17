import { prisma } from '@haspataal/db';
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
    const { notificationId, queueName, channel } = await this.prepareDb(input);
    await this.dispatchQueue(queueName, notificationId, input.priority);
    return { ...input, channel };
  }

  async prepareDb(
    input: NotificationInput,
    tx?: any,
  ): Promise<{ notificationId: string; queueName: string; channel: Channel }> {
    const channel = await NotificationRouter.route(input);
    const queueName = NotificationRouter.getQueueName(channel, input.priority);
    const db = tx || prisma;
    const notification = await db.notification.create({
      data: {
        hospitalId: input.hospitalId as string,
        patientId: input.patientId,
        doctorId: input.doctorId,
        templateId: input.templateId,
        channel: channel,
        priority: input.priority,
        recipient: input.recipient,
        subject: input.subject,
        body: input.body,
        variables: input.variables ? (input.variables as any) : undefined,
        metadata: input.metadata ? (input.metadata as any) : undefined,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        status: 'QUEUED',
      } as any,
    });
    return { notificationId: notification.id, queueName, channel };
  }

  async dispatchQueue(queueName: string, notificationId: string, priority?: string): Promise<void> {
    let queue = this.queues.get(queueName);
    if (!queue) {
      queue = new Queue(queueName, { connection });
      this.queues.set(queueName, queue);
    }
    await queue.add(
      'notification',
      { notificationId },
      {
        priority: this.getPriorityValue(priority as any),
        attempts: this.getMaxAttempts(priority as any),
        backoff: this.getBackoffStrategy(priority as any),
      },
    );
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
