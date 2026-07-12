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

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const ScopeType = {
  PLATFORM: 'PLATFORM',
  HOSPITAL: 'HOSPITAL',
} as const;
export type ScopeType = (typeof ScopeType)[keyof typeof ScopeType];

/**
 * Actor types support both human and system actors. System-generated events
 * may omit `actorId` (no human identity required).
 */
export const ActorType = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  ADMIN: 'ADMIN',
  USER: 'USER',
  SYSTEM: 'SYSTEM',
  HOSPITAL_SYSTEM: 'HOSPITAL_SYSTEM',
  PLATFORM_SYSTEM: 'PLATFORM_SYSTEM',
  WORKER: 'WORKER',
} as const;
export type ActorType = (typeof ActorType)[keyof typeof ActorType];

/**
 * Explicit delivery status foundation (Phase 0A). The relay currently only
 * marks PROCESSED / DEAD_LETTERED; full claim/lease/retry semantics are 0B.
 * A single Boolean `processed` is NOT sufficient to express these states.
 */
export const OutboxDeliveryStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PROCESSED: 'PROCESSED',
  RETRYABLE_FAILED: 'RETRYABLE_FAILED',
  DEAD_LETTERED: 'DEAD_LETTERED',
} as const;
export type OutboxDeliveryStatus = (typeof OutboxDeliveryStatus)[keyof typeof OutboxDeliveryStatus];

// ---------------------------------------------------------------------------
// Raw shape: what a producer writes / what we read from the outbox_events row
// ---------------------------------------------------------------------------

