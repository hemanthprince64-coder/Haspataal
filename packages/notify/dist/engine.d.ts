import { ChannelAdapter } from './adapters';
import { NotificationInput, Channel } from './types';

export declare class NotificationEngine {
  private adapters;
  private queues;
  constructor(adapters?: ChannelAdapter[]);
  enqueue(input: NotificationInput): Promise<
    NotificationInput & {
      channel: Channel;
    }
  >;
  prepareDb(
    input: NotificationInput,
    tx?: any,
  ): Promise<{
    notificationId: string;
    queueName: string;
    channel: Channel;
  }>;
  dispatchQueue(queueName: string, notificationId: string, priority?: string): Promise<void>;
  private getPriorityValue;
  private getMaxAttempts;
  private getBackoffStrategy;
}
