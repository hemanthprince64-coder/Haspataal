/**
 * Phase 0A — Canonical Event Envelope (backward-compatible foundation).
 *
 * This module is ADDITIVE and intentionally permissive. It does NOT modify the
 * existing strict PlatformEvent / PlatformCommand schemas in `./envelopes.ts`.
 *
 * Design decisions (see PHASE_0A_OPENSPEC.md):
 *  - OutboxEvent.id IS the canonical eventId (no second UUID column).
 *  - Legacy producers writing { eventType, payload } keep working.
 *  - Structured columns (when present) take precedence; otherwise we fall back
 *    to known legacy payload fields; otherwise we preserve unknown/null state
 *    and NEVER fabricate hospital / actor / aggregate identity.
 *  - The raw `payload` is preserved untouched (never rewritten).
 */
import { z } from 'zod';

export declare const ScopeType: {
  readonly PLATFORM: 'PLATFORM';
  readonly HOSPITAL: 'HOSPITAL';
};
export type ScopeType = (typeof ScopeType)[keyof typeof ScopeType];
/**
 * Actor types support both human and system actors. System-generated events
 * may omit `actorId` (no human identity required).
 */
export declare const ActorType: {
  readonly PATIENT: 'PATIENT';
  readonly DOCTOR: 'DOCTOR';
  readonly NURSE: 'NURSE';
  readonly ADMIN: 'ADMIN';
  readonly USER: 'USER';
  readonly SYSTEM: 'SYSTEM';
  readonly HOSPITAL_SYSTEM: 'HOSPITAL_SYSTEM';
  readonly PLATFORM_SYSTEM: 'PLATFORM_SYSTEM';
  readonly WORKER: 'WORKER';
};
export type ActorType = (typeof ActorType)[keyof typeof ActorType];
/**
 * Explicit delivery status foundation (Phase 0A). The relay currently only
 * marks PROCESSED / DEAD_LETTERED; full claim/lease/retry semantics are 0B.
 * A single Boolean `processed` is NOT sufficient to express these states.
 */
