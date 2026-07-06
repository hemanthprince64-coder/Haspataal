"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = exports.RetryEngine = void 0;
const db_1 = require("@haspataal/db");
const bullmq_1 = require("bullmq");
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};
class RetryEngine {
    static async moveToDeadLetter(notificationId, reason, error) {
        await db_1.prisma.notification.update({
            where: { id: notificationId },
            data: { status: 'FAILED', failureReason: `${reason}: ${error}` },
        });
    }
    static async scheduleRetry(notificationId, delayMs) {
        const retryQueue = new bullmq_1.Queue('notification-retry', { connection });
        await retryQueue.add('retry', { notificationId }, { delay: delayMs });
    }
}
exports.RetryEngine = RetryEngine;
class Scheduler {
    static async schedule(input) {
        const delayMs = input.scheduledAt.getTime() - Date.now();
        const scheduledQueue = new bullmq_1.Queue('notification-scheduled', { connection });
        await scheduledQueue.add('scheduled', { notificationId: input.notificationId }, { delay: Math.max(0, delayMs) });
    }
    static async cancel(notificationId) {
        const notification = await db_1.prisma.notification.findUnique({ where: { id: notificationId } });
        if (notification && notification.status === 'QUEUED') {
            await db_1.prisma.notification.update({
                where: { id: notificationId },
                data: { status: 'CANCELLED' },
            });
        }
    }
}
exports.Scheduler = Scheduler;
