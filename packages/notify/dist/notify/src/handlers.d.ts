import { NotificationEngine } from './engine';
export declare class NotificationCommandHandler {
    private engine;
    constructor(engine?: NotificationEngine);
    handleSendNotification(rawCommand: unknown): Promise<void>;
}
