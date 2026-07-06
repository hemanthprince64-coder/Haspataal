"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRouter = void 0;
const db_1 = require("@haspataal/db");
class NotificationRouter {
    static async route(input) {
        if (input.channel) {
            return input.channel;
        }
        if (!input.patientId) {
            return 'SMS';
        }
        const prefs = await db_1.prisma.notificationPreference.findUnique({
            where: { userId: input.patientId },
        });
        if (!prefs)
            return 'SMS';
        const channelPriority = ['SMS', 'WHATSAPP', 'EMAIL', 'PUSH', 'IN_APP'];
        for (const channel of channelPriority) {
            if (prefs[channel.toLowerCase()]) {
                return channel;
            }
        }
        return 'SMS';
    }
    static getQueueName(channel, priority) {
        return `${channel.toLowerCase()}-notifications`;
    }
}
exports.NotificationRouter = NotificationRouter;
