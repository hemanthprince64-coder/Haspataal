import { ChannelAdapter } from './adapters';
import { NotificationInput, Channel } from './types';
export declare class NotificationEngine {
    private adapters;
    private queues;
    constructor(adapters?: ChannelAdapter[]);
    enqueue(input: NotificationInput): Promise<NotificationInput & {
        channel: Channel;
    }>;
    private getPriorityValue;
    private getMaxAttempts;
    private getBackoffStrategy;
}
