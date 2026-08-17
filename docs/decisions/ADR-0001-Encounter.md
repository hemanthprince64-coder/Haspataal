---\nversion: 2.0\nowner: Haspataal Engineering\nlast_updated: 2026-08-04\nstatus: Active\n---\n
# ADR-0001: Encounter as Central Anchor

## Status
Accepted

## Context
The platform was scaling clinical features but lacked a standardized architectural anchor for clinical events and data. `Visit` and `Appointment` models were being incorrectly used as anchors, and the timeline system lacked standard schema structures.

## Decision
Created `Encounter` as the true central anchor for all clinical workflows (Vitals, Diagnosis, Prescriptions, Orders, Notes, Summary). Added `EncounterGuard` and `EncounterStateMachine` to centralize business rules for encounter transitions.

## Alternatives Considered
Continuing to use `Appointment` would cause data structure collisions for walk-in patients or multi-day IPD events where appointment boundaries blur.

## Consequences
- Requires strict adherence to `EncounterGuard` in all new consultation use cases.
- `GetPatientTimelineUseCase` maps EventLog fields based on `encounterId`.

## Migration Notes
None

## Related Packages
- @haspataal/core

## Related ADRs
None
