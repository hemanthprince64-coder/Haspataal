## 1. Database Schema & Prisma Models

- [x] 1.1 Add `TimelineEvent` model to `packages/db/prisma/schema.prisma` with all fields: id, patientId, hospitalId, doctorId, module, entityType, entityId, eventType, category, title, subtitle, summary, timestamp, clinicalDate, priority, severity, tags, status, metadata, fhirResourceType, fhirMapping, correlationId, sourceSystem, isPinned, amendedEventId, integrityHash, searchVector (tsvector), createdAt, updatedAt
- [x] 1.2 Add `TimelineAttachment` model (id, eventId, fileName, fileUrl, fileType, fileSizeKb, uploadedAt)
- [x] 1.3 Add `TimelineTag` model (id, eventId, tag, category)
- [x] 1.4 Add `TimelineBookmark` model (id, userId, eventId, note, createdAt) with unique(userId, eventId) constraint
- [x] 1.5 Add `TimelineVersion` model (id, eventId, version, changeType, changedBy, changedAt, previousPayload)
- [x] 1.6 Add `TimelineAudit` model (id, eventId, action, performedBy, performedAt, ipAddress, userAgent, payload)
- [x] 1.7 Add `TimelineExport` model (id, patientId, requestedBy, format, status, fileUrl, fileSizeKb, filters, createdAt, completedAt, expiresAt)
- [x] 1.8 Add `TimelineSearchIndex` model (id, eventId, searchVector tsvector, indexedAt) for optimized search
- [x] 1.9 Add `TimelineSubscription` model (id, subscriberId, subscriberType, patientId, active, createdAt) for future notification hooks
- [x] 1.10 Add `TimelineSnapshot` model (id, patientId, snapshotData, generatedAt) for cached AI-ready clinical summaries
- [x] 1.11 Run `prisma format` and `prisma generate` to validate schema and regenerate Prisma Client
- [x] 1.12 Create and apply database migration via `prisma migrate dev --name add-timeline-engine`
- [x] 1.13 Add `GIN` index on `TimelineEvent.searchVector` in schema: `@@index([searchVector], type: Gin)`
- [x] 1.14 Add composite index on `TimelineEvent(patientId, timestamp)` for cursor pagination performance

## 2. Row-Level Security Policies

- [x] 2.1 Create `enable_rls_timeline.sql` with RLS policies for `TimelineEvent`: patient can SELECT own rows (`patient_id = auth.uid()`), hospital staff can SELECT rows matching `hospital_id = current_setting('app.hospital_id')`
- [x] 2.2 Add RLS for `TimelineBookmark`: users can only SELECT/INSERT/DELETE their own bookmarks (`user_id = auth.uid()`)
- [x] 2.3 Add RLS for `TimelineExport`: users can only SELECT exports they requested (`requested_by = auth.uid()`)
- [x] 2.4 Add RLS for `TimelineAttachment`: scoped to parent `TimelineEvent` access
- [x] 2.5 Add RLS for `TimelineAudit`: SELECT only for `SUPER_ADMIN` role
- [x] 2.6 Add INSERT policy on `TimelineEvent` for service role only (no patient/doctor INSERT direct)
- [x] 2.7 Apply `enable_rls_timeline.sql` to Supabase via SQL editor (document step in TIMELINE.md)

## 3. @haspataal/timeline Package

- [x] 3.1 Create `packages/timeline/` directory with `package.json`, `tsconfig.json`, `src/index.ts`
- [x] 3.2 Define `TimelineEventInput` TypeScript interface and `TimelineEventSchema` (Zod) with all required/optional fields
- [x] 3.3 Implement `TimelinePublisher` class with `publish(event: TimelineEventInput): Promise<{ correlationId: string }>` method
- [x] 3.4 Implement BullMQ job enqueue inside `TimelinePublisher.publish()` targeting queue `timeline-ingestion`
- [x] 3.5 Add auto-generation of `correlationId` (UUID v4) if not provided, with deprecation warning log
- [x] 3.6 Export `TimelinePublisher`, `TimelineEventInput`, `TimelineEventSchema`, `TimelineEventType` enum from package index
- [x] 3.7 Add `@haspataal/timeline` to workspace `package.json` dependencies; run `npm install` from root

## 4. Event Payload Breaking Change — @haspataal/events

