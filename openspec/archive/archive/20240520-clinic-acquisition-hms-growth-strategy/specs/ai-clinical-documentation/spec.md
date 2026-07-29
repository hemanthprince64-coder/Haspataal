## ADDED Requirements

### Requirement: AI-generated discharge summaries for clinics
The system SHALL provide AI-generated discharge summaries from unstructured clinical input (doctor's voice, typed notes, or existing EMR data), formatted to clinic standards and requiring doctor approval before finalization.

#### Scenario: Doctor dictates discharge notes
- **WHEN** a doctor speaks or types discharge notes in natural language during a patient's final visit
- **THEN** the system SHALL call the AI Documentation service, which SHALL return a structured discharge summary with fields: Diagnosis, Treatment Summary, Medications, Follow-up Instructions; the doctor MUST approve before saving

### Requirement: AI-assisted OPD note drafting
The system SHALL draft structured OPD notes from the doctor's input during or after a consultation, auto-populating sections like Chief Complaint, History, Examination, Assessment, and Plan.

#### Scenario: Doctor completes OPD consult
- **WHEN** a doctor marks an OPD visit as complete and clicks "Generate Note"
- **THEN** the system SHALL call the AI Documentation service and return a draft OPD note; doctor SHALL review and either edit or confirm

### Requirement: AI prescription drafting with drug safety guardrails
The system SHALL suggest prescriptions based on the OPD note and diagnosis, checking for known drug allergies, pregnancy considerations, and pediatric dosing limits before suggesting.

#### Scenario: AI suggests prescription with contraindication flag
- **WHEN** the AI service suggests a prescription and the patient's profile indicates a known allergy to penicillin
- **THEN** the system SHALL add a red contraindication warning to the suggestion and require doctor confirmation before proceeding

### Requirement: AI service SLA and monitoring
The AI Documentation service SHALL respond to 95% of requests within 3 seconds and log all interactions for audit. Service availability SHALL be monitored via Sentry and Prometheus.

#### Scenario: AI service timeout
- **WHEN** the AI service does not respond within 5 seconds
- **THEN** the system SHALL surface a fallback message to the doctor: "AI suggestion unavailable. Please type notes manually." and log the timeout in Sentry
