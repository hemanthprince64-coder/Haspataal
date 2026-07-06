"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEngine = void 0;
const db_1 = require("@haspataal/db");
const bullmq_1 = require("bullmq");
const router_1 = require("./router");
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};
class NotificationEngine {
    adapters = [];
    queues = new Map();
    constructor(adapters = []) {
        this.adapters = adapters;
    }
    async enqueue(input) {
        const channel = await router_1.NotificationRouter.route(input);
        const queueName = router_1.NotificationRouter.getQueueName(channel, input.priority);
        let queue = this.queues.get(queueName);
        if (!queue) {
            queue = new bullmq_1.Queue(queueName, { connection });
            this.queues.set(queueName, queue);
        }
        const notification = await db_1.prisma.notification.create({
            data: {
                hospitalId: input.hospitalId,
                patientId: input.patientId,
                doctorId: input.doctorId,
                templateId: input.templateId,
                channel: channel,
                priority: input.priority,
                recipient: input.recipient,
                subject: input.subject,
                body: input.body,
                variables: input.variables ? input.variables : undefined,
                metadata: input.metadata ? input.metadata : undefined,
                scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
                status: 'QUEUED',
            },
        });
        await queue.add('notification', { notificationId: notification.id }, {
            priority: this.getPriorityValue(input.priority),
            attempts: this.getMaxAttempts(input.priority),
            backoff: this.getBackoffStrategy(input.priority),
        });
        return { ...input, channel };
    }
    getPriorityValue(priority) {
        const map = {
            EMERGENCY: 100,
            CRITICAL: 75,
            HIGH: 50,
            NORMAL: 25,
            LOW: 10,
            BACKGROUND: 1,
        };
        return map[priority] || 25;
    }
    getMaxAttempts(priority) {
        const map = {
            EMERGENCY: 10,
            CRITICAL: 5,
            HIGH: 3,
            NORMAL: 3,
            LOW: 1,
            BACKGROUND: 1,
        };
        return map[priority] || 3;
    }
    getBackoffStrategy(priority) {
        return { type: 'exponential', delay: priority === 'EMERGENCY' ? 1000 : 5000 };
    }
}
exports.NotificationEngine = NotificationEngine;
