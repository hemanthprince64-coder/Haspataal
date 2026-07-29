# OpenSpec Change: Phase 0A — Event Foundation Compatibility Layer

> Status: IMPLEMENTED — awaiting review (do not begin Phase 0B / Identity / Discharge until approved).
> Spec-driven change. See `PHASE_0A_OPENSPEC.md` for the consolidated deliverable.

## Why
The current repository emits events through a single `OutboxEvent` table whose rows carry only
`eventType + payload`. There is no canonical envelope, no stable event identity beyond the row id,
no correlation/causation/chain-depth, no aggregate or tenant/actor context, and the `EventLog`
service writes to a table/columns that do not exist in the actual schema. Downstream phases
(Identity, Discharge, Referral, Care Journey, Rules safety) require stable event contracts but
MUST NOT be blocked by a big-bang migration of 52+ producers.

## What Changes
- Additive canonical event-envelope columns on `OutboxEvent` (nullable, backward compatible).
- Additive `idempotency_key` + `metadata` columns on `EventLog` (repairs the service mismatch).
- A new permissive `CanonicalEventEnvelope` contract + `normalizeLegacyOutbox` adapter in
  `@haspataal/platform-contracts` (does NOT modify the existing strict `PlatformEvent` schema).
- Relay normalization (legacy rows normalized through the envelope; downstream handlers
  unchanged) + explicit delivery status + dead-letter persistence (no silent drops).
- `OutboxEvent.id` is the canonical `eventId` (no second UUID column — verified).

## What Does NOT Change
No clinical workflow, no Patient/OTP/family/guest logic, no discharge/referral behavior, no
Timeline/Rules/Care Journey semantics, no Patient/Admin portal, no Patient schema, no Admission/
Referral/Timeline schema. 52+ producers are NOT migrated; only the relay is wired to the adapter.

## Acceptance Criteria (from the Phase 0A brief, Section 14)
All are covered. See `PHASE_0A_VERIFICATION_REPORT.md` and `PHASE_0A_TEST_MATRIX.md`.
- Compatibility: legacy rows/producers/consumers continue to work.
- Contract: one canonical envelope; stable `eventId`; versioning; aggregate; PLATFORM/HOSPITAL
  scope; human + system actors; correlation/causation; generic depth; occurredAt distinct from
  row insertion.
- Normalization: structured > legacy fallback > unknown (never fabricated).
- EventLog: schema/service mismatch repaired; runtime path tested; EventLog not a second Outbox.
- Migration safety: additive; no clinical record rewritten; no schema outside OutboxEvent/EventLog
  changed.
- Validation: schema validates; migration applies; tests pass (19/19).
