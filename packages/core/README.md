# @haspataal/core

## Purpose
The Clean Architecture domain layer. Houses pure business logic, entities, and use cases that are independent of any framework, database, or external service.

## Public API
- `domain/entities`: `Patient`, `Encounter`, `ClinicalOrder`
- `domain/use-cases`: `GetPatientTimelineUseCase`, `CreateEncounterUseCase`
- `domain/events`: `DomainEvent` schemas

## Dependencies
- `@haspataal/types` (Zod schemas)

## Prohibited Dependencies
- `next`, `react`
- `@prisma/client`, `@haspataal/db`

## State Machines
- `EncounterStateMachine`
- `ClinicalOrderStateMachine`
- `PharmacyStateMachine`

## Events Published
- `ENCOUNTER_CREATED`
- `ORDER_PLACED`
- `RESULTS_PUBLISHED`

## Tests
- Unit tests run via `Vitest`. Should mock infrastructure (repositories).
