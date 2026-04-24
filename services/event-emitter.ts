/**
 * Event Emitter — writes to EventLog via Prisma.
 * This is the SINGLE function every write operation calls.
 * No Redis dependency — works immediately with just PostgreSQL.
 */

import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import type { EventType } from '@/types/events';

interface EmitEventInput {
    eventType: EventType;
    hospitalId?: string | null;
    patientId?: string | null;
    executedBy?: string | null;
    payload: Record<string, any>;
}

/**
 * Emit an event to the EventLog table.
 * Fire-and-forget: never throws, never blocks the caller.
 */
export async function emitEvent(input: EmitEventInput): Promise<void> {
    try {
        await prisma.eventLog.create({
            data: {
                eventType: input.eventType,
                hospitalId: input.hospitalId || null,
                patientId: input.patientId || null,
                executedBy: input.executedBy || null,
                payload: input.payload,
            },
        });
        logger.info(
            { action: 'event_emitted', eventType: input.eventType, hospitalId: input.hospitalId },
            `Event: ${input.eventType}`
        );
    } catch (err: any) {
        // Fire-and-forget: log but never crash the caller
        logger.error(
            { action: 'event_emit_failed', eventType: input.eventType, error: err.message },
            `Failed to emit event: ${input.eventType}`
        );
    }
}
