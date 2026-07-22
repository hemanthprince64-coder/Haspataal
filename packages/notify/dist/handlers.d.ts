import { PlatformCommand } from '@haspataal/platform-contracts';
import { NotificationEngine } from './engine';
export declare class NotificationCommandHandler {
    private engine;
    constructor(engine?: NotificationEngine);
    handleSendNotification(rawCommand: unknown): Promise<void>;
    handleSendNotificationPrepareDb(rawCommand: unknown, options?: {
        tx?: any;
    }): Promise<{
        notificationId: string;
        queueName: string;
        channel: import("./types").Channel;
    }>;
    handleSendNotificationDispatch(queueName: string, notificationId: string, priority?: string): Promise<void>;
    handleCreateTemplate(command: PlatformCommand<any>): Promise<{
        id: string;
        hospitalId: string;
        name: string;
        channel: string;
        body: string;
        headerText: string | null;
        footerText: string | null;
        buttons: import(".prisma/client").Prisma.JsonValue | null;
        language: string;
        isApproved: boolean;
        providerId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    handleCreateCampaign(command: PlatformCommand<any>): Promise<{
        id: string;
        hospitalId: string | null;
        name: string;
        description: string | null;
        category: string;
        channel: string;
        template: string;
        audience: import(".prisma/client").Prisma.JsonValue;
        scheduledAt: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
