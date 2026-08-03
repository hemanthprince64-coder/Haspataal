## Why

The platform has a stable Clinical Orders Engine and Encounter Engine. The logical next step in building out a comprehensive Electronic Medical Record (EMR) is a fully-featured Laboratory module. By building Laboratory as the first downstream consumer of the Clinical Orders Engine, we validate the architecture while delivering critical diagnostic capabilities including sample lifecycle management, result entry, result verification, and critical value alerting.

## What Changes

- Create a new `@haspataal/laboratory` package.
- Implement a comprehensive Laboratory Dashboard and Work Queue (Lab worklist) for lab technicians and pathologists.
- Introduce the complete Sample Lifecycle workflow (Sample Collection -> Sample Accession).
- Build templates for common tests (e.g., CBC, LFT, KFT).
- Implement Result Entry and Result Verification interfaces.
- Integrate Critical Value Alerts to notify ordering physicians of dangerous diagnostic values.
- Integrate deeply with the existing `ClinicalOrder` abstraction, tracking order lifecycle (ORDERED -> ACCEPTED -> IN_PROGRESS -> VERIFIED -> COMPLETED).
- Provide Timeline integration to publish laboratory events to the patient's unified timeline.
- Implement hooks for Billing when an order is completed/verified.

## Capabilities

### New Capabilities
- `laboratory-module`: Core laboratory operations including worklist, sample lifecycle (collection, accession), result entry, and result verification.
- `laboratory-templates`: Management of specific test templates and reference ranges (CBC, LFT, KFT).
- `critical-value-alerts`: Alerting system to immediately notify doctors when a verified lab result falls into a critical range.

### Modified Capabilities
- `clinical-orders`: (No requirement changes, just consumption)

## Impact

- **Database**: New Prisma models for `Sample`, `LabResult`, `TestTemplate`, etc. These will link back to `ClinicalOrder` via `clinicalOrderId`.
- **Domain/Packages**: New `@haspataal/laboratory` package.
- **Downstream**: The Alerts module will trigger off `critical-value-alerts`. Billing will integrate via hooks when orders are completed. The Timeline will render new events (`SAMPLE_COLLECTED`, `RESULT_VERIFIED`).