export interface RawOutboxRecord {
  id: string;
  eventType: string;
  payload?: unknown;
  // Structured columns (nullable; absent for pre-migration rows).
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

// ---------------------------------------------------------------------------
// Canonical envelope
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Zod (v3) schemas — permissive, used for optional validation in tests/producers
// ---------------------------------------------------------------------------

const scopeTypeSchema = z.enum(['PLATFORM', 'HOSPITAL']);
const actorTypeSchema = z.enum([
  'PATIENT',
  'DOCTOR',
  'NURSE',
  'ADMIN',
  'USER',
  'SYSTEM',
  'HOSPITAL_SYSTEM',
  'PLATFORM_SYSTEM',
  'WORKER',
]);

export const canonicalEventEnvelopeSchema = z.object({
  eventId: z.string(),
  eventType: z.string(),
  eventVersion: z.number().int().nonnegative(),
  aggregate: z.object({ aggregateType: z.string().nullable(), aggregateId: z.string().nullable() }),
  scope: z.object({
    scopeType: scopeTypeSchema.nullable(),
    hospitalId: z.string().nullable(),
    tenantId: z.string().nullable(),
  }),
  actor: z.object({
    actorId: z.string().nullable(),
    actorType: actorTypeSchema.nullable(),
    role: z.string().nullable(),
  }),
  chain: z.object({
    correlationId: z.string().nullable(),
    causationId: z.string().nullable(),
    depth: z.number().int().nonnegative(),
  }),
  occurredAt: z.coerce.date().nullable(),
  payload: z.unknown(),
  normalizedFromLegacy: z.boolean(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function firstPresent<T>(...values: (T | null | undefined)[]): T | null {
  for (const v of values) {
    if (v !== null && v !== undefined) return v as T;
  }
  return null;
}

/** Does this raw record carry any canonical structured-column metadata? */
function hasStructuredMetadata(record: RawOutboxRecord): boolean {
  return Boolean(
    record.eventVersion != null ||
    record.aggregateType != null ||
    record.aggregateId != null ||
    record.scopeType != null ||
    record.hospitalId != null ||
    record.tenantId != null ||
    record.actorId != null ||
    record.actorType != null ||
    record.actorRole != null ||
    record.correlationId != null ||
    record.causationId != null ||
    record.depth != null ||
    record.occurredAt != null,
  );
}

/**
 * Normalize a raw outbox row into a CanonicalEventEnvelope.
 *
 * Precedence: structured column > known legacy payload field > unknown/null.
 * Never invents hospital / actor / aggregate identity.
 */
export function normalizeLegacyOutbox(record: RawOutboxRecord): CanonicalEventEnvelope {
  const payload = (record.payload ?? {}) as Record<string, any>;
  const p = payload as any;

  const eventVersion = firstPresent<number>(record.eventVersion, p.eventVersion, 1) ?? 1;

  const aggregateType = firstPresent<string>(
    record.aggregateType,
    p.aggregateType,
    p.aggregate?.aggregateType,
  );
  const aggregateId = firstPresent<string>(
    record.aggregateId,
    p.aggregateId,
    p.aggregate?.aggregateId,
  );

  // scopeType: prefer structured; else infer HOSPITAL when a hospital id is present;
  // never infer a hospitalId that was not supplied.
  const structuredScope = record.scopeType ?? null;
  const inferredScope: ScopeType | null = structuredScope
    ? (structuredScope as ScopeType)
    : (firstPresent<string>(
        p.scopeType,
        p.scope?.scopeType,
        p.tenantContext?.hospitalId ? 'HOSPITAL' : null,
        p.tenantScope?.hospitalId ? 'HOSPITAL' : null,
        record.hospitalId ? 'HOSPITAL' : null,
        p.hospitalId ? 'HOSPITAL' : null,
      ) as ScopeType | null);

  const hospitalId = firstPresent<string>(
    record.hospitalId,
    p.hospitalId,
    p.tenantContext?.hospitalId,
    p.tenantScope?.hospitalId,
  );
  const tenantId = firstPresent<string>(record.tenantId, p.tenantId, p.tenantContext?.tenantId);

  const actorId = firstPresent<string>(
    record.actorId,
    p.actorId,
    p.actorContext?.actorId,
    p.actorReference?.actorId,
  );
  const actorType = firstPresent<string>(
    record.actorType,
    p.actorType,
    p.actorContext?.actorType,
    p.actorReference?.actorType,
  ) as ActorType | null;
  const role = firstPresent<string>(record.actorRole, p.actorRole, p.actorContext?.role);

  const correlationId = firstPresent<string>(record.correlationId, p.correlationId);
  const causationId = firstPresent<string>(record.causationId, p.causationId);
  const depth = firstPresent<number>(record.depth, p.depth, 0) ?? 0;

  const occurredAt = asDate(
    firstPresent<string | Date>(record.occurredAt, p.occurredAt) as
      | string
      | Date
      | null
      | undefined,
  );

  return {
    eventId: record.id,
    eventType: record.eventType,
    eventVersion,
    aggregate: { aggregateType: aggregateType ?? null, aggregateId: aggregateId ?? null },
    scope: { scopeType: inferredScope, hospitalId: hospitalId ?? null, tenantId: tenantId ?? null },
    actor: { actorId: actorId ?? null, actorType: actorType ?? null, role: role ?? null },
    chain: { correlationId: correlationId ?? null, causationId: causationId ?? null, depth },
    occurredAt,
    payload,
    normalizedFromLegacy: !hasStructuredMetadata(record),
  };
}

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

export function buildCanonicalOutbox(input: BuildCanonicalOutboxInput): RawOutboxRecord {
  return {
    id: input.eventId,
    eventType: input.eventType,
    payload: input.payload,
    eventVersion: input.eventVersion ?? 1,
    aggregateType: input.aggregateType ?? null,
    aggregateId: input.aggregateId ?? null,
    scopeType: input.scopeType ?? null,
    hospitalId: input.hospitalId ?? null,
    tenantId: input.tenantId ?? null,
    actorId: input.actorId ?? null,
    actorType: input.actorType ?? null,
    actorRole: input.actorRole ?? null,
    correlationId: input.correlationId ?? null,
    causationId: input.causationId ?? null,
    depth: input.depth ?? 0,
    occurredAt: input.occurredAt ?? undefined,
    deliveryStatus: input.deliveryStatus ?? 'PENDING',
  };
}

// ---------------------------------------------------------------------------
// Phase 0A idempotency contract (foundation only — full consumer wiring is 0B)
// ---------------------------------------------------------------------------

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

export class InMemoryIdempotencyLedger implements IdempotencyLedger {
  private readonly store = new Map<string, Date>();

  private key(consumerName: string, eventId: string): string {
    return `${consumerName}:${eventId}`;
  }

  async markProcessed(consumerName: string, eventId: string): Promise<void> {
    this.store.set(this.key(consumerName, eventId), new Date());
  }

  async isProcessed(consumerName: string, eventId: string): Promise<boolean> {
    return this.store.has(this.key(consumerName, eventId));
  }
}
