export declare class ProviderHealthMonitor {
    static checkProvider(providerId: string, latency: number, error?: string): Promise<{
        id: string;
        providerId: string;
        latency: number;
        errorCount: number;
        successCount: number;
        lastCheck: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static selectProvider(channel: string, hospitalId?: string): Promise<{
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
    static getHealthStats(): Promise<{
        id: string;
        providerId: string;
        latency: number;
        errorCount: number;
        successCount: number;
        lastCheck: Date;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
