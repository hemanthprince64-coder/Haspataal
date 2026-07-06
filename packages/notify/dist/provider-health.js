"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderHealthMonitor = void 0;
const db_1 = require("@haspataal/db");
class ProviderHealthMonitor {
    static async checkProvider(providerId, latency, error) {
        const health = await db_1.prisma.notificationProviderHealth.upsert({
            where: { providerId },
            update: {
                latency,
                lastCheck: new Date(),
                errorCount: error ? { increment: 1 } : undefined,
            },
            create: {
                providerId,
                latency,
                errorCount: error ? 1 : 0,
                successCount: error ? 0 : 1,
            },
        });
        return health;
    }
    static async selectProvider(channel, hospitalId) {
        return await db_1.prisma.notificationProvider.findFirst({
            where: {
                channel,
                isActive: true,
                ...(hospitalId && { hospitalId }),
            },
            orderBy: { priority: 'asc' },
        });
    }
    static async getHealthStats() {
        return await db_1.prisma.notificationProviderHealth.findMany();
    }
}
exports.ProviderHealthMonitor = ProviderHealthMonitor;
