export declare class NotificationAnalytics {
    static deliveryRate(hospitalId?: string): Promise<{
        total: number;
        sent: number;
        rate: number;
    }>;
    static failureRate(hospitalId?: string): Promise<{
        total: number;
        failed: number;
        rate: number;
    }>;
    static channelUsage(hospitalId?: string): Promise<{
        channel: string;
        count: number;
    }[]>;
}
