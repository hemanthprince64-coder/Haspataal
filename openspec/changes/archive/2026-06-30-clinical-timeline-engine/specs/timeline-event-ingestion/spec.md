## ADDED Requirements

### Requirement: Timeline events are immutable and append-only
The system SHALL only allow INSERT operations on `TimelineEvent` records. No UPDATE or DELETE operations SHALL be permitted at any application or database layer. Amendments SHALL create a new `TimelineEvent` row with an `amendedEventId` field referencing the original.

#### Scenario: Module publishes a new event
- **WHEN** a module calls `TimelinePublisher.publish(event)`
- **THEN** the system SHALL validate the event payload against `TimelineEventSchema` (Zod)
- **THEN** the system SHALL enqueue the event on the `timeline-ingestion` BullMQ queue
- **THEN** the system SHALL return a `correlationId` confirming acceptance

#### Scenario: Duplicate event is detected
- **WHEN** a `correlationId` that already exists in `TimelineEvent` is received
- **THEN** the system SHALL skip the INSERT and return `{ duplicate: true }`
- **THEN** NO new row SHALL be created

#### Scenario: Event payload fails schema validation
- **WHEN** a module publishes an event missing required fields (`patientId`, `eventType`, `title`, `timestamp`)
- **THEN** the worker SHALL reject the job and route it to the dead-letter queue
- **THEN** the system SHALL emit a Sentry error with payload details (PHI redacted)

### Requirement: All Haspataal modules can publish timeline events
The system SHALL provide a shared `@haspataal/timeline` package exporting a `TimelinePublisher` class with a typed `publish(event: TimelineEventInput)` method. Every module (Lab, Pharmacy, IPD, OT, Nursing, Billing, Discharge, Insurance) SHALL use this package.

#### Scenario: Lab module publishes LabCompleted event
- **WHEN** a lab result is finalized in `LabService.completeOrder()`
- **THEN** the lab module SHALL call `timeline.publish({ eventType: 'LAB_COMPLETED', patientId, ... })`
- **THEN** a `TimelineEvent` row SHALL be persisted within 5 seconds

#### Scenario: Unknown module publishes event
- **WHEN** a module publishes with an unrecognized `eventType`
- **THEN** the system SHALL accept it with `module: 'UNKNOWN'` tag and log a warning
- **THEN** the event SHALL still be persisted for future classification

### Requirement: FHIR R4 mapping metadata is stored per event
Every `TimelineEvent` SHALL include a `fhirResourceType` field and `fhirMapping` JSON column containing enough metadata to generate a valid FHIR R4 resource reference. Population is optional in v1 but the schema MUST support it.

#### Scenario: Consultation event with FHIR mapping
- **WHEN** a `CONSULTATION_COMPLETED` event is ingested
- **THEN** the system SHALL store `fhirResourceType: 'Encounter'` and `fhirMapping: { resourceId, status, class }` on the `TimelineEvent` row

### Requirement: De-duplication via correlationId
Every `TimelineEvent` SHALL have a unique `correlationId` (UUID). The ingestion worker SHALL check for existing `correlationId` before INSERT to prevent duplicate events from retry storms.

#### Scenario: BullMQ retry produces duplicate publish
- **WHEN** a job is retried after transient Redis failure
- **THEN** the worker SHALL detect the existing `correlationId` in the DB
- **THEN** the worker SHALL skip INSERT and mark the job `completed`
