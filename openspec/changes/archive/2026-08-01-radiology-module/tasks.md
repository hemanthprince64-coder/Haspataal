### Phase 1: Database Foundation

- [x] 1.1 Add `ImagingStudy` and `RadiologyReport` models to Prisma schema.
- [x] 1.2 Add specific `RADIOLOGY` enum to `ClinicalOrderType` (or ensure existing usage aligns).
- [x] 1.3 Apply `npx prisma db push` (or migration) and regenerate Prisma Client.

### Phase 2: Radiology Engine (`@haspataal/radiology`)

- [x] 2.1 Implement `ImagingStudy` entity (Zod schemas, types).
- [x] 2.2 Implement `RadiologyReport` entity (Zod schemas, types, splitting `findings` and `impression`).
- [x] 2.3 Implement `RadiologyStateMachine` (transitions: ORDERED -> SCHEDULED -> ACCESSIONED -> IMAGE_ACQUIRED -> REPORT_DRAFTED -> REPORT_VERIFIED -> COMPLETED).
- [x] 2.4 Add foundational domain entities (`ImagingStudy.ts`, `RadiologyReport.ts`) and repositories.

## 3. Core Use-Cases

- [x] 3.1 Implement `PlaceRadiologyOrderUseCase` (integrating with `orders` package).
- [x] 3.2 Implement `AccessionStudyUseCase` (assigning UIDs).
- [x] 3.3 Implement `AcquireImageUseCase` (status transition).
- [x] 3.4 Implement `DraftReportUseCase` and `VerifyReportUseCase`.
- [x] 3.5 Hook into Timeline (`TimelinePublisher`) for standard Radiology events (`RADIOLOGY_ORDER_CREATED`, `IMAGING_STUDY_ACCESSIONED`, `IMAGE_ACQUIRED`, `RADIOLOGY_REPORT_DRAFTED`, `RADIOLOGY_REPORT_VERIFIED`, `RADIOLOGY_ORDER_COMPLETED`).

## 4. Platform UI

- [x] 4.1 Build Technician Worklist UI (Pending -> Scheduled -> Ready for Scan -> Acquired).
- [x] 4.2 Build Radiologist Worklist UI (Draft Reports -> Awaiting Verification -> Verified Reports).
- [x] 4.3 Update Encounter Workspace to allow doctors to place Radiology orders.
- [x] 4.4 Render Timeline events cleanly.

## 5. Quality Gates

- [x] 5.1 Ensure zero lint/type errors in `@haspataal/radiology`.
- [x] 5.2 Write unit tests for `RadiologyStateMachine`.
- [x] 5.3 Write integration tests for order lifecycle and timeline events.
