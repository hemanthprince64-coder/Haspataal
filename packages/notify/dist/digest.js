"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigestEngine = void 0;
const db_1 = require("@haspataal/db");
class DigestEngine {
    static async generateDigest(patientId, type) {
        const since = new Date();
        if (type === 'daily')
            since.setDate(since.getDate() - 1);
        if (type === 'weekly')
            since.setDate(since.getDate() - 7);
        const notifications = await db_1.prisma.notification.findMany({
            where: { createdAt: { gte: since }, NOT: { status: 'READ' } },
            orderBy: { createdAt: 'desc' },
        });
        return {
            type,
            count: notifications.length,
            items: notifications.map((n) => ({ channel: n.channel, body: n.body })),
        };
    }
}
exports.DigestEngine = DigestEngine;
