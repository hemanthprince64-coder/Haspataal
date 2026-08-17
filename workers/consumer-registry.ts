import { BillingEventConsumer } from '@haspataal/billing';
import { prisma } from '@haspataal/db';
import { eventBus } from '@haspataal/events';
import { JourneyConsumer } from '@haspataal/journey';
import {
  ConsumerRegistry,
  EventConsumer,
  CanonicalEventEnvelope,
} from '@haspataal/platform-contracts';
import { TimelineConsumer } from '@haspataal/timeline';
import crypto from 'crypto';

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
outboxConsumerRegistry.register(new BillingEventConsumer());

function generateIntegerHash(input: string): number {
  const hash = crypto.createHash('sha256').update(input).digest();
  // Read first 4 bytes as a 32-bit integer for the advisory lock key
  return hash.readInt32BE(0);
}

export async function executeWithPrismaTxIdempotency(
  eventId: string,
  consumerName: string,
  version: number,
  logic: (tx: any) => Promise<void>,
) {
  const lockKey = generateIntegerHash(`${eventId}-${consumerName}-${version}`);

  await prisma.$transaction(async (tx) => {
    // Acquire transaction-level advisory lock
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;

    const ledger: any[] =
      await tx.$queryRaw`SELECT status FROM consumer_idempotency_ledger WHERE event_id = ${eventId} AND consumer_name = ${consumerName} AND version = ${version} LIMIT 1`;

    if (ledger.length > 0 && ledger[0].status === 'COMPLETED') return;

    const start = Date.now();
    await logic(tx);
    const durationMs = Date.now() - start;

    await tx.$executeRaw`
      INSERT INTO consumer_idempotency_ledger (event_id, consumer_name, version, status, processed_at, duration_ms)
      VALUES (${eventId}, ${consumerName}, ${version}, 'COMPLETED', NOW(), ${durationMs})
      ON CONFLICT (event_id, consumer_name, version) DO UPDATE SET status = 'COMPLETED', processed_at = NOW(), duration_ms = ${durationMs}
    `;
  });
}

export async function dispatchToConsumers(envelope: CanonicalEventEnvelope, originalPayload: any) {
  const effectiveEventType = originalPayload?.eventName ?? envelope.eventType;
  const consumers = outboxConsumerRegistry.getConsumersForEvent(effectiveEventType);

  // If there are specific consumers for this event, route to them
  if (consumers.length > 0) {
    for (const consumer of consumers) {
      await executeWithPrismaTxIdempotency(
        envelope.eventId,
        consumer.consumerName,
        consumer.consumerVersion || 1,
        async (tx) => {
          await consumer.handle(envelope, tx);
        },
      );
    }
  }

  // Generic event bus publisher as a fallback or parallel consumer (like legacy relay)
  // For Phase 4, we keep this to support non-durable downstream apps until they migrate to Registry.
  await executeWithPrismaTxIdempotency(envelope.eventId, 'eventBus', 1, async () => {
    await eventBus.publish({
      id: envelope.eventId,
      type: effectiveEventType,
      version: envelope.eventVersion || 1,
      eventVersion: envelope.eventVersion || 1,
      schemaVersion: 1,
      aggregateId: envelope.aggregate?.aggregateId || 'unknown',
      aggregateType: envelope.aggregate?.aggregateType || 'unknown',
      payload: originalPayload,
      occurredAt: envelope.occurredAt ?? new Date(),
      correlationId: envelope.chain?.correlationId ?? undefined,
      causationId:
        originalPayload?.producer ?? originalPayload?.sourceSystem ?? 'haspataal-outbox',
      hospitalId: envelope.scope.hospitalId ?? undefined,
      actor: envelope.actor?.actorId ? { id: envelope.actor.actorId, type: envelope.actor?.actorType ?? 'USER' } : undefined,
    });
  });
}
