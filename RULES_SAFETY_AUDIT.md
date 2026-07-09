# RULES SAFETY AUDIT

Scope: Invariants K (Idempotency), L (Rules Engine safety), J (Outbox for rule actions).
No code modified.

## 1. What Exists (SOUND — reuse)
- **L.3 — Durable rule execution history: PASS.** `ExecutionEngine.logExecution` → `prisma.ruleExecution.create` (`packages/rules/src/engine.ts:238-249`); `RuleExecution` model indexed (`schema.prisma:3598-3614`).
- **L.10 — Evaluation vs action delivery separate: PASS.** `execute` evaluates conditions (`engine.ts:17-21`) then iterates actions (`engine.ts:23-30`).
- **L.16 — Generates alerts/recommendations/commands/automation: PASS.** Actions: `escalate, assign_task, complete_milestone, send_notification, create_timeline, update_journey_risk` (`types.ts:10-19`).
- **K.3 — No duplicate Timeline events: PASS.** `timeline.worker.ts:409-418` dedupes by `correlationId` against DB.
- **K.1 (partial) — EventService idempotency key:** `event.service.ts:80-83` generates SHA-256 key + `ON CONFLICT (idempotency_key) DO NOTHING` — but the column does not exist (see Contradicted).

## 2. What Contradicts (P0/P1)
- **L.1 — No in-memory recursion tracker as source of truth: CONTRADICTED.** `workers/rules-worker.ts:9-11,17-22,65-67` uses `depthTracker = new Map<string,number>()` cleared hourly. This is the ONLY cycle detection; not durable, not shared across processes, lost on restart.
- **L.14 — DLQ creates admin alert: CONTRADICTED.** `escalation_dlq` events published (`escalation.worker.ts:256,361`) but **no subscriber/handler** creates an admin/operational alert. Outbox relay silently skips `error_count>=3` (`outbox-relay.worker.ts:72`) — lost events, no alert.
- **L.15 — Rules cannot rewrite authoritative clinical records: CONTRADICTED.** `update_record` action executes `(prisma as any)[table].update(...)` (`engine.ts:143-146`) with **no table whitelist**. Any rule can target ANY Prisma model, including clinical tables.

## 3. What Is Partial / Missing
- **L.2 — Chain carries eventId/correlationId/causationId/depth: PARTIAL.** `PlatformCommand` supports `correlationId`/`causationId` (`platform-contracts/src/envelopes.ts:53-54`), but `rules-worker.ts:14-22` uses only `correlationId` for depth; `causationId`/`depth` not propagated into `RuleContext`/`RuleExecution`.
- **K.1 / K.2 — Persist + reject processed event IDs: PARTIAL.** Timeline durable; Search uses in-memory `Set` (`search.worker.ts:11`); Rules worker has **no duplicate rejection** — every event triggers every matching rule (`rules-worker.ts:30-54`); `idempotencyKey` on command is never validated/persisted.
- **K.4 — No duplicate notifications: PARTIAL.** BullMQ `jobId` dedup (`notify/src/engine.ts:49-57`) but no `notificationId` idempotency check before enqueue.
- **K.5 / K.7 — No duplicate rule executions / Care Journey actions: MISSING.** No durable dedup for rule or journey triggered by rules.
- **K.6 — No duplicate Search updates: PARTIAL.** In-memory `Set` (`search.worker.ts:11`) lost on restart/multi-pod.
- **L.4 — Duplicate chains rejected: MISSING.** Intended `idempotency_key` conflict resolution is broken (column missing).
- **L.5/L.6/L.7 — Cycle detection / max depth / platform max: PARTIAL.** Hardcoded `>10` in-memory (`rules-worker.ts:18`); not configurable, not durable.
- **L.8 — Hospitals configure only lower limits: MISSING.** No hospital depth config (`OpdConfig` 2198, `RetentionRule` 2164 lack depth).
- **L.9 — Redis coordinates but not source of truth: PARTIAL.** Redis used for BullMQ/locks (`escalation.worker.ts:44-58`); cycle state is in-memory (violates intent).
- **L.11 — Rule actions use Outbox: PARTIAL.** `send_notification`→Outbox (`engine.ts:135`); `create_timeline`→Publisher→Outbox. But `update_record, call_api, assign_task, escalate, complete_milestone, update_journey_risk` execute **synchronously** with no Outbox (`engine.ts:140-228`).
- **L.12 — Failed actions retry: PARTIAL.** Outbox retries (`error_count<3`); synchronous actions caught per-action but not retried (`engine.ts:27-29`).
- **L.13 — Retry exhaustion → DLQ: PARTIAL.** Outbox stops at 3; no real DLQ table; Timeline DLQ writes `timelineAudit` only.
- **L.17 — Rules trigger rules only via domain events: PARTIAL.** Can emit via `EventService.publish` but nothing prevents direct `engine.execute` on another rule.
- **L.18 — DRAFT→SIMULATION→APPROVAL→PUBLISHED + versioning/rollback: MISSING.** `Rule` has `version/approvedBy/approvedAt` (`schema.prisma:3585-3588`) but **no `status`**; no rollback endpoint/history table.

## 4. Adversarial Findings
- **What if the worker crashes mid-batch?** In-memory `depthTracker`/`inboxCache` lost → cycles re-detected from scratch, duplicates possible (search/rules have no durable ledger).
- **What if two worker pods run?** `depthTracker` not shared → each pod independent depth; risk of divergent chain depth and duplicate rule execution (K.5 missing).
- **What if the same event is delivered twice?** Timeline safe (DB dedup); Search/Rules/Notification NOT (in-memory/missing) → duplicate state.
- **What if a rule targets a clinical table?** `update_record` has no whitelist → a misconfigured/compromised rule rewrites authoritative clinical records (L.15).
- **What if DLQ exhausts?** No admin alert (L.14) → silent data/process loss.

## 5. Must Refactor (reuse, do NOT rebuild)
- `workers/rules-worker.ts:11` — replace in-memory `depthTracker` with durable store (Redis sorted/read-through or DB) keyed by `correlationId` + `causationId` + `depth`; make max depth configurable (L.7/L.8).
- `workers/rules-worker.ts:30` — add durable dedup against `RuleExecution` before `handleExecuteRule` (K.5).
- `workers/search.worker.ts:11` — replace in-memory `Set` with durable ledger (K.6).
- `packages/rules/src/engine.ts:140-228` — restrict `update_record` to a non-clinical whitelist (L.15); wrap `assign_task/escalate/complete_milestone/update_journey_risk/call_api` through Outbox (L.11).
- `workers/outbox-relay.worker.ts:72` — add real DLQ + admin alert on `error_count>=3` (L.13/L.14).
- `packages/db/prisma/schema.prisma` — add `idempotency_key` to `EventLog` (1427), `status` to `Rule` (3585), `depth`/`causationId` to `RuleExecution`.
- `packages/rules/src/types.ts` — add `depth`/`causationId` to `RuleContext` (L.2).

## 6. Files Needing Change
- `workers/rules-worker.ts`, `workers/search.worker.ts`, `workers/notification.worker.ts`
- `packages/rules/src/engine.ts`, `packages/rules/src/types.ts`
- `services/event.service.ts` (fix idempotency column), `services/event-emitter.ts`
- `workers/outbox-relay.worker.ts`, `workers/escalation.worker.ts`
- `packages/platform-contracts/src/envelopes.ts`
- `packages/db/prisma/schema.prisma` (EventLog, Rule, RuleExecution)
