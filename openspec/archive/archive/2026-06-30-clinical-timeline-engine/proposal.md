## Why

Haspataal serves hundreds of hospitals across India's tier-2/3 cities, each generating thousands of clinical events daily — consultations, prescriptions, lab results, admissions, discharges, and more. Today there is no single, normalized, longitudinal record of a patient's clinical journey across modules, hospitals, or time. Each module siloes its data. Doctors cannot see previous diagnoses from a different hospital visit. Patients cannot access their own complete health history. AI features have no clean event stream to reason over. This creates fragmented care, delays, and safety risks.

The Clinical Timeline Engine solves this by becoming the **single source of truth** for every healthcare event in a patient's lifetime — immutable, versioned, searchable, and accessible across roles — from the first registration to the last discharge.

## What Changes

- **New `TimelineEvent` core table** with normalized, immutable event records linked to any module
- **Event Publisher interface** that every Haspataal module (Lab, Pharmacy, IPD, OT, Billing, Nursing, etc.) uses to emit standardized timeline events
- **Event Bus subscriptions** in a dedicated `timeline-worker` for all existing and future event types (AppointmentCreated, ConsultationCompleted, LabCompleted, AdmissionCreated, DischargeCompleted, PrescriptionCreated, etc.)
- **Timeline REST APIs** — patient timeline, doctor clinical view, hospital visit history, admin analytics, search, bookmarks, exports
- **Full-text and semantic-ready search** layer backed by PostgreSQL full-text indexes with Redis cursor-paginated caching
- **Role-differentiated views**: Patient, Doctor, Hospital Staff, Admin each see filtered projections of the same underlying events
- **FHIR R4 event mapping** metadata on every event for future interoperability (ABDM/ABHA)
- **Timeline frontend component library** — reusable Timeline Card, Timeline Group, Timeline Filters, Infinite Scroll for all consuming apps (patient-portal, hospital-hms, admin-panel)
- **OpenSpec, API.md, DATABASE.md, ARCHITECTURE.md, TIMELINE.md** documentation generated and synchronized
- **BREAKING**: New required fields on `@haspataal/events` payloads — `correlationId` and `sourceSystem` — for reliable de-duplication during event ingestion

## Capabilities

### New Capabilities

- `timeline-event-ingestion`: Receive, validate, de-duplicate, and persist any module's healthcare events into the `TimelineEvent` table with normalization, FHIR mapping metadata, and audit trail
- `timeline-patient-view`: Chronological, grouped, and filtered patient-facing timeline exposing their full lifetime medical history across hospitals, doctors, and specialties
- `timeline-doctor-view`: Clinical-grade doctor view showing previous diagnoses, medications, labs, procedures, care journeys, and AI-ready clinical summaries per patient
- `timeline-hospital-view`: Hospital staff view scoped to that hospital's visit history, admissions, billing, and investigation data for a given patient
- `timeline-admin-analytics`: Platform-level analytics for event volume, ingestion rates, latency, failed events, dead-letter queue inspection, and audit log access
- `timeline-search`: Full-text, date-range, module, severity, doctor, hospital, and medication filtered search over the timeline event corpus
- `timeline-bookmarks`: Clinician and patient ability to bookmark, pin, and annotate significant timeline events for quick retrieval
- `timeline-export`: Generate PDF, JSON, and FHIR R4 Bundle exports of a patient's full or filtered timeline history
- `timeline-event-bus-subscriptions`: BullMQ consumer workers that listen to all existing `@haspataal/events` channels and transform raw domain events into normalized `TimelineEvent` records
- `timeline-rbac-rls`: Row-Level Security policies and RBAC guards ensuring strict multi-tenant isolation — patients see only their own data, hospitals see only their patients, doctors see consented patients
- `timeline-component-library`: Reusable React component library (TimelineCard, TimelineGroup, TimelineFilters, TimelineInfiniteScroll) consumable by patient-portal, hospital-hms, and admin-panel

### Modified Capabilities

- `events`: Add required `correlationId` (UUID) and `sourceSystem` (string) fields to all event payloads in `@haspataal/events/src/index.ts` to enable reliable de-duplication and audit traceability in the Timeline ingestion pipeline

## Impact

- **packages/db**: New Prisma models — `TimelineEvent`, `TimelineAttachment`, `TimelineTag`, `TimelineBookmark`, `TimelineVersion`, `TimelineAudit`, `TimelineExport`, `TimelineSearchIndex`
- **packages/events**: Extended event payload types with `correlationId` and `sourceSystem` fields
- **apps/hospital-hms**: New API routes under `/api/timeline/` for hospital staff views, search, and exports
- **apps/patient-portal**: New API routes and UI pages for patient-facing timeline
- **workers/**: New `timeline.worker.ts` consuming all event bus channels and persisting `TimelineEvent` records
- **services/gateway**: Route forwarding for `/timeline/**` endpoints
- **New RLS policies**: `enable_rls_timeline.sql` for all new timeline tables
- **Redis**: New cache namespace `timeline:patient:<id>` with 5-minute TTL for paginated timeline queries
- **BullMQ**: New queue `timeline-ingestion` for async event processing with dead-letter handling
