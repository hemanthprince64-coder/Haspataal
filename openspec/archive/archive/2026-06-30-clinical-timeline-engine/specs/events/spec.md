## MODIFIED Requirements

### Requirement: Events package exports typed event payloads with correlationId and sourceSystem
All event payloads exported from `@haspataal/events/src/index.ts` SHALL include required fields `correlationId: string` (UUID) and `sourceSystem: string` (e.g., `'hospital-hms'`, `'patient-portal'`). These fields are required for Timeline Engine de-duplication and audit traceability.

**Breaking change**: Existing modules that publish events without `correlationId` and `sourceSystem` MUST be updated. The `TimelinePublisher` SHALL auto-generate `correlationId` if missing (with a deprecation warning) to maintain backwards compatibility for a single release cycle.

#### Scenario: Module publishes event with correlationId
- **WHEN** a module calls `EventBus.emit('LabCompleted', { correlationId: uuidv4(), sourceSystem: 'hospital-hms', ...payload })`
- **THEN** the Timeline ingestion worker SHALL receive the `correlationId` for de-duplication checks

#### Scenario: Legacy module publishes event without correlationId
- **WHEN** an event arrives at the ingestion worker missing `correlationId`
- **THEN** the worker SHALL generate a UUID and assign it as `correlationId`
- **THEN** a deprecation warning SHALL be logged: `"[Timeline] Event received without correlationId from sourceSystem: undefined. Please update publisher."`
- **THEN** the event SHALL still be ingested (no data loss)
