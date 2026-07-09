# Phase 0B: Handoff Document

## 1. Purpose
This document serves as the formal transition from Phase 0A (Infrastructure & Standardization) to Phase 0B (Adoption & Scaling) for the Event System.

## 2. Phase 0A Accomplishments
* Deployed Outbox Pattern and Relay Workers.
* Established the Canonical Event Contract.
* Implemented the Idempotency Framework and DLQ state model.
* Configured dual-writes for critical producers.

## 3. Prerequisites Met for Phase 0B
- [x] Infrastructure is provisioned and verified.
- [x] Canonical schema is published to the schema registry.
- [x] Monitoring and alerting for Relay latency and DLQ depth are active.

## 4. Phase 0B Objectives (Next Steps)
Phase 0B should focus on widespread adoption and legacy decommissioning.

1. **Consumer Migration:** Transition all downstream consumers (Notification, Billing, Analytics) to consume the Canonical Events via the new Idempotency framework.
2. **Turn off Dual-Writes:** Once all consumers are migrated, update producers to exclusively write to the Outbox, ceasing writes to the legacy `event_logs`.
3. **Legacy Data Archival:** Archive and drop the legacy `event_logs` table.
4. **DLQ Tooling UI:** Develop an admin interface for Support to inspect, replay, or discard DLQ messages efficiently.
5. **Event Choreography Mapping:** Document the end-to-end event choreography for complex sagas (e.g., Discharge Process) using the new standardized events.

## 5. Known Technical Debt / Deferred Items
* **Relay Polling vs. CDC:** Currently using polling for the Outbox. Phase 1 may need to investigate CDC (Change Data Capture like Debezium) if throughput exceeds 10k events/sec.
* **Schema Evolution:** A formal strategy for backwards-incompatible schema changes needs to be finalized.
