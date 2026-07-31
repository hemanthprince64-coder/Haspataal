## 1. Encounter Domain Setup

- [x] 1.1 Update `schema.prisma` to include `Encounter` model (patientId, hospitalId, optional appointmentId, encounterType, status, startedAt, endedAt).
- [x] 1.2 Define `EncounterType` enum (OPD, IPD, EMERGENCY, TELECONSULTATION, HOME_VISIT, DAYCARE, FOLLOW_UP).
- [x] 1.3 Create `@haspataal/encounter` package.
- [x] 1.4 Implement `CreateEncounterUseCase` and `GetActiveEncounterUseCase`.

## 2. Clinical Orders & Tasks Domain Setup

- [x] 2.1 Update `schema.prisma` to include `ClinicalOrder` model (fields: type, status, priority, requestedAt, scheduledAt, startedAt, completedAt, cancelledAt, reason, payload, resultReferenceId).
- [x] 2.2 Update `schema.prisma` to include ownership fields on `ClinicalOrder` (`requestedBy`, `assignedTo`, `performedBy`, `verifiedBy`).
- [x] 2.3 Update `schema.prisma` to include `ClinicalTask` model for nursing/workflow activities.
- [x] 2.4 Create `@haspataal/orders` package.
- [x] 2.5 Define `ClinicalOrderType`, `ClinicalOrderStatus`, and `OrderPriority` enums in `packages/types/index.ts`.
- [x] 2.6 Implement `PlaceClinicalOrderUseCase` to emit `CLINICAL_ORDER_CREATED`.
- [x] 2.7 Implement `UpdateClinicalOrderStatusUseCase` to emit transitions (ACCEPTED, STARTED, COMPLETED, CANCELLED).

## 3. Consultation Integration

- [x] 3.1 Update `CheckInUseCase` in `@haspataal/consultation` to create an `Encounter` instead of using `Visit`.
- [x] 3.2 Update Consultation workflows to group Clinical Notes, Orders, and Follow-ups under `Encounter`.
- [x] 3.3 Create new Server Actions for placing Lab/Radiology orders from the EMR Workspace.

## 4. UI & Timeline Updates

- [x] 4.1 Update EMR Workspace Sidebar to anchor to `Encounter`.
- [x] 4.2 Add UI components to EMR Workspace for doctors to place Clinical Orders with Priority.
- [x] 4.3 Ensure Timeline components can parse all order transition events (ACCEPTED, STARTED, etc.).

## 5. Phase 7.5 - Stabilization Sprint (Database)

- [x] 5.1 Update `schema.prisma`: Add `EncounterSummary` model (summaryMarkdown, summaryJson, version).
- [x] 5.2 Update `EventLog` model: Add `schemaVersion`, `encounterId`, `aggregateId`, `aggregateType`.
- [x] 5.3 Update `ClinicalOrder` model: Add `version` for optimistic locking.
- [x] 5.4 Update `schema.prisma`: Add composite indexes for Encounter, ClinicalOrder, EventLog.
- [x] 5.5 Update `packages/types/index.ts`: Add `TRIAGE`, `CONSULTATION` to EncounterStatus; `VERIFIED` to ClinicalOrderStatus.

## 6. Phase 7.5 - Stabilization Sprint (Core Abstractions)

- [x] 6.1 Update `TimelinePublisher`: Accept new `TimelineEvent` interface (`schemaVersion`, `aggregateId`, etc.).
- [x] 6.2 Implement `EncounterGuard`: Add `requireActiveEncounter`, `requireEncounterDoctor`, `requireEncounterNotCompleted`.
- [x] 6.3 Implement `EncounterStateMachine`: `CREATED -> CHECKED_IN -> TRIAGE -> CONSULTATION -> COMPLETED`.
- [x] 6.4 Implement `ClinicalOrderStateMachine`: `ORDERED -> ACCEPTED -> IN_PROGRESS -> VERIFIED -> COMPLETED`.

## 7. Phase 7.5 - Stabilization Sprint (Use Cases)

- [x] 7.1 Update Consultation Use Cases (`RecordVitals`, `AddDiagnosis`, `PrescribeMedication`) to use `EncounterGuard` and `TimelinePublisher`.
- [x] 7.2 Update Order Use Cases (`PlaceClinicalOrder`, `UpdateClinicalOrderStatus`) to use `ClinicalOrderStateMachine`.
- [x] 7.3 Update `UpdateClinicalOrderStatusUseCase` to use `ClinicalOrderStateMachine` and optimistic locking (using `version`).
- [x] 7.4 Implement `GenerateEncounterSummaryUseCase` (Markdown/JSON) and call it from `CompleteConsultationUseCase`.

## 8. Phase 7.5 - Stabilization Sprint (UI)

- [x] 8.1 Update `ClinicalOrdersList.tsx` to display pending/accepted/in progress/completed sections, priority badges, and duration (e.g. "Waiting 17 minutes").
- [x] 8.2 Verify timeline components render the new standardized events.
