import { createHash } from 'crypto';
import { Pool } from 'pg';
import { createClient } from 'redis';
import { EventType, CreateEventInput } from '../types/events';

// Assuming global instances or injected dependencies.
// In a real app, these would be initialized elsewhere and injected.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = createClient({ url: process.env.REDIS_URL });

export class EventService {
  /**
   * Generates a deterministic idempotency key.
   * Format: hash(hospital_id + event_type + resource_id + day_string)
   */
  private static generateIdempotencyKey(
    hospitalId: string,
    eventType: string,
    resourceId: string
  ): string {
    const day = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const raw = `${hospitalId}:${eventType}:${resourceId}:${day}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Publishes an event to the EventLog (PostgreSQL) and Redis Stream.
   * Implements strict idempotency.
   */
  public static async publish(
    eventType: EventType,
    payload: Record<string, any>,
    hospitalId: string,
    patientId: string | null = null,
    resourceId: string = 'global' // defaults to 'global' if no specific resource
  ): Promise<boolean> {
    const idempotencyKey = this.generateIdempotencyKey(hospitalId, eventType, resourceId);

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
        [hospitalId, patientId, eventType, JSON.stringify(payload), idempotencyKey]
      );

      // If no rows were returned, it was a duplicate event
      if (result.rowCount === 0) {
        console.log(`[EventService] Skipped duplicate event: ${eventType} (${idempotencyKey})`);
        return true; // Still return success to the caller (idempotency)
      }

      const eventRecord = result.rows[0];

      // 2. Publish to Redis Stream for Async Processing
      const streamKey = `events:${eventType}`;
      if (!redis.isOpen) await redis.connect();
      
      await redis.xAdd(streamKey, '*', {
        event_id: eventRecord.id,
        hospital_id: eventRecord.hospital_id,
        payload: JSON.stringify(eventRecord)
      });

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
    handler: (event: any) => Promise<void>
  ) {
    const streamKey = `events:${eventType}`;
    
    if (!redis.isOpen) await redis.connect();

    // Ensure consumer group exists
    try {
      await redis.xGroupCreate(streamKey, consumerGroup, '0', { MKSTREAM: true });
    } catch (error: any) {
      if (!error.message.includes('BUSYGROUP')) {
        throw error;
      }
    }

    // Polling loop
    while (true) {
      try {
        const response = await redis.xReadGroup(
          consumerGroup,
          consumerName,
          [
            {
              key: streamKey,
              id: '>',
            }
          ],
          {
            COUNT: 10,
            BLOCK: 5000,
          }
        );

        if (response) {
          for (const stream of (response as any[])) {
            for (const message of stream.messages) {
              const eventPayload = JSON.parse(message.message.payload as string);
              
              // Process event
              await handler(eventPayload);

              // Acknowledge message processing
              await redis.xAck(streamKey, consumerGroup, message.id);
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
