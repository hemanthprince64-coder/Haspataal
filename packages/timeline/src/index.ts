// ─────────────────────────────────────────────────────────────
// PUBLISHER
// ─────────────────────────────────────────────────────────────
import { prisma } from '@haspataal/db';
import { DomainEvent, EventBus } from '@haspataal/events';
import IORedis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// EVENT TYPE ENUM
// ─────────────────────────────────────────────────────────────

export const TimelineEventType = {
  // Appointments
  APPOINTMENT_CREATED: 'APPOINTMENT_CREATED',
  APPOINTMENT_COMPLETED: 'APPOINTMENT_COMPLETED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
  // Consultation
  CONSULTATION_STARTED: 'CONSULTATION_STARTED',
  CONSULTATION_COMPLETED: 'CONSULTATION_COMPLETED',
  // Clinical
  DIAGNOSIS_ADDED: 'DIAGNOSIS_ADDED',
  VITALS_RECORDED: 'VITALS_RECORDED',
  CLINICAL_NOTE_ADDED: 'CLINICAL_NOTE_ADDED',
  // Prescriptions
  PRESCRIPTION_CREATED: 'PRESCRIPTION_CREATED',
  DRUG_DISPENSED: 'DRUG_DISPENSED',
  // Lab
  LAB_ORDERED: 'LAB_ORDERED',
  LAB_ORDER_ACCEPTED: 'LAB_ORDER_ACCEPTED',
  SAMPLE_COLLECTED: 'SAMPLE_COLLECTED',
  SAMPLE_REJECTED: 'SAMPLE_REJECTED',
  RESULT_ENTERED: 'RESULT_ENTERED',
  RESULT_VERIFIED: 'RESULT_VERIFIED',
  RESULT_AMENDED: 'RESULT_AMENDED',
  CRITICAL_VALUE_DETECTED: 'CRITICAL_VALUE_DETECTED',
  LAB_COMPLETED: 'LAB_COMPLETED',
  // Radiology
  RADIOLOGY_ORDERED: 'RADIOLOGY_ORDERED',
  RADIOLOGY_COMPLETED: 'RADIOLOGY_COMPLETED',
  // Admission / Discharge
  PATIENT_ADMITTED: 'PATIENT_ADMITTED',
  WARD_TRANSFER: 'WARD_TRANSFER',
  DISCHARGE_COMPLETED: 'DISCHARGE_COMPLETED',
  // Surgery / OT
  SURGERY_SCHEDULED: 'SURGERY_SCHEDULED',
  SURGERY_COMPLETED: 'SURGERY_COMPLETED',
  // ICU
  ICU_ADMITTED: 'ICU_ADMITTED',
  ICU_DISCHARGED: 'ICU_DISCHARGED',
  // Nursing
  NURSING_NOTE_CREATED: 'NURSING_NOTE_CREATED',
  MAR_ADMINISTERED: 'MAR_ADMINISTERED',
  // Billing
  BILLING_COMPLETED: 'BILLING_COMPLETED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  // Insurance
  INSURANCE_VERIFIED: 'INSURANCE_VERIFIED',
  INSURANCE_CLAIMED: 'INSURANCE_CLAIMED',
  // Vaccination
  VACCINATION_GIVEN: 'VACCINATION_GIVEN',
  // Care / Retention
  CARE_JOURNEY_UPDATED: 'CARE_JOURNEY_UPDATED',
  RETENTION_TRIGGERED: 'RETENTION_TRIGGERED',
  FOLLOW_UP_SCHEDULED: 'FOLLOW_UP_SCHEDULED',
  // Admin
  PATIENT_REGISTERED: 'PATIENT_REGISTERED',
  CONSENT_GIVEN: 'CONSENT_GIVEN',
} as const;

export type TimelineEventTypeValue = (typeof TimelineEventType)[keyof typeof TimelineEventType];

export const TimelineCategory = {
  APPOINTMENT: 'APPOINTMENT',
  CONSULTATION: 'CONSULTATION',
  CLINICAL_NOTE: 'CLINICAL_NOTE',
  VITALS: 'VITALS',
  DIAGNOSIS: 'DIAGNOSIS',
  PRESCRIPTION: 'PRESCRIPTION',
  INVESTIGATION: 'INVESTIGATION',
  RADIOLOGY: 'RADIOLOGY',
  PROCEDURE: 'PROCEDURE',
  SURGERY: 'SURGERY',
  ADMISSION: 'ADMISSION',
  DISCHARGE: 'DISCHARGE',
  BILLING: 'BILLING',
  PAYMENT: 'PAYMENT',
  VACCINATION: 'VACCINATION',
  CARE_JOURNEY: 'CARE_JOURNEY',
  INSURANCE: 'INSURANCE',
  ADMINISTRATIVE: 'ADMINISTRATIVE',
  UNKNOWN: 'UNKNOWN',
} as const;