export declare const OutboxDeliveryStatus: {
  readonly PENDING: 'PENDING';
  readonly PROCESSING: 'PROCESSING';
  readonly PROCESSED: 'PROCESSED';
  readonly RETRYABLE_FAILED: 'RETRYABLE_FAILED';
  readonly DEAD_LETTERED: 'DEAD_LETTERED';
};
export type OutboxDeliveryStatus = (typeof OutboxDeliveryStatus)[keyof typeof OutboxDeliveryStatus];
export interface RawOutboxRecord {
  id: string;
  eventType: string;
  payload?: unknown;
  eventVersion?: number | null;
  aggregateType?: string | null;
  aggregateId?: string | null;
  scopeType?: string | null;
  hospitalId?: string | null;
  tenantId?: string | null;
  actorId?: string | null;
  actorType?: string | null;
  actorRole?: string | null;
  correlationId?: string | null;
  causationId?: string | null;
  depth?: number | null;
  occurredAt?: string | Date | null;
  deliveryStatus?: string | null;
}
export interface CanonicalEventEnvelope {
  /** Stable event identity. Equals OutboxEvent.id. */
  eventId: string;
  eventType: string;
  eventVersion: number;
  aggregate: {
    aggregateType: string | null;
    aggregateId: string | null;
  };
  scope: {
    scopeType: ScopeType | null;
    hospitalId: string | null;
    tenantId: string | null;
  };
  actor: {
    actorId: string | null;
    actorType: ActorType | null;
    role: string | null;
  };
  chain: {
    correlationId: string | null;
    causationId: string | null;
    depth: number;
  };
  /** Occurrence time, distinct from row insertion time. Null when unknown. */
  occurredAt: Date | null;
  /** Original payload, preserved verbatim. */
  payload: unknown;
  /** True when structured columns were absent and metadata came from legacy payload. */
  normalizedFromLegacy: boolean;
}
export declare const canonicalEventEnvelopeSchema: z.ZodObject<
  {
    eventId: z.ZodString;
    eventType: z.ZodString;
    eventVersion: z.ZodNumber;
    aggregate: z.ZodObject<
      {
        aggregateType: z.ZodNullable<z.ZodString>;
        aggregateId: z.ZodNullable<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        aggregateType: string | null;
        aggregateId: string | null;
      },
      {
        aggregateType: string | null;
        aggregateId: string | null;
      }
    >;
    scope: z.ZodObject<
      {
        scopeType: z.ZodNullable<z.ZodEnum<['PLATFORM', 'HOSPITAL']>>;
        hospitalId: z.ZodNullable<z.ZodString>;
        tenantId: z.ZodNullable<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        hospitalId: string | null;
        scopeType: 'HOSPITAL' | 'PLATFORM' | null;
        tenantId: string | null;
      },
      {
        hospitalId: string | null;
        scopeType: 'HOSPITAL' | 'PLATFORM' | null;
        tenantId: string | null;
      }
    >;
    actor: z.ZodObject<
      {
        actorId: z.ZodNullable<z.ZodString>;
        actorType: z.ZodNullable<
          z.ZodEnum<
            [
              'PATIENT',
              'DOCTOR',
              'NURSE',
              'ADMIN',
              'USER',
              'SYSTEM',
              'HOSPITAL_SYSTEM',
              'PLATFORM_SYSTEM',
              'WORKER',
            ]
          >
        >;
        role: z.ZodNullable<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        actorId: string | null;
        actorType:
          | 'SYSTEM'
          | 'USER'
          | 'PATIENT'
          | 'DOCTOR'
          | 'NURSE'
          | 'ADMIN'
          | 'HOSPITAL_SYSTEM'
          | 'PLATFORM_SYSTEM'
          | 'WORKER'
          | null;
        role: string | null;
      },
      {
        actorId: string | null;
        actorType:
          | 'SYSTEM'
          | 'USER'
          | 'PATIENT'
          | 'DOCTOR'
          | 'NURSE'
          | 'ADMIN'
          | 'HOSPITAL_SYSTEM'
          | 'PLATFORM_SYSTEM'
          | 'WORKER'
          | null;
        role: string | null;
      }
    >;
    chain: z.ZodObject<
      {
        correlationId: z.ZodNullable<z.ZodString>;
        causationId: z.ZodNullable<z.ZodString>;
        depth: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        correlationId: string | null;
        causationId: string | null;
        depth: number;
      },
      {
        correlationId: string | null;
        causationId: string | null;
        depth: number;
      }
    >;
    occurredAt: z.ZodNullable<z.ZodDate>;
    payload: z.ZodUnknown;
    normalizedFromLegacy: z.ZodBoolean;
  },
  'strip',
  z.ZodTypeAny,
  {
    eventId: string;
    eventVersion: number;
    occurredAt: Date | null;
    eventType: string;
    aggregate: {
      aggregateType: string | null;
      aggregateId: string | null;
    };
    scope: {
      hospitalId: string | null;
      scopeType: 'HOSPITAL' | 'PLATFORM' | null;
      tenantId: string | null;
    };
    actor: {
      actorId: string | null;
      actorType:
        | 'SYSTEM'
        | 'USER'
        | 'PATIENT'
        | 'DOCTOR'
        | 'NURSE'
        | 'ADMIN'
        | 'HOSPITAL_SYSTEM'
        | 'PLATFORM_SYSTEM'
        | 'WORKER'
        | null;
      role: string | null;
    };
    chain: {
      correlationId: string | null;
      causationId: string | null;
      depth: number;
    };
    normalizedFromLegacy: boolean;
    payload?: unknown;
  },
  {
    eventId: string;
    eventVersion: number;
    occurredAt: Date | null;
    eventType: string;
    aggregate: {
      aggregateType: string | null;
      aggregateId: string | null;
    };
    scope: {
      hospitalId: string | null;
      scopeType: 'HOSPITAL' | 'PLATFORM' | null;
      tenantId: string | null;
    };
    actor: {
      actorId: string | null;
      actorType:
        | 'SYSTEM'
        | 'USER'
        | 'PATIENT'
        | 'DOCTOR'
        | 'NURSE'
        | 'ADMIN'
        | 'HOSPITAL_SYSTEM'
        | 'PLATFORM_SYSTEM'
        | 'WORKER'
        | null;
      role: string | null;
    };
    chain: {
      correlationId: string | null;
      causationId: string | null;
      depth: number;
    };
    normalizedFromLegacy: boolean;
    payload?: unknown;
  }
>;
/**
 * Normalize a raw outbox row into a CanonicalEventEnvelope.
 *
 * Precedence: structured column > known legacy payload field > unknown/null.
 * Never invents hospital / actor / aggregate identity.
 */
export declare function normalizeLegacyOutbox(record: RawOutboxRecord): CanonicalEventEnvelope;
/**
 * Build a canonical outbox row object for NEW producers that want to supply
 * structured metadata directly. The raw `payload` is preserved as-is.
 */
export interface BuildCanonicalOutboxInput {
  eventId: string;
  eventType: string;
  payload: unknown;
  eventVersion?: number;
  aggregateType?: string | null;
  aggregateId?: string | null;
  scopeType?: ScopeType | null;
  hospitalId?: string | null;
  tenantId?: string | null;
  actorId?: string | null;
  actorType?: ActorType | null;
  actorRole?: string | null;
  correlationId?: string | null;
  causationId?: string | null;
  depth?: number;
  occurredAt?: string | Date | null;
  deliveryStatus?: OutboxDeliveryStatus | null;
}
export declare function buildCanonicalOutbox(input: BuildCanonicalOutboxInput): RawOutboxRecord;
export interface ProcessedEventRecord {
  consumerName: string;
  eventId: string;
  processedAt: Date;
}
/**
 * Consumer-processing idempotency is SEPARATE from Outbox row uniqueness.
 * This interface defines the contract; a durable Postgres-backed ledger is
 * implemented in Phase 0B. A reference in-memory ledger is provided for tests.
 */
export interface IdempotencyLedger {
  markProcessed(consumerName: string, eventId: string): Promise<void>;
  isProcessed(consumerName: string, eventId: string): Promise<boolean>;
}
export declare class InMemoryIdempotencyLedger implements IdempotencyLedger {
  private readonly store;
  private key;
  markProcessed(consumerName: string, eventId: string): Promise<void>;
  isProcessed(consumerName: string, eventId: string): Promise<boolean>;
}
//# sourceMappingURL=outbox.d.ts.map
