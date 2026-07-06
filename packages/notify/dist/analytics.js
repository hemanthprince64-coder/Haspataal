"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationAnalytics = void 0;
const db_1 = require("@haspataal/db");
class NotificationAnalytics {
    static async deliveryRate(hospitalId) {
        const where = hospitalId ? { where: { hospitalId } } : {};
        const total = await db_1.prisma.notification.count(where);
        const sent = await db_1.prisma.notification.count({
            where: { ...(where.where || {}), status: 'SENT' },
        });
        return { total, sent, rate: total > 0 ? (sent / total) * 100 : 0 };
    }
    static async failureRate(hospitalId) {
        const where = hospitalId ? { where: { hospitalId } } : {};
        const total = await db_1.prisma.notification.count(where);
        const failed = await db_1.prisma.notification.count({
            where: { ...(where.where || {}), status: 'FAILED' },
        });
        return { total, failed, rate: total > 0 ? (failed / total) * 100 : 0 };
    }
    static async channelUsage(hospitalId) {
        const base = hospitalId ? { hospitalId } : {};
        const channels = ['SMS', 'WHATSAPP', 'EMAIL', 'PUSH', 'IN_APP'];
        const stats = await Promise.all(channels.map(async (channel) => ({
            channel,
            count: await db_1.prisma.notification.count({
                where: { ...base, channel },
            }),
        })));
        return stats;
    }
}
exports.NotificationAnalytics = NotificationAnalytics;
