/**
 * Event Emitter — writes to EventLog via Prisma.
 * This is the SINGLE function every write operation calls.
 * No Redis dependency — works immediately with just PostgreSQL.
 */

import prisma from '../apps/patient-portal/lib/prisma';
import logger from '../apps/patient-portal/lib/logger';

export type EventType =
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_COMPLETED'
  | 'PATIENT_REGISTERED'
  | 'PATIENT_UPDATED'
  | 'HOSPITAL_REGISTERED'
  | 'HOSPITAL_APPROVED'
  | 'VISIT_CREATED'
  | 'VISIT_COMPLETED'
  | 'BILL_CREATED'
  | 'BILL_PAID'
  | 'PRESCRIPTION_ISSUED'
  | 'LAB_ORDER_CREATED'
  | 'LAB_RESULT_UPLOADED'
  | 'AGENT_COMMISSION_EARNED'
  | 'ANC_VISIT_RECORDED'
  | 'ANC_HIGH_RISK_FLAGGED'
  | 'RETENTION_ALERT_TRIGGERED'
  | 'SYNC_REPLAY_APPLIED'
  | 'SETTLEMENT_CALCULATED'
  | 'DATA_MIGRATION_QUEUED';

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
        payload: input.payload as any,
      },
    });
    logger.info(
      { action: 'event_emitted', eventType: input.eventType, hospitalId: input.hospitalId },
      `Event: ${input.eventType}`,
    );
  } catch (err: any) {
    // Fire-and-forget: log but never crash the caller
    logger.error(
      { action: 'event_emit_failed', eventType: input.eventType, error: err.message },
      `Failed to emit event: ${input.eventType}`,
    );
  }
}
