import { prisma } from '@haspataal/db';
import { createHash } from 'crypto';
import { Pool } from 'pg';

import redis from '../lib/redis';

type EventType = string;

// Assuming global instances or injected dependencies.
// In a real app, these would be initialized elsewhere and injected.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Phase 0A EventLog repair: targets the real `event_logs` table (Prisma @@map).
// `idempotency_key` has a partial unique index (WHERE idempotency_key IS NOT NULL),
// so ON CONFLICT DO NOTHING is safe even though not every row supplies a key.
// Exported for unit testing the repair without a live database.
export const EVENT_LOG_INSERT_SQL = `
  INSERT INTO event_logs (hospital_id, patient_id, event_type, metadata, idempotency_key)
  VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING *;
`;

export class EventService {
  /**
   * Generates a deterministic idempotency key.
   * Format: hash(hospital_id + event_type + resource_id + day_string)
   */
  private static generateIdempotencyKey(
    hospitalId: string,
    eventType: string,
    resourceId: string,
  ): string {
    const day = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const raw = `${hospitalId}:${eventType}:${resourceId}:${day}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  private static processedKeys = new Set<string>();

  /**
   * Publishes an event to the EventLog (PostgreSQL) and Redis Stream.
   * Implements strict idempotency.
   */
  public static async publish(
    eventType: EventType,
    payload: Record<string, any>,
    hospitalId: string,
    patientId: string | null = null,
    resourceId: string = 'global', // defaults to 'global' if no specific resource
  ): Promise<boolean> {
    const idempotencyKey = this.generateIdempotencyKey(hospitalId, eventType, resourceId);
    const isSqlite = process.env.DATABASE_PROVIDER === 'sqlite';

    if (isSqlite) {
      if (this.processedKeys.has(idempotencyKey)) {
        console.log(`[EventService] Skipped duplicate event: ${eventType} (${idempotencyKey})`);
        return true;
      }
      this.processedKeys.add(idempotencyKey);

      // Keep in-memory cache pruned
      if (this.processedKeys.size > 1000) {
        const iterator = this.processedKeys.values();
        for (let i = 0; i < 200; i++) {
          const val = iterator.next().value;
          if (val) this.processedKeys.delete(val);
        }
      }

      try {
        await prisma.eventLog.create({
          data: {
            eventType,
            payload: payload || {},
            hospitalId,
            patientId,
          },
        });
      } catch (err) {
        console.error('[EventService] SQLite event log create failed:', err);
      }
      return true;
    }

    const client = await pool.connect();
    try {
      // 1. Write to Single Source of Truth (event_logs) with Idempotency.
      // Phase 0A repair: table is `event_logs` (not "EventLog"); the schema now
      // provides `idempotency_key` (partial unique) and `metadata` (jsonb) columns.
      const result = await client.query(EVENT_LOG_INSERT_SQL, [
        hospitalId,
        patientId,
        eventType,
        JSON.stringify(payload),
        idempotencyKey,
      ]);

      // If no rows were returned, it was a duplicate event
      if (result.rowCount === 0) {
        console.log(`[EventService] Skipped duplicate event: ${eventType} (${idempotencyKey})`);
        return true; // Still return success to the caller (idempotency)
      }

      const eventRecord = result.rows[0];

      // 2. Publish to Redis Stream for Async Processing
      if (redis) {
        const streamKey = `events:${eventType}`;
        // ioredis xadd: XADD key ID field value [field value ...]
        await redis.xadd(
          streamKey,
          '*',
          'event_id',
          eventRecord.id,
          'hospital_id',
          eventRecord.hospital_id,
          'payload',
          JSON.stringify(eventRecord),
        );
      } else {
        console.warn(`[EventService] Redis unavailable, skipped stream publish for: ${eventType}`);
      }

      return true;
    } catch (error) {
      console.error(`[EventService] Failed to publish event: ${eventType}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Subscribes to an event stream using Redis Consumer Groups.
   * Provides at-least-once delivery for retry-safe consumers.
   */
  public static async subscribe(
    eventType: EventType,
    consumerGroup: string,
    consumerName: string,
    handler: (event: any) => Promise<void>,
  ) {
    const streamKey = `events:${eventType}`;

    // Ensure consumer group exists (ioredis: XGROUP CREATE key group id [MKSTREAM])
    if (redis) {
      try {
        await redis.xgroup('CREATE', streamKey, consumerGroup, '0', 'MKSTREAM');
      } catch (error: any) {
        if (!error.message.includes('BUSYGROUP')) {
          throw error;
        }
      }
    } else {
      console.warn(`[EventService] Redis unavailable, cannot subscribe to: ${eventType}`);
      return;
    }

    // Polling loop
    while (true) {
      if (!redis) break;
      try {
        // ioredis xreadgroup: XREADGROUP GROUP group consumer [COUNT n] [BLOCK ms] STREAMS key id
        const response = (await redis.xreadgroup(
          'GROUP',
          consumerGroup,
          consumerName,
          'COUNT',
          '10',
          'BLOCK',
          '5000',
          'STREAMS',
          streamKey,
          '>',
        )) as any[] | null;

        if (response) {
          for (const [, messages] of response) {
            for (const [msgId, fields] of messages) {
              // ioredis returns flat [field, value, field, value] array
              const payloadIdx = fields.indexOf('payload');
              const eventPayload = payloadIdx !== -1 ? JSON.parse(fields[payloadIdx + 1]) : {};

              // Process event
              await handler(eventPayload);

              // Acknowledge message
              await redis.xack(streamKey, consumerGroup, msgId);
            }
          }
        }
      } catch (error) {
        console.error(`[EventService] Consumer error (${consumerGroup}):`, error);
        // Wait before retrying
        await new Promise((res) => setTimeout(res, 3000));
      }
    }
  }
}
