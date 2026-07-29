# Phase 0A: Migration Plan

## 1. Executive Summary
This document outlines the migration strategy for rolling out the Phase 0A Event System Standardization, focusing on establishing the Canonical Event Contract, Outbox Pattern, and Idempotency guarantees without disrupting existing legacy flows.

## 2. Migration Strategy
**Approach:** Parallel Run & Dark Launch
* **Phase 1: Infrastructure Provisioning:** Deploy Outbox tables and DLQ (Dead Letter Queue) infrastructure.
* **Phase 2: Dark Launch (Producers):** Update producers to write to both the legacy event logs and the new Outbox tables.
* **Phase 3: Relay Activation:** Enable the Relay workers to process the Outbox and publish to the canonical event bus.
* **Phase 4: Consumer Opt-in:** Consumers begin migrating to read from the canonical bus, utilizing the new Idempotency framework.
* **Phase 5: Legacy Deprecation:** (Targeted for Phase 0B/1) Remove dual-writes.

## 3. Rollout Schedule
| Step | Component | Action | Risk Level | Rollback Plan |
|---|---|---|---|---|
| 1 | DB Schema | Apply Outbox/Idempotency migrations | Low | Revert schema if empty |
| 2 | Producers | Deploy dual-write logic | Medium | Feature flag toggle |
| 3 | Relay | Start Relay workers (Dark mode) | Medium | Stop Relay service |
| 4 | Consumers | Deploy updated consumers | High | Revert to legacy topics |

## 4. Cutover Procedure
1. Ensure metrics for Outbox processing latency are stable.
2. Validate DLQ is not accumulating unprocessable events unnecessarily.
3. Transition consumer feature flags from `legacy_eventlog` to `canonical_outbox`.

## 5. Contingency Plans
* **High Relay Latency:** Scale relay instances; temporarily disable non-critical event emission.
* **Idempotency Collisions:** Alert on false-positive duplicates; fallback to manual DLQ inspection.
