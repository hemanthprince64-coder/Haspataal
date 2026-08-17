# RELAY FAILURE WINDOW ANALYSIS (Phase 0A)

File: `workers/outbox-relay.worker.ts`. Phase 0A documents the real failure windows and prevents
regression; it does NOT claim transactional atomicity across the downstream dispatch boundary.

## Actual dispatch mechanism
```
processOutbox()
  ├─ BEGIN tx; SELECT ... FOR UPDATE SKIP LOCKED (claims rows) ; COMMIT   [releases lock immediately]
  └─ for each record:
        dispatchOutboxEvent(record)   ──▶ downstream engine / external handler
        on success: UPDATE outbox_events SET processed=true, delivery_status='PROCESSED'
        on error:    UPDATE outbox_events SET last_error, error_count = error_count+1
                     if error_count>=3: delivery_status='DEAD_LETTERED' + persist dead_letter_events
```

## Documented failure windows
| Window | Behavior | Risk | Mitigation |
|---|---|---|---|
| Lock released after SELECT | The `SKIP LOCKED` tx commits right after the SELECT, before dispatch. Two relay instances can claim overlapping batches. | Duplicate dispatch across pods | Downstream consumers MUST be duplicate-safe (Timeline dedups by `correlationId`; Rules/Notification/Search need 0B ledger). |
| Dispatch-before-ack | A crash after a successful downstream write but before `processed=true` re-polls and re-dispatches. | Duplicate side-effects | Consumers' idempotency (0B). Timeline already safe. |
| error_count>=3 | Previously: silently skipped forever (no alert, no record). Now: marked `DEAD_LETTERED` + persisted to `dead_letter_events`. | Was silent data loss; now retained. | 0B: claim/lease/retry + admin alert. |
| DB update failure | If the `processed=true` UPDATE fails, the event stays `processed=false` and is retried next poll. | At-least-once; possible duplicate if downstream already acted | Duplicate-safe consumers (0B). |

## What Phase 0A does NOT do
- Does NOT make dispatch transactionally atomic with external engines (impossible across service
  boundaries without a distributed transaction / saga).
- Does NOT add a shared consumer idempotency ledger (that is Phase 0B).
- Does NOT add admin alerting on dead-letter (0B) — but the event is now persisted, so 0B can alert.

## Adversarial summary (from FAILURE_INJECTION_REPORT of Phase 6)
- Authoritative state preserved: YES (state change + Outbox committed together where producers use
  `$transaction`).
- Data lost: previously YES on exhaustion; now NO (dead-letter persists).
- Safe retry: YES for Timeline; PARTIAL for others (0B ledger).
- Duplicate state: possible for Rules/Notification/Search on replay — tracked as 0B risk.
- Admin alerted: NO yet (0B).
