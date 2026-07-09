# IDEMPOTENCY TOPOLOGY DECISION (Phase 0A)

## Critical distinction (brief §10)
**Outbox row uniqueness ≠ consumer processing idempotency.** Phase 0A defines the contract and
the minimum justified persistence foundation; it does NOT migrate consumers.

## Repository topology (verified)
- All engines and the relay share ONE PostgreSQL database via `@haspataal/db` / the Prisma client
  (`packages/db`). There is no per-consumer separate database.
- Consumers run as separate worker processes (`workers/*.worker.ts`) that poll `outbox_events`
  (relay) or subscribe to Redis streams (`EventService.subscribe`). The Timeline worker also writes
  to the same Postgres (`timeline_events`).

## Decision
Because consumers share one Postgres, a **central durable ledger IS architecturally valid** and is
the target for Phase 0B. However, forcing all consumers to migrate in 0A is explicitly out of scope.

### What 0A delivers
- `IdempotencyLedger` interface (`markProcessed`, `isProcessed`) in
  `packages/platform-contracts/src/events/outbox.ts`.
- `InMemoryIdempotencyLedger` reference implementation (for tests/local only — NOT process-safe
  across pods).
- A documented plan for a `ProcessedEvent` table keyed by `(consumerName, eventId)` UNIQUE — the
  0B implementation target.

### What 0A deliberately does NOT do
- Does NOT create the `processed_event` table yet (kept as 0B to avoid unused-schema churn).
- Does NOT wire Timeline/Rules/Notification/Search workers to a ledger.
- Does NOT treat `OutboxEvent` row identity as consumer idempotency.

## Why not a per-consumer local ledger?
Consumers are horizontally scalable (multi-pod relay). A purely local (in-memory) ledger loses
dedup on restart/scale — exactly the gap identified in Phase 6 (Search/Rules in-memory Sets). The
shared Postgres ledger is therefore the correct model; 0B will implement it with a UNIQUE
`(consumerName, eventId)` constraint and migrate each consumer incrementally.
