# Phase 0A — Tasks

## T1 — Canonical contract (packages/platform-contracts)
- [x] Create `src/events/outbox.ts` with `CanonicalEventEnvelope`, `RawOutboxRecord`, enums
      (`ScopeType`, `ActorType`, `OutboxDeliveryStatus`), `normalizeLegacyOutbox`,
      `buildCanonicalOutbox`, Zod schema, `IdempotencyLedger` + `InMemoryIdempotencyLedger`.
- [x] Export from `src/index.ts`.
- [x] Rebuild `dist` (`npm run build`) so the relay can import it.

## T2 — Schema + migration (packages/db)
- [x] Add additive columns to `OutboxEvent` + `EventLog` in `schema.prisma` (validated).
- [x] Author `scripts/migrations/10_add_outbox_canonical_columns.sql` (nullable, IF NOT EXISTS,
      partial unique index, `dead_letter_events` table).
- [x] Apply migration to the test database (`prisma db execute` → success).

## T3 — Relay integration (workers/outbox-relay.worker.ts)
- [x] Import `normalizeLegacyOutbox`, `OutboxDeliveryStatus` from `@haspataal/platform-contracts`.
- [x] SELECT the new structured columns.
- [x] Normalize each row through the envelope; downstream handlers still receive `payload`.
- [x] Mark `deliveryStatus='PROCESSED'` on success (raw SQL, no regen dependency).
- [x] On `errorCount>=3`, mark `DEAD_LETTERED` + persist to `dead_letter_events` (no silent drop).
- [x] Add `persistDeadLetter` helper.

## T4 — EventLog repair (services/event.service.ts + .js)
- [x] Extract `EVENT_LOG_INSERT_SQL`; target `event_logs` with `idempotency_key` + `metadata`.
- [x] Apply identical repair to the compiled `event.service.js` (Vitest resolves `.js` first).

## T5 — Tests
- [x] `packages/platform-contracts/src/events/__tests__/outbox.test.ts` — 16 cases covering all
      15 acceptance scenarios + envelope schema + idempotency ledger.
- [x] `services/__tests__/event.service.test.ts` — EventLog SQL repair + idempotency-key
      determinism + runtime path (network-free).
- [x] Run: `npx vitest run` for both files → 19 passed.

## T6 — Deliverables (15 docs)
- [x] PHASE_0A_OPENSPEC.md, EVENT_TOPOLOGY_MAP.md, OUTBOX_PRODUCER_INVENTORY.md,
      OUTBOX_CONSUMER_INVENTORY.md, CANONICAL_EVENT_CONTRACT.md, LEGACY_NORMALIZATION_RULES.md,
      EVENTLOG_REPAIR_REPORT.md, RELAY_FAILURE_WINDOW_ANALYSIS.md, IDEMPOTENCY_TOPOLOGY_DECISION.md,
      DLQ_STATE_MODEL.md, PHASE_0A_MIGRATION_PLAN.md, PHASE_0A_TEST_MATRIX.md, PHASE_0A_CHANGELOG.md,
      PHASE_0A_VERIFICATION_REPORT.md, PHASE_0B_HANDOFF.md.

## Explicitly NOT done (deferred to Phase 0B / later)
- Migrate all 52+ producers to structured columns.
- Consumer-side durable idempotency ledger wiring.
- Full claim/lease/retry/alert loop for dead letters.
- Any clinical-workflow, identity, discharge, referral, timeline, rules, or portal change.
