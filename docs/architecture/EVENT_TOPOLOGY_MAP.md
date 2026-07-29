# EVENT TOPOLOGY MAP (Phase 0A)

Current event flow and where the canonical envelope is introduced.

```
                         PRODUCERS (52+, NOT all migrated)
   journey engine (tx.outboxEvent) ┐
   settings engine (tx.outboxEvent)├─ write ─▶ outbox_events (id, eventType, payload, [new cols])
   config engine  (tx.outboxEvent) │                     │
   timeline/publish (outboxEvent)   │                     │
   notify/outbox (PlatformEvent)    ├─ write ────────────┘
   services/event-emitter.ts (bare)─┘          │
   event.service.ts (EventLog + Redis) ──▶ event_logs (+idempotency_key, metadata)   [REPAIRED]
                                            │
                                            ▼
                         OUTBOX RELAY  (workers/outbox-relay.worker.ts)
   polls outbox_events (processed=false, error_count<3, SKIP LOCKED)
        │
        ├─ normalizeLegacyOutbox(record)  ──▶ CanonicalEventEnvelope   [NEW 0A]
        ├─ dispatch by eventType:
        │     ADD_TO_TIMELINE_COMMAND      → TimelineCommandHandler
        │     EVALUATE_RULE_COMMAND        → RuleCommandHandler
        │     SEND_NOTIFICATION_COMMAND     → NotificationCommandHandler
        │     INDEX/DELETE_DOCUMENT_COMMAND → SearchCommandHandler
        │     default                       → eventBus.publish (envelope-derived)
        ├─ on success: processed=true + deliveryStatus='PROCESSED'
        └─ on error_count>=3: deliveryStatus='DEAD_LETTERED' + persist dead_letter_events  [0A]
                                            │
                                            ▼
                         CONSUMERS (unchanged in 0A)
   timeline.worker (dedup by correlationId) · rules-worker · notification.worker · search.worker
   escalation.worker / followup.worker (use EventService.publish → EventLog + Redis)
```

## Stores (must stay distinct — NOT duplicate sources of truth)
- **OutboxEvent** (`outbox_events`): durable write-ahead of state changes → relay → consumers.
- **EventLog** (`event_logs`): append-only operational event record (repair: added `idempotency_key`, `metadata`).
- **TimelineEvent** (`timeline_events`): clinical longitudinal stream, written ONLY by `timeline.worker.ts:424` (unchanged).
- **AuditLog** (`audit_logs`): security/audit trail (unchanged).
- **dead_letter_events** (NEW 0A): exhausted outbox events, not silently dropped.

## Canonical envelope touch-points
- Introduced at the relay (`normalizeLegacyOutbox`) — single, safe injection point.
- Exposed to new producers via `buildCanonicalOutbox`.
- Consumed downstream in 0B (no consumer changes in 0A).
