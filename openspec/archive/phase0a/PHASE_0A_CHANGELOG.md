# Phase 0A: Changelog

## [0.1.0-alpha] - Event System Standardization Phase 0A

### Added
- **Canonical Event Contract:** Defined standard JSON schema (`v1.0`) for all domain events.
- **Outbox Pattern:** Introduced `outbox_events` table for reliable, transactional event publishing.
- **Relay Workers:** Added background worker service to poll/tail the Outbox and publish to the message broker.
- **Idempotency Framework:** Added `idempotency_keys` table and middleware for consumers to prevent duplicate processing.
- **DLQ (Dead Letter Queue) Management:** Formalized DLQ state model and introduced `dlq_events` table for manual intervention.

### Changed
- **Producer Inventory:** Updated core domain services (Patient, Appointment, Billing) to dual-write to the Outbox.
- **Legacy Normalization:** Applied translation layer to map legacy event formats to the Canonical Contract.

### Deprecated
- **Direct Broker Publishing:** Emitting events directly from application code to the broker without transactional guarantees is now deprecated.
- **Legacy EventLog:** The old `event_logs` table is marked for deprecation in Phase 0B.

### Fixed
- **Lost Updates:** Resolved issues where events were lost if the application crashed between DB commit and broker publish.
- **Duplicate Processing:** Mitigated side-effects from at-least-once delivery semantics via strict idempotency checks.