export type TimelineCategoryValue = (typeof TimelineCategory)[keyof typeof TimelineCategory];

export const TimelineSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type TimelineSeverityValue = (typeof TimelineSeverity)[keyof typeof TimelineSeverity];

// ─────────────────────────────────────────────────────────────
// ZOD SCHEMA (validated at publish time)
// ─────────────────────────────────────────────────────────────

export const TimelineEventSchema = z.object({
  // Required
  patientId: z.string().uuid(),
  eventType: z.string(),
  title: z.string().min(1).max(500),
  timestamp: z.custom<Date | string>((val) => val instanceof Date || typeof val === 'string', {
    message: 'Must be a Date object or ISO string',
  }),
  // Optional identity
  hospitalId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  encounterId: z.string().uuid().optional(),
  // Classification
  module: z.string().default('UNKNOWN'),
  category: z.string().default('UNKNOWN'),
  aggregateType: z.string().optional(),
  aggregateId: z.string().optional(),
  // Display
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  clinicalDate: z
    .custom<Date | string>((val) => val instanceof Date || typeof val === 'string', {
      message: 'Must be a Date object or ISO string',
    })
    .optional(),
  priority: z.number().int().min(1).max(10).default(5),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('LOW'),
  tags: z.array(z.string()).default([]),
  // Metadata
  metadata: z.any().optional(),
  schemaVersion: z.number().int().default(1),
  // FHIR
  fhirResourceType: z.string().optional(),
  fhirMapping: z.any().optional(),
  // Traceability (BREAKING: should be provided by all publishers)
  correlationId: z.string().uuid().optional(),
  sourceSystem: z.string().optional(),
  // Actor
  actorType: z.string().optional(),
  actorId: z.string().optional(),
});

export type TimelineEventInput = z.input<typeof TimelineEventSchema>;

export class TimelinePublisher {
  constructor(redisConnection?: IORedis) {
    // Kept for backwards compatibility if anyone passes redis, but no longer used for publishing
  }

  async publish(input: TimelineEventInput): Promise<{ correlationId: string }> {
    // 1. Validate
    const parsed = TimelineEventSchema.parse(input);

    // 2. Auto-generate correlationId if missing
    let correlationId = parsed.correlationId;
    if (!correlationId) {
      correlationId = uuidv4();
      if (process.env.NODE_ENV !== 'test') {
        console.warn(
          `[Timeline] Event published without correlationId (eventType: ${parsed.eventType}, sourceSystem: ${parsed.sourceSystem ?? 'unknown'}). ` +
            `Auto-generated: ${correlationId}. Update your publisher to include correlationId.`,
        );
      }
    }

    // 3. Insert into Outbox instead of BullMQ
    // We use a generic 'system' actor context if none is provided
    await prisma.outboxEvent.create({
      data: {
        id: uuidv4(),
        eventType: 'ADD_TO_TIMELINE_COMMAND',
        payload: {
          commandId: uuidv4(),
          commandVersion: 1,
          target: 'timeline',
          tenantContext: { hospitalId: parsed.hospitalId || 'system', branchId: 'default' },
          actorContext: {
            actorId: parsed.actorId || 'system',
            actorType: parsed.actorType || 'SYSTEM',
          },
          correlationId,
          idempotencyKey: `timeline-publish-${correlationId}`,
          timestamp: new Date().toISOString(),
          payload: parsed,
        },
        processed: false,
      },
    });

    return { correlationId };
  }

  async publishStandardEvent(event: Omit<DomainEvent, 'id'>): Promise<{ correlationId: string }> {
    const fullEvent: DomainEvent = {
      ...event,
      id: uuidv4(),
    };

    // 1. Dual-write to EventBus so downstream modules (Billing, Notification) receive the DomainEvent
    await EventBus.getInstance().publish(fullEvent);

    // 2. Write to Outbox for the timeline view model
    return this.publish({
      patientId: event.patientId || '',
      hospitalId: event.hospitalId,
      encounterId: event.encounterId,
      eventType: event.type,
      title: event.type.replace(/_/g, ' '),
      timestamp: event.occurredAt,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      schemaVersion: event.version,
      actorId: event.actor?.id,
      actorType: event.actor?.type,
      correlationId: event.correlationId,
      sourceSystem: event.causationId,
      metadata: {
        ...event.payload,
        actorName: event.actor?.name,
        actorRole: event.actor?.role,
      },
    });
  }

  async close(): Promise<void> {
    // No-op for backwards compatibility
  }
}

// ─────────────────────────────────────────────────────────────
// SINGLETON (for use in Next.js App Router / server actions)
// ─────────────────────────────────────────────────────────────

let _publisher: TimelinePublisher | undefined;

export function getTimelinePublisher(): TimelinePublisher {
  if (!_publisher) {
    _publisher = new TimelinePublisher();
  }
  return _publisher;
}

export * from './queries';
export * from './mutations';

export * from './timeline.consumer';
