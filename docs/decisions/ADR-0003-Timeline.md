Version: 1.0
Owner: Haspataal Engineering
Last Updated: 2026-07

# ADR-0003: Clinical Timeline Events

## Context
The `EventLog` table was primarily used for backend auditing, but the front-end required a unified "Clinical Timeline" to show a patient's medical history (Vitals -> Diagnosis -> Orders) sequentially.

## Decision
Standardized `ClinicalTimelineEvent` to include `schemaVersion`, `aggregateId`, `aggregateType`, and `encounterId`. Refactored `GetPatientTimelineUseCase` to map raw EventLog fields into standard `ClinicalTimelineEvent`s for UI consumption.

## Alternatives
A dedicated `Timeline` table was rejected because it would require triple-writes (Postgres, Redis, Postgres Timeline), introducing sync issues. The `EventLog` is already the single source of truth.

## Consequences
- Timeline UI components (`TimelineSidebar`) can render grouped data safely based on standard abstractions.
- Event schemas must remain backwards compatible or rely on `schemaVersion` for UI branching.
