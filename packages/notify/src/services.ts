import { prisma } from '@haspataal/db';
import { Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export class RetryEngine {
  static async moveToDeadLetter(
    notificationId: string,
    reason: string,
    error: string,
  ): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'FAILED', failureReason: `${reason}: ${error}` },
    });
  }

  static async scheduleRetry(notificationId: string, delayMs: number): Promise<void> {
    const retryQueue = new Queue('notification-retry', { connection });
    await retryQueue.add('retry', { notificationId }, { delay: delayMs });
  }
}

export class Scheduler {
  static async schedule(input: { notificationId: string; scheduledAt: Date }): Promise<void> {
    const delayMs = input.scheduledAt.getTime() - Date.now();
    const scheduledQueue = new Queue('notification-scheduled', { connection });
    await scheduledQueue.add(
      'scheduled',
      { notificationId: input.notificationId },
      { delay: Math.max(0, delayMs) },
    );
  }

  static async cancel(notificationId: string): Promise<void> {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (notification && notification.status === 'QUEUED') {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'CANCELLED' },
      });
    }
  }
}
