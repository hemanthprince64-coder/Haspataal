## ADDED Requirements

### Requirement: Patient Timeline Retrieval
The system SHALL provide a RESTful API (`GET /api/hospital/patients/{patientId}/timeline`) to retrieve a chronological timeline of clinical events for a specific patient.
Events SHALL be sourced from the `EventLog` and structured as `ClinicalTimelineEvent`.
The API SHALL support pagination and filtering by category.

#### Scenario: Doctor views patient timeline
- **WHEN** a doctor requests the timeline for an assigned patient
- **THEN** the system returns a chronologically ordered list of clinical events grouped by visit.

### Requirement: Timeline Event Categories
The system SHALL categorize timeline events into specific, standardized categories: BOOKING, TRIAGE, CONSULTATION, DIAGNOSIS, PRESCRIPTION, INVESTIGATION, LAB, RADIOLOGY, PROCEDURE, BILLING, DISCHARGE, FOLLOWUP, ALERT, SYSTEM.

#### Scenario: Filtering timeline by category
- **WHEN** a user filters the timeline API by `category=DIAGNOSIS`
- **THEN** the system returns only timeline events matching the DIAGNOSIS category.

### Requirement: Timeline UI Rendering
The Patient EMR Workspace SHALL display the clinical timeline using visually distinct, color-coded cards for different event types, grouped by Visit (encounter).

#### Scenario: Render timeline events grouped by visit
- **WHEN** the timeline data is loaded
- **THEN** the UI displays a visit header (e.g., "31 July") followed by sequentially ordered, color-coded event cards for that visit.
