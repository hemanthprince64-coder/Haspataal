## ADDED Requirements

### Requirement: Smart appointment queue for clinics
The system SHALL provide a smart appointment queue with token management and real-time status display, replacing the current "slot-based" hospital system with a continuous queue where next-patient is auto-populated.

#### Scenario: Patient arrives at clinic
- **WHEN** a patient checks in at the clinic reception
- **THEN** the system SHALL assign a token number and auto-add them to the current doctor's queue, updating the queue in real-time on the doctor's screen

#### Scenario: Doctor marks patient as "next"
- **WHEN** a doctor clicks "Next Patient" in the clinic queue UI
- **THEN** the system SHALL advance the token, mark the previous patient as completed, and auto-open the next patient's EMR in the left panel

### Requirement: Quick prescription templates for rapid OPD
The system SHALL provide configurable quick prescription templates that doctors can apply with a single click, reducing prescription entry time to under 30 seconds.

#### Scenario: Doctor selects quick template
- **WHEN** a doctor opens the prescription screen and selects a pre-built template (e.g., "Fever — Paracetamol + ORS")
- **THEN** the system SHALL auto-fill drug, dose, frequency, and duration; doctor can edit or approve with one click

### Requirement: AI-assisted documentation in clinic OPD
The system SHALL use the new AI Documentation microservice to suggest OPD notes, discharge summaries, and prescription text based on the doctor's spoken or typed input.

#### Scenario: Doctor dictates OPD notes
- **WHEN** a doctor speaks or types patient symptoms in plain language
- **THEN** the system SHALL call the AI Documentation service and suggest a structured OPD note in real-time; the doctor can edit or accept

#### Scenario: AI-generated document requires doctor review
- **WHEN** an AI-generated document is produced
- **THEN** the system SHALL mark it with `AI_ASSISTED` and require an explicit doctor "Approve & Save" action before the document is stored as final
