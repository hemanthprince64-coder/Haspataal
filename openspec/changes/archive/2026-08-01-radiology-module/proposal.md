## Why

The platform recently standardized clinical workflows via the Clinical Orders Engine, successfully validating this architecture with the Laboratory module (Phase 8A). Radiology (Phase 8B) is the next core diagnostic pillar. Implementing it now leverages the established order engine patterns and completes the primary diagnostic loop (Lab + Imaging) for both OPD and IPD encounters, enabling comprehensive clinical care.

## What Changes

- Add a new `@haspataal/radiology` domain package to handle the radiology lifecycle.
- Implement state machines for radiology modalities (e.g., Scheduled -> In Progress -> Image Acquired -> Reported -> Verified).
- Introduce foundational data models for Imaging Studies and Radiology Reports.
- Provide hooks for future DICOM/PACS integration (e.g., storing StudyInstanceUIDs).
- Integrate with the `ClinicalOrder` engine, `Timeline`, and `BillingHook` identically to the Laboratory module.
- Create UIs in `patient-portal` and `hospital-hms` for Radiology Worklists and Report Entry.

## Capabilities

### New Capabilities
- `radiology-module`: Core radiology order lifecycle, modality tracking (X-Ray, MRI, CT, Ultrasound), and report generation/verification.
- `pacs-integration`: Foundational tracking of Imaging Studies (StudyInstanceUID, AccessionNumber) to enable future DICOM viewer integration.

### Modified Capabilities
- `clinical-orders`: (No requirement changes, just consumption)

## Impact

- **Database**: New Prisma models for `ImagingStudy`, `RadiologyReport`, etc., linked back to `ClinicalOrder` via `clinicalOrderId`.
- **Domain/Packages**: New `@haspataal/radiology` package exposing use-cases and state machines.
- **Downstream**: The Timeline will render new events (`IMAGE_ACQUIRED`, `RADIOLOGY_REPORT_VERIFIED`). Billing will integrate via hooks when radiology orders are completed.
