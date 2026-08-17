import { prisma } from '@haspataal/db';
import { createPlatformEventSchema, PlatformEvent } from '@haspataal/platform-contracts';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const NotificationSentPayloadSchema = z.object({
  notificationId: z.string().uuid(),
  channel: z.string(),
  recipient: z.string(),
  status: z.string(),
  deliveredAt: z.coerce.date(),
});

export type NotificationSentPayload = z.infer<typeof NotificationSentPayloadSchema>;

const NotificationSentEventSchema = createPlatformEventSchema(NotificationSentPayloadSchema);

export class NotificationOutbox {
  /**
   * Publishes a NOTIFICATION_SENT event to the Outbox
   */
  static async publishSentEvent(
    payload: NotificationSentPayload,
    tenantContext: any,
    actorContext: any,
    correlationId: string,
    causationId: string
  ) {
    const rawEvent = {
      eventId: randomUUID(),
      eventName: 'NOTIFICATION_SENT',
      eventVersion: 1,
      occurredAt: new Date(),
      publishedAt: new Date(),
      producer: 'notification-engine',
      tenantContext,
      actorReference: actorContext,
      correlationId,
      causationId,
      traceId: randomUUID(),
      idempotencyKey: payload.notificationId,
      payload,
      metadata: {},
    };

    const validatedEvent = NotificationSentEventSchema.parse(rawEvent) as PlatformEvent<NotificationSentPayload>;

    await prisma.outboxEvent.create({
      data: {
        id: validatedEvent.eventId,
        eventType: validatedEvent.eventName,
        payload: validatedEvent,
        processed: false,
      },
    });
  }
}
