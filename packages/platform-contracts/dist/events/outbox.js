"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryIdempotencyLedger = exports.canonicalEventEnvelopeSchema = exports.OutboxDeliveryStatus = exports.ActorType = exports.ScopeType = void 0;
exports.normalizeLegacyOutbox = normalizeLegacyOutbox;
exports.buildCanonicalOutbox = buildCanonicalOutbox;
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
const zod_1 = require("zod");
// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
exports.ScopeType = {
    PLATFORM: 'PLATFORM',
    HOSPITAL: 'HOSPITAL',
};
/**
 * Actor types support both human and system actors. System-generated events
 * may omit `actorId` (no human identity required).
 */
exports.ActorType = {
    PATIENT: 'PATIENT',
    DOCTOR: 'DOCTOR',
    NURSE: 'NURSE',
    ADMIN: 'ADMIN',
    USER: 'USER',
    SYSTEM: 'SYSTEM',
    HOSPITAL_SYSTEM: 'HOSPITAL_SYSTEM',
    PLATFORM_SYSTEM: 'PLATFORM_SYSTEM',
    WORKER: 'WORKER',
};
/**
 * Explicit delivery status foundation (Phase 0A). The relay currently only
 * marks PROCESSED / DEAD_LETTERED; full claim/lease/retry semantics are 0B.
 * A single Boolean `processed` is NOT sufficient to express these states.
 */
exports.OutboxDeliveryStatus = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    PROCESSED: 'PROCESSED',
    RETRYABLE_FAILED: 'RETRYABLE_FAILED',
    DEAD_LETTERED: 'DEAD_LETTERED',
};
// ---------------------------------------------------------------------------
// Zod (v3) schemas — permissive, used for optional validation in tests/producers
// ---------------------------------------------------------------------------
const scopeTypeSchema = zod_1.z.enum(['PLATFORM', 'HOSPITAL']);
const actorTypeSchema = zod_1.z.enum([
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
exports.canonicalEventEnvelopeSchema = zod_1.z.object({
    eventId: zod_1.z.string(),
    eventType: zod_1.z.string(),
    eventVersion: zod_1.z.number().int().nonnegative(),
    aggregate: zod_1.z.object({ aggregateType: zod_1.z.string().nullable(), aggregateId: zod_1.z.string().nullable() }),
    scope: zod_1.z.object({
        scopeType: scopeTypeSchema.nullable(),
        hospitalId: zod_1.z.string().nullable(),
        tenantId: zod_1.z.string().nullable(),
    }),
    actor: zod_1.z.object({
        actorId: zod_1.z.string().nullable(),
        actorType: actorTypeSchema.nullable(),
        role: zod_1.z.string().nullable(),
    }),
    chain: zod_1.z.object({
        correlationId: zod_1.z.string().nullable(),
        causationId: zod_1.z.string().nullable(),
        depth: zod_1.z.number().int().nonnegative(),
    }),
    occurredAt: zod_1.z.coerce.date().nullable(),
    payload: zod_1.z.unknown(),
    normalizedFromLegacy: zod_1.z.boolean(),
});
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function asDate(value) {
    if (!value)
        return null;
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}
function firstPresent(...values) {
    for (const v of values) {
        if (v !== null && v !== undefined)
            return v;
    }
    return null;
}
/** Does this raw record carry any canonical structured-column metadata? */
function hasStructuredMetadata(record) {
    return Boolean(record.eventVersion != null ||
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
        record.occurredAt != null);
}
/**
 * Normalize a raw outbox row into a CanonicalEventEnvelope.
 *
 * Precedence: structured column > known legacy payload field > unknown/null.
 * Never invents hospital / actor / aggregate identity.
 */
function normalizeLegacyOutbox(record) {
    const payload = (record.payload ?? {});
    const p = payload;
    const eventVersion = firstPresent(record.eventVersion, p.eventVersion, 1) ?? 1;
    const aggregateType = firstPresent(record.aggregateType, p.aggregateType, p.aggregate?.aggregateType);
    const aggregateId = firstPresent(record.aggregateId, p.aggregateId, p.aggregate?.aggregateId);
    // scopeType: prefer structured; else infer HOSPITAL when a hospital id is present;
    // never infer a hospitalId that was not supplied.
    const structuredScope = record.scopeType ?? null;
    const inferredScope = structuredScope
        ? structuredScope
        : firstPresent(p.scopeType, p.scope?.scopeType, p.tenantContext?.hospitalId ? 'HOSPITAL' : null, p.tenantScope?.hospitalId ? 'HOSPITAL' : null, record.hospitalId ? 'HOSPITAL' : null, p.hospitalId ? 'HOSPITAL' : null);
    const hospitalId = firstPresent(record.hospitalId, p.hospitalId, p.tenantContext?.hospitalId, p.tenantScope?.hospitalId);
    const tenantId = firstPresent(record.tenantId, p.tenantId, p.tenantContext?.tenantId);
    const actorId = firstPresent(record.actorId, p.actorId, p.actorContext?.actorId, p.actorReference?.actorId);
    const actorType = firstPresent(record.actorType, p.actorType, p.actorContext?.actorType, p.actorReference?.actorType);
    const role = firstPresent(record.actorRole, p.actorRole, p.actorContext?.role);
    const correlationId = firstPresent(record.correlationId, p.correlationId);
    const causationId = firstPresent(record.causationId, p.causationId);
    const depth = firstPresent(record.depth, p.depth, 0) ?? 0;
    const occurredAt = asDate(firstPresent(record.occurredAt, p.occurredAt));
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
function buildCanonicalOutbox(input) {
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
class InMemoryIdempotencyLedger {
    store = new Map();
    key(consumerName, eventId) {
        return `${consumerName}:${eventId}`;
    }
    async markProcessed(consumerName, eventId) {
        this.store.set(this.key(consumerName, eventId), new Date());
    }
    async isProcessed(consumerName, eventId) {
        return this.store.has(this.key(consumerName, eventId));
    }
}
exports.InMemoryIdempotencyLedger = InMemoryIdempotencyLedger;
