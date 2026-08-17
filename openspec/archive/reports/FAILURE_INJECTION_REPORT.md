# FAILURE INJECTION REPORT

Scope: Part 4 Stage 14 (12 failure cases) + invariants K (idempotency) and L.13/L.14 (DLQ/alert).
No code modified. Findings derived from code paths in `workers/*`, `services/*`, `packages/queue`.

## Test Method
For each failure, determine: (a) Is authoritative state preserved? (b) Is data lost? (c) Can processing safely retry? (d) Can duplicate state appear? (e) Is the user blocked unnecessarily? (f) Is an admin alerted?

## 1. Timeline Engine unavailable
- Authoritative state: PRESERVED (state change + Outbox already committed).
- Data lost: NO (OutboxEvent remains `processed=false`).
- Safe retry: YES (relay re-polls).
- Duplicates: NO (timeline.worker dedupes by `correlationId`, `timeline.worker.ts:409-418`).
- User blocked: NO.
- Admin alerted: only if relay exhausts (currently silently skipped at `error_count>=3`, `outbox-relay.worker.ts:72` → NO alert). **GAP.**

## 2. Rules Engine unavailable
- Authoritative state: PRESERVED.
- Data lost: NO.
- Safe retry: PARTIAL — `rules-worker.ts` has **no durable ledger**; if pod restarts, in-memory `depthTracker` lost (L.1) but events re-process from Outbox.
- Duplicates: YES RISK — rules worker does **no duplicate rejection** (`rules-worker.ts:30-54`) → re-delivery re-executes rules → duplicate actions (K.5). **GAP.**
- User blocked: NO.
- Admin alerted: NO (L.14).

## 3. Notification Engine unavailable
- Authoritative state: PRESERVED.
- Data lost: NO.
- Safe retry: PARTIAL — `notification.worker.ts` has **no durable idempotency** (K.4) → duplicates possible on replay. **GAP.**
- Duplicates: YES RISK.
- Admin alerted: NO.

## 4. Care Journey Engine unavailable
- Authoritative state: PRESERVED (new engine uses Outbox).
- Data lost: NO.
- Safe retry: YES (relay).
- Duplicates: LOW (engine idempotent within transaction) but legacy AI engine (`ai/engine.ts`) writes directly — not outbox-protected. **GAP if legacy path active.**
- Admin alerted: NO (no journey-activation-failure monitoring).

## 5. Search Engine unavailable
- Authoritative state: PRESERVED.
- Data lost: NO.
- Safe retry: PARTIAL — `search.worker.ts:11` uses in-memory `Set` (non-durable) → on restart, duplicates possible (K.6). **GAP.**
- Duplicates: YES RISK.
- Admin alerted: NO.

## 6. Outbox relay crash (mid-batch)
- **CRITICAL.** `outbox-relay.worker.ts:81-98` dispatches downstream FIRST, then marks `processed=true`. If relay crashes after a successful downstream write but before the mark, the event is re-polled and re-dispatched → **DUPLICATE side-effects**. Downstream handlers are not uniformly idempotent (notification none, search in-memory, rules none). **This is the highest-severity resilience bug.** Fix: mark `processed` atomically with dispatch, or make all handlers idempotent on a durable `eventId`.
- Also: `FOR UPDATE SKIP LOCKED` transaction commits immediately after SELECT (`outbox-relay.worker.ts:68-77`), releasing the lock before dispatch → two relay instances can double-process the same rows. **GAP.**

## 7. Duplicate event delivery (at-least-once)
- Safe ONLY for Timeline (DB dedup). Search/Rules/Notification: NOT safe (K.4/K.5/K.6). **GAP** — violates "at-least-once delivery must be safe" (K).

## 8. Worker restart
- Timeline: safe (DB dedup). Escalation: safe (DB unique + Redis lock). Search/Rules/Notification: **lose in-memory dedup → duplicates**. **GAP.**

## 9. Multi-worker concurrency
- `depthTracker` (rules) and `inboxCache` (search) are per-process → concurrent pods diverge → **duplicate rule execution / duplicate search updates**. **GAP.**
- Outbox relay double-process (see #6). **GAP.**

## 10. Stale retry
- Outbox `error_count` increments; at `>=3` event is **silently skipped forever** (`outbox-relay.worker.ts:72`) → **lost event, no DLQ, no alert**. **GAP (L.13/L.14).**

## 11. DLQ exhaustion
- No real DLQ table/queue exists (BullMQ `removeOnFail:false` is implicit only; escalation marks `FAILED` but no DLQ table; `escalation_dlq` published with no subscriber). **No admin alert path.** **GAP (L.13/L.14).**

## 12. Database transaction rollback
- If state change + Outbox are in the SAME `$transaction` (journey/config/settings engines) → both roll back together → consistent, safe retry. **PASS for those engines.**
- If NOT in same transaction (discharge `ipd.ts` Supabase, referral `services.ts:1754`) → state may commit while Outbox absent → **inconsistent, no recovery event**. **GAP (J.1).**

## Summary Scorecard
| # | Failure | Authoritative preserved | Safe retry | Duplicate risk | Admin alert |
|---|---|---|---|---|---|
| 1 | Timeline down | YES | YES | NO | NO (gap) |
| 2 | Rules down | YES | PARTIAL | YES (gap) | NO |
| 3 | Notify down | YES | PARTIAL | YES (gap) | NO |
| 4 | Journey down | YES | YES | LOW | NO |
| 5 | Search down | YES | PARTIAL | YES (gap) | NO |
| 6 | Relay crash | YES | YES | **YES (critical)** | NO |
| 7 | Dup delivery | — | — | YES (gap) | NO |
| 8 | Worker restart | YES | PARTIAL | YES (gap) | NO |
| 9 | Multi-pod | YES | PARTIAL | YES (gap) | NO |
| 10 | Stale retry | YES | NO (lost) | — | NO |
| 11 | DLQ exhaust | YES | NO (lost) | — | NO |
| 12 | Tx rollback | YES (if in-tx) | YES | NO | n/a |

## Must Fix (P0/P1)
- `workers/outbox-relay.worker.ts:68-98` — atomic processed-mark + DLQ routing + admin alert at `error_count>=3`.
- Durable idempotency ledger shared across pods for Search/Rules/Notification (K.4/K.5/K.6).
- Real `DeadLetterEvent` table + admin alert subscriber (L.13/L.14).
- Convert discharge/referral to in-transaction Outbox (J.1).
