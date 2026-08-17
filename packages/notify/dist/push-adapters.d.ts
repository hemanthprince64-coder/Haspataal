export declare class PushNotificationAdapter {
    channel: string;
    deliver(): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    validateConfig(config: Record<string, any>): boolean;
}
export declare class InAppNotificationAdapter {
    channel: string;
    deliver(): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
