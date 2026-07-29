## ADDED Requirements

### Requirement: Multi-doctor scheduling in clinic
The system SHALL support multiple visiting doctors in a single clinic, each with their own schedule, patient list, and fee structure, while sharing a common EMR and clinic-level billing.

#### Scenario: Clinic owner adds a visiting doctor
- **WHEN** a clinic admin adds a visiting doctor to the clinic
- **THEN** the system SHALL create a doctor profile scoped to that clinic, assign a schedule, and link the doctor to the clinic's shared EMR

#### Scenario: Patient books with specific doctor in multi-doctor clinic
- **WHEN** a patient books an appointment in a multi-doctor clinic and selects a specific doctor
- **THEN** the system SHALL book the slot under that doctor's schedule and assign the patient to that doctor's queue

### Requirement: Cross-speciality coordination
The system SHALL allow doctors within the same clinic to share patient records and collaborate on care, with appropriate consent and role-based access controls.

#### Scenario: Doctor A refers patient to Doctor B in same clinic
- **WHEN** Doctor A marks a patient as "Referred to [Doctor B — Cardiology]"
- **THEN** the system SHALL log a `REFERRAL_INTERNAL` event, add the referral to Doctor B's queue, and share the relevant EMR sections with Doctor B while maintaining PHI audit trail

### Requirement: Clinic revenue analytics
The system SHALL provide a unified revenue analytics dashboard for the clinic owner, covering all doctors, services, pharmacy, and lab revenue, with per-doctor and per-service breakdowns.

#### Scenario: Clinic owner views monthly revenue breakdown
- **WHEN** a clinic owner navigates to Analytics > Revenue
- **THEN** the system SHALL render a dashboard with: total clinic revenue (last 30 days), revenue by doctor (bar chart), revenue by service (OPD, lab, pharmacy), and monthly trend
