## ADDED Requirements

### Requirement: All TimelineEvent tables enforce Row-Level Security
The system SHALL apply PostgreSQL RLS policies to `TimelineEvent`, `TimelineBookmark`, `TimelineExport`, `TimelineAttachment`, `TimelineAudit` tables. Policies SHALL be defined in `enable_rls_timeline.sql`.

#### Scenario: Patient reads their own timeline events
- **WHEN** a patient's Supabase session calls `SELECT * FROM "TimelineEvent"`
- **THEN** RLS SHALL return only rows where `patient_id = auth.uid()`

#### Scenario: Hospital staff reads timeline
- **WHEN** hospital staff Supabase session queries `TimelineEvent`
- **THEN** RLS SHALL return only rows where `hospital_id = current_setting('app.hospital_id')`

#### Scenario: Direct DB access without session context
- **WHEN** a query is made without an authenticated Supabase session
- **THEN** RLS SHALL return zero rows (no disclosure)

### Requirement: RBAC guards on all Timeline API routes
Every timeline API route SHALL validate the request JWT with role-specific guards:
- Patient routes (`/api/timeline/patient/*`): requires `session_patient`
- Doctor routes (`/api/timeline/doctor/*`): requires `session_user` with role `DOCTOR|SENIOR_DOCTOR|ADMIN`
- Hospital routes (`/api/timeline/hospital/*`): requires `session_user` with role `HOSPITAL_ADMIN|DOCTOR|NURSE|RECEPTIONIST|BILLING`
- Admin routes (`/api/admin/timeline/*`): requires `session_admin` with role `SUPER_ADMIN`

#### Scenario: Patient token hits doctor route
- **WHEN** a `session_patient` JWT is used to call `GET /api/timeline/doctor/[patientId]`
- **THEN** the roleGuard middleware SHALL return `403 Forbidden`

### Requirement: PHI is never logged
All logger calls involving `TimelineEvent` payload SHALL redact fields: `patientId` (show first 4 chars only), `title`, `summary`, `metadata`. Use `@haspataal/logger` with PHI auto-redaction middleware.

#### Scenario: Worker logs ingestion error
- **WHEN** the ingestion worker emits a Pino log for a failed event
- **THEN** `patientId` SHALL appear as `"abcd****"` and `title`/`summary` SHALL be `"[REDACTED]"`

### Requirement: TimelineEvent records are cryptographically immutable
The system SHALL compute a SHA-256 hash of the immutable fields (`patientId`, `eventType`, `timestamp`, `payload`) and store it in `TimelineEvent.integrityHash`. This hash SHALL be verifiable via `GET /api/timeline/events/[id]/verify`.

#### Scenario: Integrity verification
- **WHEN** `GET /api/timeline/events/[id]/verify` is called
- **THEN** the system SHALL recompute the hash from current DB fields and compare to `integrityHash`
- **THEN** `{ valid: true }` SHALL be returned if they match; `{ valid: false, tampered: true }` if they differ
