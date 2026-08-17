## Context

Currently, the Haspataal platform has a functional EMR workspace and a clinical timeline. However, the existing architecture tightly couples clinical activities (Vitals, Diagnosis, Prescriptions) directly to the Consultation state machine and Visit concepts. To prevent future fragmentation as we build specialized modules (Laboratory, Radiology, Pharmacy, Procedures), we need a centralized Clinical Orders Engine and an Encounter-based grouping model. This shifts the paradigm from ad-hoc service integration to a unified `ClinicalOrder` entity that flows through standard statuses.

## Goals / Non-Goals

**Goals:**
- Design a single `ClinicalOrder` domain model that supports `LAB`, `RADIOLOGY`, `PROCEDURE`, and `PHARMACY` types with strict ownership (`requestedBy`, `assignedTo`, `performedBy`, `verifiedBy`).
- Establish standard state transitions for orders (`ORDERED`, `ACCEPTED`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `REJECTED`).
- Introduce the `Encounter` domain as the central clinical anchor for a patient, completely decoupling from `Appointment` (which becomes optional).
- Introduce `ClinicalTask` for workflow and nursing activities.
- Ensure the Orders Engine dual-writes to the `EventLog` for every state transition to feed the Timeline and future Alerts/Billing modules.

**Non-Goals:**
- Do not build the full UI for the Laboratory or Radiology technician portals (those belong to Phase 8 and 9).
- Do not store laboratory results or reports inside the `ClinicalOrder` payload.

## Decisions

- **Encounter as the Anchor**: `Encounter` becomes the root container for all clinical records. `Appointment` is an optional predecessor (to support Emergency, OPD, IPD, Teleconsultation, etc.).
- **Unified ClinicalOrder Table**: We will use a single `ClinicalOrder` table with a `type` enum and a JSONB `payload` (for order specifics only, not results). A `resultReferenceId` will link to downstream tables.
- **Richer Metadata**: Orders will track precise timestamps (`requestedAt`, `scheduledAt`, `startedAt`, `completedAt`, `cancelledAt`) and Priority (`ROUTINE`, `URGENT`, `STAT`).
- **ClinicalTask distinct from ClinicalOrder**: Tasks like "Give Injection" or "Monitor Sugar" are nursing/workflow tasks modeled separately from diagnostic/therapeutic orders.
- **Event-Driven Integration**: Orders will emit standard events for *every* transition (`CLINICAL_ORDER_CREATED`, `CLINICAL_ORDER_ACCEPTED`, etc.) via the existing `TimelinePublisher`.

## Risks / Trade-offs

- **[Risk] Migration of existing EMR data**: Existing records are tied directly to `Visit`/`Appointment`.
  - **Mitigation**: We will not backfill existing data into `Encounter`. We will update the Consultation package to create an `Encounter` upon 'Check In' or 'Start Consultation' moving forward.

- **[Risk] JSONB Payload querying**: Filtering on order specifics inside JSONB can be slow.
  - **Mitigation**: The core `ClinicalOrder` schema will include heavily indexed columns like `status`, `type`, `patientId`, `hospitalId`, and `encounterId`. The JSONB payload is primarily for module-specific read access, not complex filtering.
