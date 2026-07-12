import { prisma } from '@haspataal/db';
import { eventBus } from '@haspataal/events';
import { JourneyConsumer } from '@haspataal/journey';
import {
  ConsumerRegistry,
  EventConsumer,
  CanonicalEventEnvelope,
} from '@haspataal/platform-contracts';
import { TimelineConsumer } from '@haspataal/timeline';

import { AnalyticsConsumer } from './consumers/analytics.consumer';
import { BedConsumer } from './consumers/bed.consumer';
import { NotificationConsumer } from './consumers/notification.consumer';
import { SearchConsumer } from './consumers/search.consumer';

export const outboxConsumerRegistry = new ConsumerRegistry();
outboxConsumerRegistry.register(new TimelineConsumer());
outboxConsumerRegistry.register(new JourneyConsumer());
outboxConsumerRegistry.register(new BedConsumer());
outboxConsumerRegistry.register(new NotificationConsumer());
outboxConsumerRegistry.register(new SearchConsumer());
outboxConsumerRegistry.register(new AnalyticsConsumer());

export async function executeWithPrismaTxIdempotency(
  eventId: string,
  consumerName: string,
  logic: (tx: any) => Promise<void>,
) {
  const ledger: any[] =
    await prisma.$queryRaw`SELECT status FROM consumer_idempotency_ledger WHERE event_id = ${eventId} AND consumer_name = ${consumerName} LIMIT 1`;
  if (ledger.length > 0 && ledger[0].status === 'COMPLETED') return;

  await prisma.$transaction(async (tx) => {
    await logic(tx);
    await tx.$executeRaw`
      INSERT INTO consumer_idempotency_ledger (event_id, consumer_name, status, processed_at)
      VALUES (${eventId}, ${consumerName}, 'COMPLETED', NOW())
      ON CONFLICT (event_id, consumer_name) DO UPDATE SET status = 'COMPLETED', processed_at = NOW()
    `;
  });
}

export async function dispatchToConsumers(envelope: CanonicalEventEnvelope, originalPayload: any) {
  const effectiveEventType = originalPayload?.eventName ?? envelope.eventType;
  const consumers = outboxConsumerRegistry.getConsumersForEvent(effectiveEventType);

  // If there are specific consumers for this event, route to them
  if (consumers.length > 0) {
    for (const consumer of consumers) {
      await executeWithPrismaTxIdempotency(envelope.eventId, consumer.consumerName, async (tx) => {
        await consumer.handle(envelope, tx);
      });
    }
  }

  // Generic event bus publisher as a fallback or parallel consumer (like legacy relay)
  // For Phase 4, we keep this to support non-durable downstream apps until they migrate to Registry.
  await executeWithPrismaTxIdempotency(envelope.eventId, 'eventBus', async () => {
    await eventBus.publish({
      id: envelope.eventId,
      type: effectiveEventType,
      payload: originalPayload,
      timestamp: envelope.occurredAt ?? new Date(),
      correlationId: envelope.chain.correlationId ?? undefined,
      sourceSystem:
        originalPayload?.producer ?? originalPayload?.sourceSystem ?? 'haspataal-outbox',
      hospitalId: envelope.scope.hospitalId ?? undefined,
      actorId: envelope.actor.actorId ?? undefined,
      actorType: envelope.actor.actorType ?? undefined,
    });
  });
}
