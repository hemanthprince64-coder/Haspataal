"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationOutbox = exports.NotificationSentPayloadSchema = void 0;
const db_1 = require("@haspataal/db");
const platform_contracts_1 = require("@haspataal/platform-contracts");
const zod_1 = require("zod");
const crypto_1 = require("crypto");
exports.NotificationSentPayloadSchema = zod_1.z.object({
    notificationId: zod_1.z.string().uuid(),
    channel: zod_1.z.string(),
    recipient: zod_1.z.string(),
    status: zod_1.z.string(),
    deliveredAt: zod_1.z.coerce.date(),
});
const NotificationSentEventSchema = (0, platform_contracts_1.createPlatformEventSchema)(exports.NotificationSentPayloadSchema);
class NotificationOutbox {
    /**
     * Publishes a NOTIFICATION_SENT event to the Outbox
     */
    static async publishSentEvent(payload, tenantContext, actorContext, correlationId, causationId) {
        const rawEvent = {
            eventId: (0, crypto_1.randomUUID)(),
            eventName: 'NOTIFICATION_SENT',
            eventVersion: 1,
            occurredAt: new Date(),
            publishedAt: new Date(),
            producer: 'notification-engine',
            tenantContext,
            actorReference: actorContext,
            correlationId,
            causationId,
            traceId: (0, crypto_1.randomUUID)(),
            idempotencyKey: payload.notificationId,
            payload,
            metadata: {},
        };
        const validatedEvent = NotificationSentEventSchema.parse(rawEvent);
        await db_1.prisma.outboxEvent.create({
            data: {
                id: validatedEvent.eventId,
                eventType: validatedEvent.eventName,
                payload: {
                    eventPayload: validatedEvent.payload,
                    metadata: {
                        aggregateType: 'Notification',
                        aggregateId: payload.notificationId,
                        traceId: validatedEvent.traceId,
                        tenantId: validatedEvent.tenantContext.hospitalId,
                    }
                },
                processed: false,
            },
        });
    }
}
exports.NotificationOutbox = NotificationOutbox;