- [x] 4.1 Add `correlationId?: string` and `sourceSystem?: string` optional fields to `BaseEventPayload` interface in `packages/events/src/index.ts` (optional for backwards compatibility)
- [x] 4.2 Update event type definitions for all 15 event types to include `correlationId` and `sourceSystem` documentation comments
- [x] 4.3 Update `apps/hospital-hms/lib/services/diagnostics.ts` Lab event emissions to include `correlationId: randomUUID()` and `sourceSystem: 'hospital-hms'`
- [x] 4.4 Update all 10 Phase 3 operation services (`pharmacy.ts`, `ipd.ts`, `ward.ts`, `nursing.ts`, `ot.ts`, `icu.ts`, `billing.ts`, `insurance.ts`, `records.ts`, `discharge.ts`) to include `correlationId` and `sourceSystem` on any event emissions

## 5. Timeline Ingestion Worker

- [x] 5.1 Create `workers/timeline.worker.ts` with BullMQ Worker listening on `timeline-ingestion` queue
- [x] 5.2 Implement `TimelineTransformerMap` — a `Record<EventType, TransformerFn>` mapping all 15 known event types to their `TimelineEventInput` transformers
- [x] 5.3 Implement transformer for `AppointmentCreated` → `{ category: 'APPOINTMENT', title, severity: 'LOW' }`
- [x] 5.4 Implement transformer for `ConsultationCompleted` → `{ category: 'CONSULTATION', fhirResourceType: 'Encounter' }`
- [x] 5.5 Implement transformer for `PrescriptionCreated` → `{ category: 'PRESCRIPTION', fhirResourceType: 'MedicationRequest' }`
- [x] 5.6 Implement transformer for `LabOrdered` → `{ category: 'INVESTIGATION', title: testName, severity: 'LOW' }`
- [x] 5.7 Implement transformer for `LabCompleted` → `{ category: 'INVESTIGATION', severity: isAbnormal ? 'HIGH' : 'LOW', fhirResourceType: 'DiagnosticReport' }`
- [x] 5.8 Implement transformer for `SampleCollected` → `{ category: 'INVESTIGATION', title: 'Sample Collected' }`
- [x] 5.9 Implement transformer for `PatientAdmitted` → `{ category: 'ADMISSION', fhirResourceType: 'Encounter' }`
- [x] 5.10 Implement transformer for `DischargeCompleted` → `{ category: 'DISCHARGE', fhirResourceType: 'Encounter' }`
- [x] 5.11 Implement transformer for `BillingCompleted` → `{ category: 'BILLING' }`
- [x] 5.12 Implement transformer for `DrugDispensed` → `{ category: 'PRESCRIPTION', fhirResourceType: 'MedicationDispense' }`
- [x] 5.13 Implement transformer for `VaccinationGiven` → `{ category: 'VACCINATION', fhirResourceType: 'Immunization' }`
- [x] 5.14 Implement transformer for `CareJourneyUpdated` → `{ category: 'CARE_JOURNEY' }`
- [x] 5.15 Implement transformer for `AdmissionCreated` / `RetentionTriggered` → `{ category: 'ADMINISTRATIVE' }`
- [x] 5.16 Implement fallback transformer for unknown event types → `{ category: 'UNKNOWN' }` with warning log
- [x] 5.17 Implement de-duplication check: query `TimelineEvent` by `correlationId` before INSERT; skip if exists
- [x] 5.18 Implement `integrityHash` computation: SHA-256 of `{ patientId, eventType, timestamp, metadata }` before INSERT
- [x] 5.19 Implement `searchVector` update: after INSERT, execute raw SQL `UPDATE "TimelineEvent" SET search_vector = to_tsvector('english', title || ' ' || COALESCE(summary,'') || ' ' || COALESCE(array_to_string(tags, ' '), '')) WHERE id = $1`
- [x] 5.20 Configure dead-letter queue `timeline-ingestion-dlq` with 3 max retries and exponential backoff
- [x] 5.21 On dead-letter job: INSERT `TimelineAudit` with `action: 'INGESTION_FAILED'`, PHI-redacted payload, and emit Sentry error
- [x] 5.22 Invalidate Redis cache keys `timeline:patient:<patientId>:*` after successful INSERT

## 6. Timeline Service & Repository

