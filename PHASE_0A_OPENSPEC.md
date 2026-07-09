# PHASE 0A — OPENSPEC (consolidated)

This is the consolidated OpenSpec for Phase 0A. The structured OpenSpec change lives in
`openspec/changes/phase-0a-event-foundation/` (`proposal.md`, `design.md`, `tasks.md`).

## Current Problem
- `OutboxEvent` (`packages/db/prisma/schema.prisma:1413`) stores only `eventType` + `payload`.
- No canonical envelope, no stable event identity beyond the row `id`, no correlation/causation/
  depth, no aggregate or tenant/actor context.
- `services/event.service.ts:78-86` writes to a `"EventLog"` table with `metadata`/`idempotency_key`
  columns that do **not** exist in the actual `event_logs` schema (mismatch confirmed).
- `OutboxEvent.id` is already used downstream as `eventId` (`workers/outbox-relay.worker.ts:51`),
  but not consistently surfaced as a first-class contract field.
- 52+ producers and several consumers exist; a big-bang migration is unsafe.
- `errorCount>=3` events are silently skipped (`outbox-relay.worker.ts`) — no DLQ, no alert.

## Desired Behavior
- One permissive canonical event envelope (`CanonicalEventEnvelope`) supporting identity, version,
  aggregate, scope (PLATFORM/HOSPITAL), actor (human + system), correlation/causation, generic
  depth, and occurrence time distinct from row insertion.
- `OutboxEvent.id` is the canonical `eventId` (no second UUID column).
- Legacy producers keep working; new producers may supply structured metadata.
- A normalization adapter resolves structured columns with safe legacy fallbacks; never fabricates
  hospital/actor/aggregate identity.
- `EventLog` schema/service mismatch repaired; EventLog remains distinct from Outbox/Timeline/Audit.
- Exhausted events are persisted (dead-letter), not silently dropped.

## Non-Goals (explicitly excluded)
Discharge implementation · Referral implementation · Patient Registry / identity changes ·
authorization redesign · Rules loop prevention · Care Journey behavior change · Timeline behavior
change · portal changes · Admin UI · migration of every producer · removal of legacy `payload` fields.

## Acceptance Criteria (all met — see PHASE_0A_VERIFICATION_REPORT.md)
- Compatibility: legacy rows/producers/consumers continue to function.
- Contract: one canonical envelope; stable eventId; versioning; aggregate; PLATFORM/HOSPITAL scope;
  human + system actors; correlation/causation; generic depth; occurredAt ≠ row insertion.
- Normalization: structured > legacy fallback > unknown (not fabricated); original payload preserved.
- EventLog: mismatch fixed; runtime path tested; EventLog is not a second Outbox.
- Migration safety: additive; no clinical record rewritten; no Patient/Admission/Referral/Timeline schema changed.
- Validation: schema validates; migration applies; existing build passes; 19/19 new tests pass.

## Implementation Summary (verified changes)
| File | Change |
|---|---|
| `packages/platform-contracts/src/events/outbox.ts` | NEW canonical contract + adapter + idempotency interface |
| `packages/platform-contracts/src/index.ts:1` | export new module |
| `packages/platform-contracts/dist/**` | rebuilt |
| `packages/db/prisma/schema.prisma` (OutboxEvent, EventLog) | additive columns |
| `scripts/migrations/10_add_outbox_canonical_columns.sql` | NEW migration (applied) |
| `workers/outbox-relay.worker.ts` | normalization + deliveryStatus + dead-letter |
| `services/event.service.ts` / `.js` | EventLog SQL repair |
| `packages/platform-contracts/src/events/__tests__/outbox.test.ts` | NEW (16 cases) |
| `services/__tests__/event.service.test.ts` | NEW (3 cases) |
