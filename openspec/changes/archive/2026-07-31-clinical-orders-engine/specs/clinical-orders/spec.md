## ADDED Requirements

### Requirement: Unified Clinical Order Placement
The system SHALL support the creation of a `ClinicalOrder` with a required `type` (LAB, RADIOLOGY, PROCEDURE, PHARMACY), `status`, and `priority` (ROUTINE, URGENT, STAT). The payload SHALL NOT store clinical results, which must reside in downstream modules linking via `resultReferenceId`.

#### Scenario: Placing a STAT lab order
- **WHEN** a doctor requests an urgent CBC blood test
- **THEN** the system SHALL create a `ClinicalOrder` with priority `STAT` and status `ORDERED`.

### Requirement: Order Ownership Tracking
The system SHALL track ownership across the order lifecycle using `requestedBy`, `assignedTo`, `performedBy`, and `verifiedBy`.

#### Scenario: Assigning an order to a technician
- **WHEN** a lab technician starts working on a blood test
- **THEN** the `assignedTo` field SHALL be populated with the technician's ID and status transitions to `IN_PROGRESS`.

### Requirement: Detailed Order State Transitions
The system SHALL support the following standard statuses: `ORDERED`, `ACCEPTED`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `REJECTED`. 

#### Scenario: Rejecting a malformed order
- **WHEN** a sample is damaged
- **THEN** the lab can transition the status to `REJECTED` with a corresponding `reason`.

### Requirement: Granular Timeline Integration
The system SHALL emit standard Timeline events for *every* order state transition (e.g. `CLINICAL_ORDER_CREATED`, `CLINICAL_ORDER_ACCEPTED`, `CLINICAL_ORDER_STARTED`, `CLINICAL_ORDER_COMPLETED`, `CLINICAL_ORDER_CANCELLED`).

#### Scenario: Order acceptance appears on timeline
- **WHEN** a Radiology department accepts an X-ray order
- **THEN** a `CLINICAL_ORDER_ACCEPTED` event SHALL be published to the `EventLog` for timeline consumption.
