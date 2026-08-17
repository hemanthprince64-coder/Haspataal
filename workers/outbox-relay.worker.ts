import { prisma } from '@haspataal/db';
import { normalizeLegacyOutbox, OutboxDeliveryStatus } from '@haspataal/platform-contracts';
import { randomUUID } from 'crypto';

import logger from '../apps/patient-portal/lib/logger';
import { dispatchToConsumers } from './consumer-registry';

function parsePayload(raw: unknown): any {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

function domainPayload(payload: any) {
  return payload; // Preserve the full envelope end-to-end
}

/**
 * Phase 0B: Persist an exhaustively-retried event durably.
 */
async function persistDeadLetter(record: any, error: string, errorCount: number) {
  try {
    await prisma.$transaction(async (tx) => {
      const existing: any[] =
        await tx.$queryRaw`SELECT 1 FROM dead_letter_events WHERE original_outbox_id = ${record.id} LIMIT 1`;

      if (existing.length === 0) {
        await tx.$executeRaw`
          INSERT INTO dead_letter_events (
            id, original_outbox_id, event_type, payload,
            last_error, error_count, dead_lettered_at
          ) VALUES (
            gen_random_uuid()::text, ${record.id}, ${record.eventType}, ${record.payload}::jsonb,
            ${error}, ${errorCount}, NOW()
          )
        `;
      } else {
        await tx.$executeRaw`
          UPDATE dead_letter_events
          SET last_error = ${error},
              error_count = ${errorCount},
              dead_lettered_at = NOW()
          WHERE original_outbox_id = ${record.id}
        `;
      }

      await tx.$executeRaw`
        UPDATE outbox_events
        SET delivery_status = ${OutboxDeliveryStatus.DEAD_LETTERED},
            processed = true,
            error_count = ${errorCount},
            last_error = ${error}
        WHERE id = ${record.id}
      `;
    });
  } catch (e: any) {
    logger.error(
      { action: 'dead_letter_persist_failed', eventId: record.id, error: e.message },
      'Failed to persist dead letter event',
    );
  }
}

async function dispatchOutboxEvent(record: any) {
  const payload = parsePayload(record.payload);
  const envelope = normalizeLegacyOutbox(record);

  await dispatchToConsumers(envelope, payload);
}

async function processOutbox() {
  const BATCH_SIZE = 100;
  try {
    const lockId = randomUUID();
    const events: any[] = await prisma.$queryRaw`
      UPDATE outbox_events SET locked_by = ${lockId}, locked_until = NOW() + INTERVAL '5 minutes'
      WHERE id IN (
        SELECT id FROM outbox_events
        WHERE (delivery_status = 'PENDING' OR delivery_status = 'RETRYABLE_FAILED')
          AND (next_retry_at IS NULL OR next_retry_at <= NOW())
          AND (locked_until IS NULL OR locked_until < NOW())
        ORDER BY created_at ASC LIMIT ${BATCH_SIZE}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *;
    `;

    if (!events || events.length === 0) return;

    for (const rawRecord of events) {
      let record: any;
      try {
        record = {
          id: rawRecord.id,
          eventType: rawRecord.event_type,
          payload: rawRecord.payload,
          errorCount: rawRecord.error_count,
          eventVersion: rawRecord.event_version,
          aggregateType: rawRecord.aggregate_type,
          aggregateId: rawRecord.aggregate_id,
          scopeType: rawRecord.scope_type,
          hospitalId: rawRecord.hospital_id,
          tenantId: rawRecord.tenant_id,
          actorId: rawRecord.actor_id,
          actorType: rawRecord.actor_type,
          actorRole: rawRecord.actor_role,
          correlationId: rawRecord.correlation_id,
          causationId: rawRecord.causation_id,
          depth: rawRecord.depth,
          occurredAt: rawRecord.occurred_at,
          deliveryStatus: rawRecord.delivery_status,
        };
        await dispatchOutboxEvent(record);
        await prisma.$executeRaw`
          UPDATE outbox_events 
          SET delivery_status = ${OutboxDeliveryStatus.PROCESSED}, processed = true, processed_at = NOW(), locked_by = NULL, locked_until = NULL 
          WHERE id = ${record.id}
        `;
      } catch (err: any) {
        logger.error(
          { action: 'outbox_relay_failed', eventId: record.id, error: err.message },
          'Failed to relay event',
        );
        const errCount = (rawRecord.error_count || 0) + 1;
        if (errCount >= 3) {
          await persistDeadLetter(record, err.message, errCount);
        } else {
          // Exponential backoff
          const backoffDelay = Math.pow(2, errCount) * 1000 + Math.random() * 1000;
          await prisma.$executeRaw`
            UPDATE outbox_events 
            SET delivery_status = 'RETRYABLE_FAILED', 
                last_error = ${err.message}, 
                error_count = ${errCount}, 
                next_retry_at = NOW() + (${backoffDelay} || ' milliseconds')::interval,
                locked_by = NULL, locked_until = NULL 
            WHERE id = ${record.id}
          `;
        }
      }
    }
  } catch (error: any) {
    logger.error({ action: 'outbox_poll_failed', error: error.message }, 'Error polling outbox');
  }
}

async function start() {
  logger.info('Unified Outbox Relay Started (Phase 0B)');
  await processOutbox();
  setInterval(processOutbox, 2000);
}

// Don't auto-start in test environment
if (process.env.NODE_ENV !== 'test') {
  start();
}

export { processOutbox, dispatchOutboxEvent, persistDeadLetter };
