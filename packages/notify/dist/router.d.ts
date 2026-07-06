import { NotificationInput, Channel, Priority } from './types';
export declare class NotificationRouter {
    static route(input: NotificationInput): Promise<Channel>;
    static getQueueName(channel: Channel, priority: Priority): string;
}
