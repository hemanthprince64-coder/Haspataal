# DLQ STATE MODEL (Phase 0A)

## Problem (brief §11)
Prior to 0A, `error_count >= 3` events were silently skipped forever (`outbox-relay.worker.ts:72`
excluded them from polling) — no DLQ, no admin alert, silent data loss.

## Foundational model introduced in 0A
A single Boolean `processed` is NOT sufficient. Five explicit states are now defined and one is
persisted:

| State | Meaning | Where |
|---|---|---|
| `PENDING` | created, not yet attempted | `outbox_events.delivery_status` default |
| `PROCESSING` | claimed by a relay instance | reserved for 0B claim/lease |
| `PROCESSED` | successfully dispatched | set by relay on success |
| `RETRYABLE_FAILED` | failed, will retry (error_count < 3) | reserved for 0B (relay currently just increments) |
| `DEAD_LETTERED` | exhausted (error_count >= 3) | set by relay; event persisted to `dead_letter_events` |

## Schema
- `OutboxEvent.deliveryStatus String? @default("PENDING") @map("delivery_status")` + index.
- `dead_letter_events` (new table, migration `10_*`):
  ```
  id text pk default gen_random_uuid()::text,
  original_outbox_id text not null,
  event_type text not null,
  payload jsonb not null,
  last_error text,
  error_count integer,
  dead_lettered_at timestamptz default now()
  ```
- Indexes on `event_type`, `dead_lettered_at`.

## Relay behavior (0A)
- On success: `delivery_status='PROCESSED'`.
- On `error_count>=3`: `delivery_status='DEAD_LETTERED'` + `INSERT` original row into
  `dead_letter_events` (raw SQL, no regen dependency). The poll query still excludes
  `error_count>=3`, so retries stop — but the event is now retained, not dropped.

## Explicitly deferred to 0B
- Claim/lease semantics (`PROCESSING` state with row lock / advisory lock).
- Retry backoff per consumer.
- Admin alert when a row enters `DEAD_LETTERED` (consume `dead_letter_events` in an Admin
  observability worker).
- Replay/repair tooling for dead letters.

## Why a dedicated table (not just a status)?
A dead letter must be inspectable and replayable without disturbing the live `outbox_events` poll.
A separate table provides a durable, repository-consistent failure repository that 0B can monitor
and alert on — satisfying "do not silently drop exhausted events" without a broad relay redesign.
