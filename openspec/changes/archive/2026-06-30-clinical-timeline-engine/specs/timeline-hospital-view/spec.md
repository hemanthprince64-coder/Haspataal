## ADDED Requirements

### Requirement: Hospital staff can view visit history for patients at their hospital
The system SHALL provide `GET /api/timeline/hospital/[patientId]` returning all `TimelineEvent` rows where `hospitalId` matches the authenticated user's hospital. Access requires roles: `HOSPITAL_ADMIN`, `RECEPTIONIST`, `DOCTOR`, `NURSE`.

#### Scenario: Hospital receptionist checks patient's visit history
- **WHEN** a receptionist calls `GET /api/timeline/hospital/[patientId]`
- **THEN** the system SHALL return only events with `hospitalId` equal to the receptionist's hospital
- **THEN** events from other hospitals SHALL NOT appear

#### Scenario: Staff from Hospital A attempts to access Hospital B's patient timeline
- **WHEN** a hospital admin from Hospital A provides a patientId registered at Hospital B
- **THEN** RLS SHALL prevent any rows from being returned
- **THEN** the response SHALL be an empty `data: []` array with no error disclosure

### Requirement: Hospital view includes billing and administrative events
The hospital timeline SHALL include event categories: `ADMISSION`, `DISCHARGE`, `BILLING`, `PAYMENT`, `WARD_TRANSFER`, `INVESTIGATION`, `PROCEDURE` in addition to clinical events.

#### Scenario: Hospital reviews patient's billing history
- **WHEN** a billing staff member calls `GET /api/timeline/hospital/[patientId]?category=BILLING,PAYMENT`
- **THEN** only billing and payment events SHALL be returned in chronological order
