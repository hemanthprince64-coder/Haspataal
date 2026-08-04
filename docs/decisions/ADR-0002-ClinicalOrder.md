---\nversion: 2.0\nowner: Haspataal Engineering\nlast_updated: 2026-08-04\nstatus: Active\n---\n
# ADR-0002: Clinical Orders Engine

## Status
Accepted

## Context
When doctors order labs, radiology, or pharmacy items, the lifecycle of these requests (Ordered -> Accepted -> In Progress -> Completed) was being tracked via disparate status enums scattered across multiple tables, leading to inconsistent UI states.

## Decision
Created a unified `ClinicalOrder` entity. Added `ClinicalOrderStateMachine` to manage order lifecycles strictly. Added a `version` field to `ClinicalOrder` to enforce optimistic locking and handle concurrent updates to order statuses.

## Alternatives Considered
Using specialized tables (`LabOrder`, `RadiologyOrder`) was considered but rejected because it duplicates state machine logic and makes the consolidated patient timeline harder to query.

## Consequences
- Any new department (e.g., Blood Bank) can hook into the existing `ClinicalOrderStateMachine`.
- Optimistic locking requires robust error handling on the client (retry on version mismatch).

## Migration Notes
None

## Related Packages
- @haspataal/core

## Related ADRs
None
