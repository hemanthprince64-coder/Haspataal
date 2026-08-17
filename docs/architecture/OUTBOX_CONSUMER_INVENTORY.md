# OUTBOX CONSUMER INVENTORY (Phase 0A)

How each downstream consumer reads an outbox event and whether it sees `OutboxEvent.id`/`eventId`.

## Relay dispatch (`workers/outbox-relay.worker.ts:30`)
- Reads `record.id`, `record.eventType`, `record.payload` (+ new structured columns in 0A SELECT).
- Switches on `eventType`; passes the **parsed `payload`** to handlers (unchanged in 0A).
- Default branch maps to `eventBus.publish` using `payload?.eventId ?? record.id` (now via the
  normalized envelope — `dispatchOutboxEvent`).

## Command handlers (consumers of relay dispatch)
| Consumer | File | Reads id/context | Notes |
|---|---|---|---|
| Timeline | `workers/timeline.worker.ts:410` | dedups on `correlationId` (`timelineEvent.findUnique`); stores `correlationId`; does NOT read `OutboxEvent.id` | sole writer of `timeline_events` (`:424`) |
| Rules | `workers/rules-worker.ts:33` | `idempotencyKey: execute-${rule.id}-${event.id}`; `event.id` = relay's `payload.eventId ?? record.id` | no duplicate-rejection of rule execution |
| Notification | `packages/notify/src/handlers.ts:14` | parses `SendNotificationCommandSchema`; `workers/notification.worker.ts:151` uses `event.id` in `idempotencyKey` | no durable idempotency ledger |
| Search | `packages/search/src/handlers.ts:36` | parses `IndexDocumentCommandSchema`; `workers/search.worker.ts:14` in-memory dedup; `:125` `index-${event.id}` | non-durable dedup (lost on restart) |

## EventLog consumers (separate store)
- `services/event.service.ts` / `event-emitter.ts` write `event_logs`.
- Read by: `services/dashboard.service.ts:318`, `apps/patient-portal/.../outbox-worker.ts:25`,
  `asha/visit-log` route, `EventService.publish` callers (escalation/followup workers).
- `EventService.publish` is live (≈10 call sites in escalation/followup workers) — its broken
  raw SQL was repaired in 0A.

## Idempotency status (pre-0B)
- Only Timeline is durable (DB dedup). Rules/Notification/Search use in-memory or none.
- A shared `IdempotencyLedger` contract is defined in 0A (`packages/platform-contracts/src/events/outbox.ts`)
  but NOT yet wired into consumers (Phase 0B). See `IDEMPOTENCY_TOPOLOGY_DECISION.md`.

## Phase 0A consumer impact
**None of the consumers changed.** The only consumer-side change is inside the relay, which now
normalizes rows through the canonical envelope before dispatch. Payloads are passed through
verbatim, so handler behavior is unchanged.
