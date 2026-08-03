## Context

The Clinical Timeline aims to unify isolated clinical events for a patient into a single chronological view. Currently, this data is captured in the `EventLog` table. The goal is to build a read layer and UI presentation without altering the existing write paths.

## Goals / Non-Goals

**Goals:**
- Provide a `GET /api/hospital/patients/{patientId}/timeline` endpoint returning ordered clinical events.
- Define a `ClinicalTimelineEvent` interface that includes visit associations and standardized categories.
- Build a timeline UI component on the EMR Workspace sidebar, grouping events by Visit.
- Standardize event colors (e.g., Booking: Slate, Vitals: Blue, Prescription: Green).

**Non-Goals:**
- Do not migrate existing data (we will read from the `EventLog` directly).
- Timeline does not own business logic; it is strictly a read model over the `EventLog`.

## Decisions

- **Dedicated Package**: We will create `@haspataal/timeline` (Phase 6.1) to house the timeline domain logic, ensuring the `consultation` package remains focused purely on writes.
- **Event Sourcing**: Use PostgreSQL `EventLog` for the source of truth.
- **Visit Grouping**: The UI will group events by `visitId` to align with clinician mental models (encounters).
- **API Pagination**: The API will default to 50 events (Newest first) and support lazy-loading older events instead of page numbers.

## Risks / Trade-offs

- **[Risk] High Volume of Events**: For chronic patients, the timeline could become very long.
  - **Mitigation**: Lazy loading and default visit grouping ensures the UI remains performant by only showing the most relevant recent events.
