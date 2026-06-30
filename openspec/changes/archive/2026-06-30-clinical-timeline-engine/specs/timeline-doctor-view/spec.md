## ADDED Requirements

### Requirement: Doctor can view clinical timeline for any of their patients
The system SHALL provide `GET /api/timeline/doctor/[patientId]` returning the clinical timeline for a patient. The response SHALL be scoped to the requesting doctor's hospital unless the patient has explicitly consented to cross-hospital sharing. Access requires a `session_user` JWT with role `DOCTOR` or `SENIOR_DOCTOR`.

#### Scenario: Doctor opens patient clinical timeline
- **WHEN** a doctor with valid `session_user` (role=DOCTOR) calls `GET /api/timeline/doctor/[patientId]`
- **THEN** the system SHALL return clinical events for that patient scoped to the doctor's `hospitalId`
- **THEN** events SHALL include: CONSULTATION, DIAGNOSIS, PRESCRIPTION, LAB_COMPLETED, RADIOLOGY_COMPLETED, PROCEDURE, SURGERY, ADMISSION, DISCHARGE

#### Scenario: Doctor without patient relationship attempts access
- **WHEN** a doctor who has never treated the patient attempts to view their timeline
- **THEN** the system SHALL return `403 Forbidden` if no active consultation or admission exists for that doctor-patient pair

### Requirement: Doctor timeline shows clinical highlights and critical alerts
The response SHALL include a `clinicalHighlights` object summarizing: active medications count, chronic diagnoses, last lab abnormalities, known allergies, and any `CRITICAL` severity events in the last 90 days.

#### Scenario: Patient has critical lab value on timeline
- **WHEN** a `LAB_COMPLETED` event with `severity: 'CRITICAL'` exists within the last 90 days
- **THEN** the `clinicalHighlights.criticalAlerts` array SHALL include that event's title and timestamp

### Requirement: Doctor can view AI-ready clinical summary
The API SHALL return a structured `clinicalSummary` object containing the last 5 diagnoses (ICD codes), active prescriptions, last 3 lab panels, and last admission reason. This structure is designed for future LLM prompt injection.

#### Scenario: Doctor requests clinical summary for patient
- **WHEN** `GET /api/timeline/doctor/[patientId]?summary=true` is called
- **THEN** the response SHALL include `clinicalSummary: { diagnoses: [], medications: [], labs: [], lastAdmission: {} }`
