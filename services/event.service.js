'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.EventService = void 0;
const crypto_1 = require('crypto');
const pg_1 = require('pg');
const db_1 = require('@haspataal/db');
const redis_1 = __importDefault(require('../lib/redis'));
// Assuming global instances or injected dependencies.
// In a real app, these would be initialized elsewhere and injected.
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
class EventService {
  /**
   * Generates a deterministic idempotency key.
   * Format: hash(hospital_id + event_type + resource_id + day_string)
   */
  static generateIdempotencyKey(hospitalId, eventType, resourceId) {
    const day = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const raw = `${hospitalId}:${eventType}:${resourceId}:${day}`;
    return (0, crypto_1.createHash)('sha256').update(raw).digest('hex');
  }
  static processedKeys = new Set();
  /**
   * Publishes an event to the EventLog (PostgreSQL) and Redis Stream.
   * Implements strict idempotency.
   */
  static async publish(eventType, payload, hospitalId, patientId = null, resourceId = 'global') {
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
        await db_1.prisma.eventLog.create({
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
      // 1. Write to Single Source of Truth (EventLog) with Idempotency
      const result = await client.query(
        `
        INSERT INTO "EventLog" (hospital_id, patient_id, event_type, metadata, idempotency_key)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING *;
        `,
        [hospitalId, patientId, eventType, JSON.stringify(payload), idempotencyKey],
      );
      // If no rows were returned, it was a duplicate event
      if (result.rowCount === 0) {
        console.log(`[EventService] Skipped duplicate event: ${eventType} (${idempotencyKey})`);
        return true; // Still return success to the caller (idempotency)
      }
      const eventRecord = result.rows[0];
      // 2. Publish to Redis Stream for Async Processing
      if (redis_1.default) {
        const streamKey = `events:${eventType}`;
        // ioredis xadd: XADD key ID field value [field value ...]
        await redis_1.default.xadd(
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
  static async subscribe(eventType, consumerGroup, consumerName, handler) {
    const streamKey = `events:${eventType}`;
    // Ensure consumer group exists (ioredis: XGROUP CREATE key group id [MKSTREAM])
    if (redis_1.default) {
      try {
        await redis_1.default.xgroup('CREATE', streamKey, consumerGroup, '0', 'MKSTREAM');
      } catch (error) {
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
      if (!redis_1.default) break;
      try {
        // ioredis xreadgroup: XREADGROUP GROUP group consumer [COUNT n] [BLOCK ms] STREAMS key id
        const response = await redis_1.default.xreadgroup(
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
        );
        if (response) {
          for (const [, messages] of response) {
            for (const [msgId, fields] of messages) {
              // ioredis returns flat [field, value, field, value] array
              const payloadIdx = fields.indexOf('payload');
              const eventPayload = payloadIdx !== -1 ? JSON.parse(fields[payloadIdx + 1]) : {};
              // Process event
              await handler(eventPayload);
              // Acknowledge message
              await redis_1.default.xack(streamKey, consumerGroup, msgId);
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
exports.EventService = EventService;