- [x] 6.1 Create `apps/hospital-hms/lib/services/timeline.ts` with `TimelineService` class
- [x] 6.2 Implement `TimelineService.getPatientTimeline(patientId, cursor, filters)` with Redis cache check + DB fallback
- [x] 6.3 Implement `TimelineService.getDoctorTimeline(patientId, hospitalId, cursor, filters)` with clinical highlights computation
- [x] 6.4 Implement `TimelineService.getHospitalTimeline(patientId, hospitalId, cursor, filters)` scoped to hospital
- [x] 6.5 Implement `TimelineService.search(query, filters, cursor)` using PostgreSQL `to_tsquery` + filter WHERE clauses
- [x] 6.6 Implement `TimelineService.addBookmark(userId, eventId, note)` with duplicate guard
- [x] 6.7 Implement `TimelineService.removeBookmark(bookmarkId, userId)` with ownership guard
- [x] 6.8 Implement `TimelineService.pinEvent(eventId, isPinned)` updating `TimelineEvent.isPinned`
- [x] 6.9 Implement `TimelineService.requestExport(patientId, format, filters, requestedBy)` creating `TimelineExport` row + enqueuing BullMQ job
- [x] 6.10 Implement `TimelineService.getExportStatus(jobId)` polling `TimelineExport` row
- [x] 6.11 Implement `TimelineService.verifyIntegrity(eventId)` recomputing hash and comparing to stored `integrityHash`
- [x] 6.12 Implement `TimelineService.getAdminAnalytics(filters)` for platform admin metrics
- [x] 6.13 Implement `TimelineService.getClinicalSummary(patientId, hospitalId)` for doctor AI-ready summary

## 7. REST API Routes — Hospital HMS

- [x] 7.1 Create `apps/hospital-hms/app/api/timeline/patient/[patientId]/route.ts` — GET patient timeline (role: PATIENT own only)
- [x] 7.2 Create `apps/hospital-hms/app/api/timeline/doctor/[patientId]/route.ts` — GET doctor clinical timeline (role: DOCTOR)
- [x] 7.3 Create `apps/hospital-hms/app/api/timeline/hospital/[patientId]/route.ts` — GET hospital visit history (role: HOSPITAL_ADMIN, DOCTOR, NURSE, RECEPTIONIST)
- [x] 7.4 Create `apps/hospital-hms/app/api/timeline/search/route.ts` — GET search with filters (scoped by role)
- [x] 7.5 Create `apps/hospital-hms/app/api/timeline/bookmarks/route.ts` — GET list + POST create bookmark
- [x] 7.6 Create `apps/hospital-hms/app/api/timeline/bookmarks/[id]/route.ts` — DELETE bookmark
- [x] 7.7 Create `apps/hospital-hms/app/api/timeline/events/[id]/pin/route.ts` — PATCH pin/unpin event
- [x] 7.8 Create `apps/hospital-hms/app/api/timeline/events/[id]/verify/route.ts` — GET integrity verification
- [x] 7.9 Create `apps/hospital-hms/app/api/timeline/export/route.ts` — POST request export
- [x] 7.10 Create `apps/hospital-hms/app/api/timeline/export/[jobId]/route.ts` — GET export status + download URL
- [x] 7.11 Create `apps/hospital-hms/app/api/admin/timeline/analytics/route.ts` — GET platform analytics (role: SUPER_ADMIN)
- [x] 7.12 Create `apps/hospital-hms/app/api/admin/timeline/dead-letters/route.ts` — GET DLQ list + POST retry + DELETE

## 8. Export Worker

- [x] 8.1 Create `workers/timeline-export.worker.ts` listening on BullMQ `timeline-export` queue
- [x] 8.2 Implement HTML/PDF formatting for print & download
- [x] 8.3 Implement JSON export — serialize filtered `TimelineEvent` rows to JSON with all fields
- [x] 8.4 Implement FHIR R4 Bundle export — generate `{ resourceType: 'Bundle', type: 'document', entry: [...] }` from events with `fhirResourceType` populated
- [x] 8.5 Upload generated file to Supabase Storage at `exports/<patientId>/<jobId>.<ext>`
- [x] 8.6 Generate signed URL with 24-hour expiry and save to `TimelineExport.fileUrl`
- [x] 8.7 Update `TimelineExport.status` to `DONE` or `FAILED` after completion
- [x] 8.8 Implement auto-cleanup: delete Supabase Storage files older than 7 days via a scheduled BullMQ cron job

## 9. React Component Library — packages/ui

