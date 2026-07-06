"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderHealth = exports.RateLimiter = void 0;
const db_1 = require("@haspataal/db");
class RateLimiter {
    static buildKey(hospitalId, channel, userId) {
        const parts = [hospitalId, channel];
        if (userId)
            parts.push(userId);
        return `rate:${parts.join(':')}`;
    }
}
exports.RateLimiter = RateLimiter;
class ProviderHealth {
    static async getHealthiestProvider(channel, hospitalId) {
        return await db_1.prisma.notificationProvider.findFirst({
            where: {
                channel,
                isActive: true,
                ...(hospitalId && { hospitalId }),
            },
            orderBy: { priority: 'asc' },
        });
    }
}
exports.ProviderHealth = ProviderHealth;
