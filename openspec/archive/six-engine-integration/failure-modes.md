# Failure Mode Matrix

This matrix defines the required behavior for every critical dependency interaction when the dependency fails. We never silently guess.

| Dependency Failure | Impacted Capability | Prescribed Behavior | Clinical Safety Note |
|---|---|---|---|
| **Configuration Cache (Redis) Down** | Engine Configuration | **Use Last-Known-Good State.** Fallback to in-memory cache until TTL expires, then use safe hardcoded defaults. | Fail-safe behavior where clinically appropriate. |
| **Configuration Service (DB) Down** | Engine Configuration | **Degrade Gracefully.** Rely entirely on Redis cache. Alert. | No immediate impact if cache is warm. |
| **Event Bus (Redis Stream) Unavailable**| Outbox Relay | **Queue for Retry.** Outbox table accumulates events. Relay stalls until restored. | No data loss, but workflows are delayed. |
| **Search Index Stale / Down** | Portal Search | **Degrade Gracefully.** Fallback to direct DB query (where permitted by performance) or Fail Closed with a user message. | Clinical workflows should not block on search. |
| **Notification Provider (WhatsApp/SMS) Down** | Notify Engine Delivery | **Queue for Retry & Failover.** If WhatsApp fails, attempt SMS. If both fail, queue in DLQ. | Critical alerts must have internal dashboard fallbacks. |
| **Rules Worker Unavailable** | Clinical Decision Support | **Queue for Retry.** Events accumulate in Inbox. | Alerts will be delayed; doctors should be warned. |
| **Timeline Consumer Delayed** | Timeline Projection | **Degrade Gracefully.** BFF Timeline will be out-of-sync. | UI must indicate "Data may be up to X minutes old" if lag is high. |
| **Journey Worker Fails** | Care Pathways | **Queue for Retry.** Journey tasks accumulate. | No data loss; tasks will be dispatched once restored. |
| **Core Database (Postgres) Unavailable**| All Writes / Missed Cache Reads| **Fail Closed.** Block operation and return `DependencyUnavailableError`. | Write operations cannot proceed without persistence. |

## Classification Definitions
- **Fail Closed**: The operation is aborted to maintain security or data integrity.
- **Fail Safe**: The operation proceeds using a safe default that minimizes clinical risk.
- **Degrade Gracefully**: The primary feature fails, but the surrounding application remains functional (e.g. search is down, but direct navigation works).
- **Queue for Retry**: The intent is saved and will automatically recover when the dependency is restored.
- **Use Last-Known-Good State**: Continue using stale configuration rather than crashing.
