## ADDED Requirements

### Requirement: Outbox replay verification
The outbox replay system SHALL correctly reprocess all events from any point in time without data loss or duplication.

#### Scenario: Outbox replay from checkpoint
- **WHEN** replay is initiated from event ID 5000 with 10,000 total events
- **THEN** all 5,000 events are reprocessed correctly

### Requirement: Consumer replay
BullMQ consumers SHALL support replay from a specific message ID. Replayed messages SHALL be processed with correct idempotency.

#### Scenario: Consumer replay
- **WHEN** consumer is replayed from message ID 1000
- **THEN** messages 1000-2000 are reprocessed without side effects on already-processed messages

### Requirement: Projection rebuild
Event projections SHALL be rebuildable from the outbox without manual intervention. Rebuild SHALL complete within acceptable time limits.

#### Scenario: Projection rebuild
- **WHEN** projection state is corrupted
- **THEN** projection is rebuilt from outbox events within 10 minutes for 1 million events

### Requirement: Dead-letter replay
Dead-letter queue messages SHALL be retryable after root cause resolution. Retry SHALL preserve message order and idempotency.

#### Scenario: Dead-letter replay
- **WHEN** DLQ message is retried after fixing downstream dependency
- **THEN** message is processed successfully and removed from DLQ

### Requirement: Worker crash recovery
Workers SHALL recover from crashes without manual intervention. In-progress jobs SHALL be requeued or completed based on their state.

#### Scenario: Worker crash recovery
- **WHEN** worker process crashes while processing job
- **THEN** job is requeued and processed by another worker instance

### Requirement: Database restart recovery
The system SHALL recover from database restart without data loss. In-flight transactions SHALL be rolled back. Outbox events SHALL not be lost.

#### Scenario: Database restart recovery
- **WHEN** PostgreSQL restarts during active transaction
- **THEN** transaction is rolled back, data is consistent, no events are lost

### Requirement: Mid-transaction rollback
Transactions SHALL be fully rolled back on failure. Partial commits SHALL not leave inconsistent state.

#### Scenario: Transaction rollback
- **WHEN** database operation fails mid-transaction
- **THEN** all changes in the transaction are rolled back

### Requirement: Idempotency
All event handlers and API endpoints SHALL be idempotent. Duplicate events or requests SHALL not create duplicate data or side effects.

#### Scenario: Idempotent event handling
- **WHEN** same event is delivered twice
- **THEN** second delivery has no additional effect

### Requirement: Concurrent replay safety
Multiple concurrent replay operations SHALL not interfere with each other or with live event processing.

#### Scenario: Concurrent replay
- **WHEN** two replay operations run concurrently
- **THEN** both complete correctly without data corruption

### Requirement: Replay interruption and resume
Replay operations SHALL support interruption and resume from the last successfully processed event.

#### Scenario: Replay resume
- **WHEN** replay is interrupted at event 7500 of 10,000
- **THEN** resumed replay starts from event 7501
