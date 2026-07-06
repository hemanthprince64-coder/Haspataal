export declare class RateLimiter {
    static buildKey(hospitalId: string, channel: string, userId?: string): string;
}
export declare class ProviderHealth {
    static getHealthiestProvider(channel: string, hospitalId?: string): Promise<{
        id: string;
        hospitalId: string | null;
        name: string;
        channel: string;
        type: string;
        config: import(".prisma/client").Prisma.JsonValue;
        isActive: boolean;
        priority: number;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