- [x] 9.1 Create `packages/ui/src/timeline/TimelineCard.tsx` with props: `event`, `onBookmark`, `onPin`, `onClick`; render icon, title, subtitle, relative timestamp, severity badge, category tag, action buttons
- [x] 9.2 Create `packages/ui/src/timeline/TimelineGroup.tsx` with collapsible section header, event count badge, and animated collapse using CSS transitions
- [x] 9.3 Create `packages/ui/src/timeline/TimelineFilters.tsx` with date range picker, category multi-select, severity dropdown, module dropdown, text search with 300ms debounce
- [x] 9.4 Create `packages/ui/src/timeline/TimelineInfiniteScroll.tsx` with Intersection Observer for cursor-paginated fetch triggers
- [x] 9.5 Create `packages/ui/src/timeline/TimelineEmptyState.tsx` for zero-event states with contextual messaging
-/  9.6 Create `packages/ui/src/timeline/TimelineSkeletonLoader.tsx` — animated skeleton cards for loading states
- [x] 9.7 Create `packages/ui/src/timeline/index.ts` barrel export for all timeline components
- [x] 9.8 Add ARIA attributes: `role="feed"` on list, `role="article"` on each card, `aria-label` on all icon buttons, `aria-live="polite"` on new event announcements
- [x] 9.9 Add keyboard navigation: Arrow Up/Down between cards, Enter to expand, `b` to bookmark, `p` to pin
- [x] 9.10 Verify color contrast ≥ 4.5:1 on all text elements using axe-core in unit tests

## 10. Integration — Wire Modules to TimelinePublisher

- [x] 10.1 Wire `LabService.completeOrder()` to emit `LabCompleted` event via `TimelinePublisher`
- [x] 10.2 Wire `LabService.collectSample()` to emit `SampleCollected` event via `TimelinePublisher`
- [x] 10.3 Wire `IPDService.admitPatient()` to emit `PatientAdmitted` event via `TimelinePublisher`
- [x] 10.4 Wire `DischargeService.generateSummary()` to emit `DischargeCompleted` event via `TimelinePublisher`
- [x] 10.5 Wire `BillingService.createDynamicBill()` to emit `BillingCompleted` event via `TimelinePublisher`
- [x] 10.6 Wire `PharmacyService.dispenseDrug()` to emit `DrugDispensed` event via `TimelinePublisher`
- [x] 10.7 Wire `OTService.scheduleOperation()` to emit `SurgeryScheduled` event via `TimelinePublisher` (new event type)
- [x] 10.8 Wire `NursingService.addNote()` to emit `NursingNoteCreated` event via `TimelinePublisher` (new event type)
- [x] 10.9 Wire `ICUService.admitToICU()` to emit `ICUAdmitted` event via `TimelinePublisher` (new event type)
- [x] 10.10 Add new event types (`SurgeryScheduled`, `NursingNoteCreated`, `ICUAdmitted`) to `packages/events/src/index.ts`

## 11. Testing

- [x] 11.1 Unit tests for `TimelinePublisher.publish()` — schema validation, BullMQ enqueue, duplicate correlationId handling
- [x] 11.2 Unit tests for each transformer in `TimelineTransformerMap` — verify correct category, fhirResourceType, severity mapping
- [x] 11.3 Unit tests for `TimelineService.getPatientTimeline()` — cache hit, cache miss, cursor pagination
- [x] 11.4 Unit tests for `TimelineService.search()` — text match, filter combinations, empty results
- [x] 11.5 Unit tests for `TimelineService.verifyIntegrity()` — valid hash, tampered hash detection
- [x] 11.6 Integration test: publish event → worker ingests → event appears in patient timeline API
- [x] 11.7 Integration test: search for event by title text → correct result returned
- [x] 11.8 Integration test: export PDF request → job queued → status polling → download URL returned
- [x] 11.9 Security test: patient cannot access other patient timeline (403 via RLS)
- [x] 11.10 Accessibility test: axe-core audit on `TimelineCard`, `TimelineGroup`, `TimelineFilters` components — zero critical violations
- [x] 11.11 Performance test: 100k events in DB → patient timeline load p95 < 300ms (with Redis cache)
- [x] 11.12 Performance test: search query across 1M events → p95 < 500ms with GIN index

## 12. Documentation

- [x] 12.1 Create `TIMELINE.md` at repo root — architecture overview, event model reference, how-to-publish guide for module developers, FHIR mapping guide
- [x] 12.2 Update `API.md` — add all Timeline API endpoints with request/response schemas and role requirements
- [x] 12.3 Update `DATABASE.md` — add all timeline Prisma models with field descriptions
- [x] 12.4 Update `ARCHITECTURE.md` — add Timeline Engine section with event flow diagram (Mermaid)
- [x] 12.5 Update `MEMORY.md` Knowledge Base — document Timeline Engine architecture decisions and gotchas
- [x] 12.6 Update `openspec/changes/clinical-timeline-engine/tasks.md` — mark completed tasks as implementation progresses
