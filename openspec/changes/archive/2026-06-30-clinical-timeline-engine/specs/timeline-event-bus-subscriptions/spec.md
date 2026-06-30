## ADDED Requirements

### Requirement: BullMQ worker consumes all Haspataal event channels
The system SHALL implement `workers/timeline.worker.ts` that subscribes to all channels in `@haspataal/events` via BullMQ. For each received event, the worker SHALL transform the domain payload into a normalized `TimelineEventInput` and call `TimelineRepository.create()`.

#### Scenario: AppointmentCreated event is consumed
- **WHEN** `AppointmentCreated` event arrives on the BullMQ queue
- **THEN** the worker SHALL map it to `{ eventType: 'APPOINTMENT_CREATED', category: 'APPOINTMENT', title: 'Appointment with Dr. X', ... }`
- **THEN** a `TimelineEvent` row SHALL be inserted

#### Scenario: Worker handles unknown event type gracefully
- **WHEN** an event type has no registered transformer in the worker's map
- **THEN** the worker SHALL insert the event with `category: 'UNKNOWN'` and `module: event.module`
- **THEN** NO job failure SHALL occur; a warning SHALL be logged

### Requirement: All existing Haspataal events have transformer mappings
The worker SHALL implement transformers for: `AppointmentCreated`, `ConsultationCompleted`, `PrescriptionCreated`, `LabOrdered`, `LabCompleted`, `SampleCollected`, `RadiologyOrdered`, `RadiologyCompleted`, `PatientAdmitted`, `DischargeCompleted`, `BillingCompleted`, `DrugDispensed`, `VaccinationGiven`, `CareJourneyUpdated`, `RetentionTriggered`.

#### Scenario: LabCompleted event transformer
- **WHEN** `LabCompleted` event arrives with `{ labOrderId, patientId, hospitalId, testName, result, isAbnormal }`
- **THEN** the transformer SHALL produce `{ eventType: 'LAB_COMPLETED', category: 'INVESTIGATION', title: testName, severity: isAbnormal ? 'HIGH' : 'LOW', entityType: 'LabOrder', entityId: labOrderId }`

### Requirement: Dead-letter queue handles permanently failed events
Events that fail ingestion after 3 retry attempts SHALL be moved to the `timeline-ingestion-dlq` BullMQ queue. Failed events SHALL have PHI-redacted payloads stored in `TimelineAudit` with `action: 'INGESTION_FAILED'`.

#### Scenario: Event fails 3 times
- **WHEN** a BullMQ job fails on the 3rd retry attempt
- **THEN** the job SHALL be moved to `timeline-ingestion-dlq`
- **THEN** a `TimelineAudit` row SHALL be inserted with `action: 'INGESTION_FAILED'` and sanitized payload
- **THEN** Sentry SHALL receive an alert with `level: error`
