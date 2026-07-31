## Context

Haspataal is expanding its diagnostic capabilities. Following the successful launch of the Laboratory module (Phase 8A), the Radiology module (Phase 8B) will enable hospitals to manage imaging orders (X-ray, MRI, CT, Ultrasound) and generate reports. The platform already has a robust `ClinicalOrder` engine that manages the `ORDERED -> ACCEPTED -> IN_PROGRESS -> COMPLETED` lifecycle. Radiology will leverage this existing infrastructure.

## Goals / Non-Goals

**Goals:**
- Implement `@haspataal/radiology` with a `RadiologyStateMachine` representing imaging lifecycles.
- Enable doctors to place radiology orders within an Encounter.
- Allow radiology technicians to accession studies, track modality acquisition status, and draft text reports.
- Capture PACS/DICOM metadata (AccessionNumber, StudyInstanceUID) to future-proof DICOM viewer integration.

**Non-Goals:**
- Full PACS server implementation or DICOM routing (we are building the metadata tracking layer, not the image storage layer).
- AI-based image analysis (out of scope for MVP).

## Decisions

**1. Radiology Module Structure**
- Similar to `laboratory`, we will create a dedicated `packages/radiology` package organized by responsibility (`src/entities/`, `src/state-machine/`, `src/repositories/`, `src/usecases/`, `src/events/`, `src/validators/`).
- `RadiologyStateMachine` will extend the clinical order state to track specific imaging states: `ORDERED -> SCHEDULED -> ACCESSIONED -> IMAGE_ACQUIRED -> REPORT_DRAFTED -> REPORT_VERIFIED -> COMPLETED`.

**2. Data Model (ImagingStudy & RadiologyReport)**
- `ImagingStudy`: Tracks the acquisition of images. Links to `ClinicalOrder`. Fields: `id`, `clinicalOrderId`, `encounterId`, `patientId`, `hospitalId`, `accessionNumber`, `studyInstanceUID`, `seriesCount`, `imageCount`, `modality` (X-RAY, MRI, CT, US), `status`, `scheduledAt`, `startedAt`, `completedAt`.
- `RadiologyReport`: Tracks the interpretation of the images. Links to `ImagingStudy`. Fields: `id`, `studyId`, `findings`, `impression`, `recommendation`, `status`, `verifiedBy`, `verifiedAt`. (Separating findings from impression).

**3. Integration with ClinicalOrders & Billing**
- The `radiology` package will export use-cases that internally call the `@haspataal/orders` module to update the overarching `ClinicalOrder` state.
- Billing is decoupled: Radiology simply emits `RADIOLOGY_ORDER_COMPLETED` (Timeline event), and Billing listens to it rather than creating invoices directly.

**4. Timeline Events**
Standardized naming: `RADIOLOGY_ORDER_CREATED`, `IMAGING_STUDY_ACCESSIONED`, `IMAGE_ACQUIRED`, `RADIOLOGY_REPORT_DRAFTED`, `RADIOLOGY_REPORT_VERIFIED`, `RADIOLOGY_ORDER_COMPLETED`.

## Risks / Trade-offs

- **Risk: PACS Metadata Drift** -> Mitigation: We will rigorously type the `StudyInstanceUID` (max 64 chars, numbers/dots only) according to DICOM standard to ensure clean integration when a true PACS is attached later.
- **Risk: Large Report Payloads** -> Mitigation: Radiology reports can be long. We will store them in PostgreSQL `TEXT` fields, but keep image blobs out of the database entirely.
