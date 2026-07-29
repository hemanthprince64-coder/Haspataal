# CANONICAL EVENT CONTRACT (Phase 0A)

Defined in `packages/platform-contracts/src/events/outbox.ts` (additive; the strict
`PlatformEvent`/`PlatformCommand` schemas in `envelopes.ts` are NOT modified).

## Event identity (§3.1)
`OutboxEvent.id` (uuid) **is** the canonical `eventId`. No second UUID column was added.
Verified: the relay already propagates `payload?.eventId ?? record.id` and `DomainEvent.id`
consumes it; the storage-row id and the externally-propagated event id are the same value.

## Conceptual structure (implemented)
```ts
interface CanonicalEventEnvelope {
  eventId: string;          // === OutboxEvent.id
  eventType: string;
  eventVersion: number;     // default 1

  aggregate: { aggregateType: string | null; aggregateId: string | null };

  scope: { scopeType: 'PLATFORM' | 'HOSPITAL' | null;
           hospitalId: string | null; tenantId: string | null };

  actor: { actorId: string | null; actorType: ActorType | null; role: string | null };

  chain: { correlationId: string | null; causationId: string | null; depth: number };

  occurredAt: Date | null;   // distinct from row insertion time
  payload: unknown;          // original payload, preserved verbatim
  normalizedFromLegacy: boolean;
}
```

## Enums
- `ScopeType`: `PLATFORM`, `HOSPITAL` (a PLATFORM event may have `hospitalId = null`).
- `ActorType`: `PATIENT, DOCTOR, NURSE, ADMIN, USER, SYSTEM, HOSPITAL_SYSTEM, PLATFORM_SYSTEM, WORKER`
  (system actors may omit `actorId`).
- `OutboxDeliveryStatus` (foundation): `PENDING, PROCESSING, PROCESSED, RETRYABLE_FAILED, DEAD_LETTERED`.

## Helpers
- `normalizeLegacyOutbox(record: RawOutboxRecord): CanonicalEventEnvelope` — see LEGACY_NORMALIZATION_RULES.md.
- `buildCanonicalOutbox(input): RawOutboxRecord` — builds a row object for NEW producers; `payload` preserved.
- `canonicalEventEnvelopeSchema` — permissive Zod (v3) schema for optional validation.
- `IdempotencyLedger` interface + `InMemoryIdempotencyLedger` reference implementation.

## Notes on storage vs contract
New structured metadata lives in **both** top-level nullable `outbox_events` columns (for
queryability/tracing) and may be mirrored in `payload` by future producers. The adapter reads
top-level columns first, then legacy `payload` fields, then `null`/safe-default — it never
rewrites `payload`.

## Why not reuse the strict `PlatformEvent` schema?
`createPlatformEventSchema` requires `platformId`/`hospitalId` UUIDs everywhere and a `.uuid()`
`correlationId`. Legacy rows have none of these. A permissive envelope is required for backward
compatibility; the strict schema remains the target for fully-structured future producers.
