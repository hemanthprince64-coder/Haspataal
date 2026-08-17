# Phase 0A — Design

## Canonical event identity (decision D1)
`OutboxEvent.id` (uuid, `@default(uuid())`) is the stable, externally-propagated `eventId`.
The relay already passes `payload?.eventId ?? record.id` downstream (`workers/outbox-relay.worker.ts:51`),
and `DomainEvent.id` consumes it. A second UUID column was NOT added — verified that storage-row
identity and propagated event identity are the same value, satisfying the brief's preferred
architecture (§3.1).

## Backward compatibility (D2/D3)
- `OutboxEvent.payload` is untouched. Producers writing `{eventType, payload}` keep working.
- New structured columns are `Nullable` and defaulted where sensible (`depth=0`, `deliveryStatus='PENDING'`).
- The relay still passes the raw `payload` to command handlers — zero consumer changes.
- The new contract module is additive to `@haspataal/platform-contracts`; the existing strict
  `PlatformEvent`/`PlatformCommand` schemas in `envelopes.ts` are NOT modified (they require UUIDs
  everywhere and are too strict for legacy/permissive normalization).

## Normalization adapter (D7)
`normalizeLegacyOutbox(record)` resolves each field by precedence:
structured column → known legacy payload field → `null`/safe default.
It never invents `hospitalId`, `actorId`, or `aggregateId`. `normalizedFromLegacy` is exposed so
observers can tell whether structured metadata was present.

## Tenant scope (D4) / Actor (D5) / Depth (D6)
- `scopeType: PLATFORM | HOSPITAL`; a PLATFORM event may have `hospitalId = null`.
- `actorType` includes human (PATIENT/DOCTOR/NURSE/ADMIN/USER) and system
  (SYSTEM/HOSPITAL_SYSTEM/PLATFORM_SYSTEM/WORKER); system actors may omit `actorId`.
- `depth` is generic chain depth, default 0; enforcement is a later (Rules) phase.

## Outbox schema (D7)
`OutboxEvent` gains 14 additive nullable columns + `deliveryStatus` (foundation for DLQ; see
`DLQ_STATE_MODEL.md`). Indexes added on `correlationId`, `aggregateId`, `deliveryStatus`.

## EventLog repair (D8)
`EventLog` gains `idempotencyKey` (partial unique) + `metadata` (jsonb). The service's raw SQL
now targets `event_logs` (was the nonexistent `"EventLog"`) and references the real columns.

## Idempotency (D10) / DLQ (D11) — foundation only
- Idempotency: `IdempotencyLedger` interface + `InMemoryIdempotencyLedger` reference impl defined.
  No shared table, no consumer wiring yet (topology decision in `IDEMPOTENCY_TOPOLOGY_DECISION.md`).
- DLQ: `deliveryStatus` states (PENDING/PROCESSING/PROCESSED/RETRYABLE_FAILED/DEAD_LETTERED) +
  `dead_letter_events` table. The relay marks DEAD_LETTERED (instead of silently skipping) and
  persists the original payload. Full claim/lease/retry/alert is Phase 0B.

## Relay safety (D12)
The relay's dispatch is NOT transactionally atomic with downstream engines (different services /
external boundaries). Phase 0A documents the failure windows (`RELAY_FAILURE_WINDOW_ANALYSIS.md`)
and prevents regression (duplicate-safe consumers remain responsible) without faking atomicity.
