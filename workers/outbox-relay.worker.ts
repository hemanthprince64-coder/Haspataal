import { PrismaClient } from '@prisma/client';
import { eventBus } from '@haspataal/events';
import { TimelineCommandHandler } from '@haspataal/timeline';
import { RuleCommandHandler } from '@haspataal/rules';
import { NotificationCommandHandler } from '@haspataal/notify';
import { SearchService, PostgresSearchProvider, SearchCommandHandler } from '@haspataal/search';
import logger from '../apps/patient-portal/lib/logger';

const prisma = new PrismaClient();
const timelineHandler = new TimelineCommandHandler();
const notificationHandler = new NotificationCommandHandler();
const searchHandler = new SearchCommandHandler(new SearchService(new PostgresSearchProvider()));

function parsePayload(raw: unknown): any {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

function domainPayload(payload: any) {
  return payload; // Preserve the full envelope end-to-end
}

function tenantHospitalId(payload: any) {
  return payload?.tenantContext?.hospitalId ?? payload?.tenantScope?.hospitalId ?? payload?.hospitalId ?? payload?.metadata?.tenantId;
}

function actorId(payload: any) {
  return payload?.actorContext?.actorId ?? payload?.actorReference?.actorId ?? payload?.actorId;
}

async function dispatchOutboxEvent(record: { id: string; eventType: string; payload: any }) {
  const payload = parsePayload(record.payload);

  switch (record.eventType) {
    case 'ADD_TO_TIMELINE_COMMAND':
      await timelineHandler.handleAddToTimeline(payload);
      return;
    case 'EVALUATE_RULE_COMMAND':
      await RuleCommandHandler.handleExecuteRule(payload);
      return;
    case 'SEND_NOTIFICATION_COMMAND':
      await notificationHandler.handleSendNotification(payload);
      return;
    case 'INDEX_DOCUMENT_COMMAND':
      await searchHandler.handleIndexDocument(payload);
      return;
    case 'DELETE_DOCUMENT_COMMAND':
      await searchHandler.handleDeleteDocument(payload);
      return;
    default:
      await eventBus.publish({
        id: payload?.eventId ?? record.id,
        type: payload?.eventName ?? record.eventType,
        payload: domainPayload(payload),
        timestamp: payload?.occurredAt ? new Date(payload.occurredAt) : new Date(),
        correlationId: payload?.correlationId,
        sourceSystem: payload?.producer ?? payload?.sourceSystem ?? 'haspataal-outbox',
        hospitalId: tenantHospitalId(payload),
        actorId: actorId(payload),
        actorType: payload?.actorContext?.actorType ?? payload?.actorReference?.actorType,
      });
  }
}

async function processOutbox() {
  const BATCH_SIZE = 100;

  try {
    const events = await prisma.$transaction(async (tx) => {
      return tx.$queryRaw<any[]>`
        SELECT id, event_type as "eventType", payload, error_count as "errorCount"
        FROM outbox_events
        WHERE processed = false AND (error_count < 3 OR error_count IS NULL)
        ORDER BY created_at ASC
        LIMIT ${BATCH_SIZE}
        FOR UPDATE SKIP LOCKED
      `;
    }, { timeout: 15000 });

    if (!events || events.length === 0) return;

    for (const record of events) {
      try {
        await dispatchOutboxEvent(record);

        await prisma.outboxEvent.update({
          where: { id: record.id },
          data: { processed: true, processedAt: new Date() },
        });
      } catch (err: any) {
        logger.error({ action: 'outbox_relay_failed', eventId: record.id, error: err.message }, 'Failed to relay event');
        await prisma.outboxEvent.update({
          where: { id: record.id },
          data: {
            lastError: err.message,
            errorCount: { increment: 1 },
          },
        });
      }
    }
  } catch (error: any) {
    logger.error({ action: 'outbox_poll_failed', error: error.message }, 'Error polling outbox');
  }
}

async function start() {
  logger.info('Unified Outbox Relay Started');
  await processOutbox();
  setInterval(processOutbox, 2000);
}

start();