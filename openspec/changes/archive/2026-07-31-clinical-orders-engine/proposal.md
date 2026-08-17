## Why

The platform has reached a stage where adding specialized clinical modules (Laboratory, Radiology, Pharmacy) individually will result in severe technical debt and duplicated integration logic. A unified Clinical Orders Engine is required to act as the central orchestration layer, allowing all downstream modules to plug into a single standardized workflow. Additionally, introducing an Encounter Engine will reorganize the clinical data hierarchy to the industry standard `Encounter -> [Orders, Tasks, Vitals, Notes]`, aligning with FHIR and scaling for future analytics. Crucially, Encounters do not strictly require an Appointment (e.g., Emergency, Walk-ins, Ward rounds).

## What Changes

- Introduce the `Encounter` domain to serve as the anchor for all clinical activities. `Appointment` becomes optional. Supports types like OPD, IPD, EMERGENCY, etc.
- Create a unified `ClinicalOrder` model to represent all order types (Lab, Radiology, Procedure, Pharmacy) with standardized statuses, priorities, and strict ownership tracking (`requestedBy`, `assignedTo`, `performedBy`, `verifiedBy`).
- Ensure `ClinicalOrder` does *not* store clinical results. Downstream modules (Lab, Radiology) will manage results and link back to `clinicalOrderId`.
- Introduce `ClinicalTask` for workflow and nursing activities (e.g., "Give Injection", "Monitor Vitals") distinct from diagnostic/therapeutic orders.
- Establish the foundation for Phase 8+ (Laboratory, Radiology) to simply consume this engine.

## Capabilities

### New Capabilities
- `encounter-engine`: Manages the lifecycle of a patient encounter, acting as the primary anchor for all clinical records.
- `clinical-orders`: Centralized orchestration for placing, tracking, and claiming diagnostic, therapeutic, and pharmacological orders.
- `clinical-tasks`: Manages nursing and workflow tasks associated with an encounter.

### Modified Capabilities
- `consultation`: Modifying the consultation state machine to operate within an `Encounter` context.

## Impact

- **Database**: New Prisma models for `Encounter` and `ClinicalOrder`.
- **Domain/Packages**: New `@haspataal/orders` and `@haspataal/encounter` packages (or integrated into `@haspataal/core`).
- **Downstream**: The Timeline (Phase 6) and future Alerts/Billing modules will now consume standardized `ClinicalOrder` events rather than disparate module-specific events.
