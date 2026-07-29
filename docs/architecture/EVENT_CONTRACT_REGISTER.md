# EVENT CONTRACT REGISTER

Scope: Invariant J (Transactional Outbox Standard). Defines the required contract and the current gap.
No code modified.

## 1. Required Contract (J.2) — fields every OutboxEvent MUST carry

| Field | Required | Currently in schema? |
|---|---|---|
| `eventId` (stable, idempotency key) | YES | NO (only `id` uuid) |
| `eventType` | YES | YES (`eventType`) |
| `eventVersion` | YES | NO |
| `aggregateType` | YES | NO (dug from payload) |
| `aggregateId` | YES | NO (dug from payload) |
| `tenantContext` (hospitalId/tenant) | YES | NO (sometimes in payload) |
| `actorContext` (actorId/role) | YES | NO (sometimes in payload) |
| `correlationId` | YES | NO (only optional TS field; auto-gen in timeline) |
| `causationId` | YES | NO |
| `depth` | YES | NO (only in-memory in rules-worker) |
| `occurredAt` (event time, ≠ row insert) | YES | NO (only `createdAt` = insert time) |
| minimal transition metadata (stateFrom/stateTo) | YES | PARTIAL (`processed/errorCount`) |

## 2. Actual Schema (verified) — `packages/db/prisma/schema.prisma:1413-1425`
```prisma
model OutboxEvent {
  id String @id @default(uuid())
  eventType String @map("event_type")
  payload Json
  processed Boolean @default(false)
  processedAt DateTime? @map("processed_at")
  errorCount Int @default(0) @map("error_count")
  lastError String? @map("last_error")
  createdAt DateTime @default(now()) @map("created_at")
  @@index([processed, createdAt])
  @@map("outbox_events")
}
```
All context is embedded as JSON in `payload` → violates J.2 (structured columns required).

`EventLog` (`:1427-1438`) similarly lacks `idempotency_key`/`metadata` that `event.service.ts:78-86` references → broken at runtime.

## 3. Current Producers (all omit structured fields)
- `packages/timeline/src/index.ts:173` — `eventType` + `payload` only
- `packages/rules/src/engine.ts:135` — `eventType` + `payload`
- `packages/notify/src/outbox.ts:48` — `eventType` + `payload`
- `packages/journey/src/engine.ts` — ×11+ `eventType` + `payload`
- `packages/config/src/engine.ts:15`, `packages/settings/src/engine.ts:114`
- `services/event-emitter.ts` — writes `EventLog` + `OutboxEvent` together

## 4. Proposed Canonical Event Envelope (to implement in remediation)
```ts
// packages/platform-contracts/src/events/outbox.ts
interface OutboxEventContract {
  eventId: string;          // uuid, idempotency key (@unique)
  eventType: string;        // e.g. DISCHARGE_PATIENT_LEFT
  eventVersion: number;     // schema version of this event
  aggregateType: string;    // ADMISSION | REFERRAL | JOURNEY | PATIENT
  aggregateId: string;      // canonical entity id
  tenantContext: { hospitalId: string; tenantId?: string };
  actorContext: { actorId: string; actorType: string; role?: string };
  correlationId: string;    // chain root
  causationId?: string;     // immediate parent eventId
  depth: number;            // rule-chain depth (L.6)
  occurredAt: DateTime;     // event occurrence, not insert
  payload: Json;            // minimal transition metadata ONLY (no PHI copy)
}
```
Consumers fetch authorized detail via controlled contracts (J.4) — not by reading PHI from the event.

## 5. Migration Notes
- High risk: 52+ `outboxEvent.create` call sites; extract payload-embedded fields to columns without breaking consumers (add columns, backfill from payload, then tighten producers).
- Add `@@unique([eventId])` for durable idempotency ledger (K.1).
- Add `DeadLetterEvent` model (see FAILURE_INJECTION_REPORT) for DLQ (L.13/L.14).

## 6. Files Needing Change
- `packages/db/prisma/schema.prisma` (OutboxEvent 1413, EventLog 1427)
- `packages/platform-contracts/src/events/outbox.ts` (NEW envelope)
- All producers listed in §3
- `services/event.service.ts:78-86`, `services/event-emitter.ts`
- `workers/outbox-relay.worker.ts` (read new fields, DLQ routing)
