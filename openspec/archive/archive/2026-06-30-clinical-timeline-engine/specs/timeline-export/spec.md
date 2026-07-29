## ADDED Requirements

### Requirement: Users can export their timeline as PDF, JSON, or FHIR R4 Bundle
The system SHALL provide `POST /api/timeline/export` accepting `{ patientId, format: 'PDF'|'JSON'|'FHIR', filters? }`. Export jobs SHALL be processed asynchronously via BullMQ `timeline-export` queue. The API SHALL immediately return `{ jobId, status: 'queued' }`. Completed exports SHALL be downloadable via `GET /api/timeline/export/[jobId]`.

#### Scenario: Patient requests PDF export
- **WHEN** patient calls `POST /api/timeline/export` with `{ format: 'PDF' }`
- **THEN** the system SHALL return `{ jobId: 'uuid', status: 'queued' }` within 200ms
- **THEN** the BullMQ worker SHALL generate the PDF using `@react-pdf/renderer`
- **THEN** `GET /api/timeline/export/[jobId]` SHALL eventually return `{ status: 'done', downloadUrl }` with a signed URL

#### Scenario: Export is scoped to authenticated user's access level
- **WHEN** a doctor requests an export of a patient timeline
- **THEN** only events visible to that doctor (within their hospital) SHALL be included in the export

#### Scenario: FHIR R4 export
- **WHEN** patient requests `format: 'FHIR'`
- **THEN** the system SHALL generate a FHIR R4 Bundle resource containing a `Composition` resource with `entry` references for each timeline event that has `fhirResourceType` populated

### Requirement: Exports are stored with a signed URL and expiry
Generated export files SHALL be stored in Supabase Storage under `exports/<patientId>/<jobId>.<ext>`. The download URL SHALL be a signed URL with a 24-hour expiry. After 7 days, the file SHALL be automatically deleted.

#### Scenario: Expired export link
- **WHEN** a user attempts to download an export after 24 hours
- **THEN** the signed URL SHALL return `403 Forbidden` from Supabase Storage
- **THEN** the user SHALL be prompted to request a new export

### Requirement: Export status is tracked in TimelineExport table
Every export job SHALL create a `TimelineExport` row tracking `status` (`QUEUED|PROCESSING|DONE|FAILED`), `format`, `fileUrl`, `fileSizeKb`, `createdAt`, `completedAt`.

#### Scenario: Export fails during PDF generation
- **WHEN** `@react-pdf/renderer` throws an error during generation
- **THEN** `TimelineExport.status` SHALL be set to `FAILED`
- **THEN** a Sentry error SHALL be emitted
- **THEN** `GET /api/timeline/export/[jobId]` SHALL return `{ status: 'FAILED', error: 'Export generation failed' }`
