# EVENTLOG REPAIR REPORT (Phase 0A)

## Mismatch confirmed
`services/event.service.ts:78-86` executed raw SQL against a table named `"EventLog"` (Postgres
case-sensitive identifier) with columns `metadata` and `idempotency_key` that **do not exist** in
the actual Prisma model `EventLog` (mapped to `event_logs` with columns `id, event_type, payload,
executed_by, created_at, hospital_id, patient_id` — `schema.prisma:1427`). At runtime this throws
`relation "EventLog" does not exist` whenever `EventService.publish` is invoked on Postgres
(≈10 call sites in `escalation.worker.ts` / `followup.worker.ts`).

## Distinction of stores (must stay distinct)
- **OutboxEvent** — write-ahead for relay→consumer fan-out.
- **EventLog** — append-only operational event record (NOT a second Outbox).
- **TimelineEvent** — clinical longitudinal stream (sole writer `timeline.worker.ts:424`).
- **AuditLog** — security/audit trail.
No store was merged or redefined. EventLog remains its own source of truth.

## Repair (additive)
1. Schema (`schema.prisma:1427`): added
   - `idempotencyKey String? @unique @map("idempotency_key")`
   - `metadata Json? @map("metadata")`
   The `@unique` is partial (Prisma supports unique on nullable only via the unique constraint on
   the underlying column; the migration adds a partial unique index `WHERE idempotency_key IS NOT NULL`).
2. Service (`services/event.service.ts` + compiled `services/event.service.js`):
   extracted `EVENT_LOG_INSERT_SQL`, now targeting `event_logs` (correct table) with the real
   columns `idempotency_key` + `metadata` and `ON CONFLICT (idempotency_key) DO NOTHING`.
3. Migration (`scripts/migrations/10_add_outbox_canonical_columns.sql`):
   `ALTER TABLE event_logs ADD COLUMN idempotency_key TEXT, metadata JSONB;` +
   `CREATE UNIQUE INDEX ... ON event_logs(idempotency_key) WHERE idempotency_key IS NOT NULL;`
   Applied successfully to the test database.

## Tests
`services/__tests__/event.service.test.ts` (network-free):
- asserts `EVENT_LOG_INSERT_SQL` contains `event_logs` (not `"EventLog"`), `idempotency_key`,
  `metadata`, and `ON CONFLICT (idempotency_key) DO NOTHING`;
- asserts runtime path executes `prisma.eventLog.create` without throwing (sqlite branch);
- asserts `generateIdempotencyKey` is deterministic (sha256 hex) per (hospital, type, resource, day).

## Result
Mismatch resolved. EventLog is not a duplicate Outbox. No clinical record or other schema changed.
