## Why

Haspataal has successfully implemented the EMR Consultation State Machine (Phase 5) which captures structured clinical data at every step. However, this data is currently disjointed and lacks a longitudinal view. A Clinical Timeline is needed to unify these records into a chronological, navigatable patient journey grouped by visits, enabling clinicians to perform rapid historical reviews and audits.

## What Changes

- Create a dedicated `@haspataal/timeline` package to act as a read-model for clinical events.
- Aggregate existing `EventLog` records into normalized `ClinicalTimelineEvent`s.
- Introduce RESTful timeline API endpoints (`GET /api/hospital/patients/{patientId}/timeline`).
- Introduce visually distinct, color-coded event cards in the UI grouped by Visit (e.g. Vitals=Blue, Rx=Green, Alert=Red).

## Capabilities

### New Capabilities
- `clinical-timeline`: Aggregates, structures, and presents a chronological history of a patient's clinical interactions (visits, diagnoses, vitals, prescriptions, lab orders) sourced from the `EventLog`.

### Modified Capabilities

## Impact

- **API Gateway/Routes**: New read-only routes for patient timeline retrieval.
- **UI Components**: New `Timeline` component within the EMR Workspace.
- **Dependencies**: No new external dependencies required, utilizes existing `EventLog` table and `Event` schema.
