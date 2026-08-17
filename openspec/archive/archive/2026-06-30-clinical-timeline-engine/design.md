## Context

Haspataal is a multi-tenant hospital SaaS platform. Currently, each clinical module (Lab, Pharmacy, IPD, OT, Nursing, Billing) persists its data in isolated Supabase tables with no unified event log. When a doctor opens a patient record, they get module-specific snapshots — not a longitudinal story. There is no normalized view of "everything that has happened to this patient."

The existing `@haspataal/events` package emits events via Redis Streams (`redis.xadd`), but no consumer durably persists them into a queryable store. Events are ephemeral. Timeline data in `apps/hospital-hms/lib/services/records.ts` currently constructs EMR views with ad-hoc multi-table joins — fragile, unscalable, and non-reusable.

The Clinical Timeline Engine replaces this with a **durable, normalized, immutable event log** that any module publishes to and any role-differentiated view consumes from.

**Stakeholders:** Patients, Doctors, Hospital Admins, Platform Admins, AI/ML pipeline (future), ABDM/ABHA regulatory integrations (future).

## Goals / Non-Goals

**Goals:**
- Single `TimelineEvent` table as the canonical longitudinal patient record
- Every Haspataal module publishes events via a typed `TimelinePublisher` interface
- BullMQ `timeline-ingestion` queue processes events asynchronously — no blocking on ingestion
- Patient, Doctor, Hospital, and Admin views served by dedicated query APIs with Redis cursor-paginated caching
- Full-text search over event `title`, `summary`, and `tags` using PostgreSQL `tsvector` with `GIN` index
- Immutable events — no UPDATEs or DELETEs on `TimelineEvent` records; amendments create new versions
- RLS policies enforce strict multi-tenant and per-role isolation at the database layer
- FHIR R4 mapping metadata stored as JSON on each event for future ABDM export
- Exportable as PDF, JSON, and FHIR R4 Bundle
- React component library consumable by all three apps

**Non-Goals:**
- Real-time streaming UI (WebSocket push) — out of scope for v1; polling-based refresh is sufficient
- Full FHIR R4 API server compliance — only metadata tagging, not a certified FHIR endpoint
- AI/LLM-powered clinical summarization — event data structure is AI-ready, but inference is future work
- Replacing existing module data stores — `TimelineEvent` is a projection layer, not a replacement for `LabOrder`, `Admission`, etc.
- Mobile-native apps — responsive web only for v1

## Decisions

### Decision 1: Append-Only `TimelineEvent` Table (Immutable Log)

**Choice:** All timeline writes are `INSERT`-only. No `UPDATE` or `DELETE` on `TimelineEvent` rows.  
**Rationale:** Clinical records must be immutable for audit, regulatory (DPDP/GDPR), and medico-legal compliance. Amendments create a new event with `amendedEventId` referencing the original. `TimelineVersion` tracks change history.  
**Alternatives considered:**  
- Mutable events with audit triggers → rejected: PostgreSQL triggers add write overhead; app-level immutability is clearer  
- Event Sourcing with full ES framework → rejected: overkill for v1; a simple append-only table achieves 90% of the benefit with 10% of the complexity

### Decision 2: BullMQ for Async Ingestion (Not Synchronous DB Write)

**Choice:** Modules publish events to `@haspataal/events` (Redis Streams). A dedicated `timeline.worker.ts` BullMQ consumer reads from all event channels and persists `TimelineEvent` rows asynchronously.  
**Rationale:** Decouples the write path — a slow or failing Timeline DB write never blocks a doctor completing a consultation. BullMQ provides retry, dead-letter, and observability out of the box.  
**Alternatives considered:**  
- Synchronous dual-write in every module → rejected: tight coupling, cascading failures, violates DRY  
- PostgreSQL LISTEN/NOTIFY → rejected: cannot fan-out across multiple queue workers; no retry semantics

### Decision 3: PostgreSQL Full-Text Search (not Elasticsearch)

**Choice:** `tsvector` column on `TimelineEvent` with `GIN` index for full-text search. Supabase native.  
**Rationale:** Avoids introducing Elasticsearch as a new infrastructure dependency. PostgreSQL FTS handles Indian clinical vocabulary adequately for v1. Semantic search (vector embeddings) is `pgvector`-ready as a future upgrade without schema changes.  
**Alternatives considered:**  
- Elasticsearch/OpenSearch → rejected: operational overhead, cost, new cluster to manage  
- Typesense → rejected: yet another service; PostgreSQL FTS is sufficient for <10M events initially

### Decision 4: Redis Cursor-Paginated Cache for Timeline Queries

**Choice:** Cache patient timeline pages at key `timeline:patient:<patientId>:cursor:<cursor>` with 5-minute TTL in Redis using `ioredis`.  
**Rationale:** Timeline reads are high-frequency (every doctor-patient encounter opens the timeline). Caching avoids N+1 Supabase queries per page load. Cursor pagination avoids the `OFFSET` pagination performance cliff at large datasets.  
**Alternatives considered:**  
- Materialized views → useful for analytics aggregates, not for per-patient paginated streams  
- No caching → unacceptable for performance; timeline queries join 8+ tables

### Decision 5: RBAC + RLS Two-Layer Security

**Choice:** Application-layer `roleGuard` middleware AND PostgreSQL RLS policies on all `TimelineEvent` queries.  
**Rationale:** Defense in depth. If application middleware is bypassed (misconfigured route), RLS prevents data leakage at the DB level. Supabase RLS is the primary tenant isolation mechanism.  
**Alternatives considered:**  
- RLS only → insufficient; no app-level role differentiation (patient vs doctor views differ beyond ownership)  
- App-layer only → insufficient; direct DB access or future service-mesh sidecars bypass it

### Decision 6: Shared `@haspataal/timeline` Package for Publisher Interface

**Choice:** Create `packages/timeline/` exporting `TimelinePublisher` class and `TimelineEventSchema` (Zod) so any module can call `await timeline.publish(event)` with type safety.  
**Rationale:** Centralizes the publisher contract. Modules only depend on the package, not on the Timeline Engine's internal implementation. Future: can swap from BullMQ to Kafka without touching any module.  
**Alternatives considered:**  
- Each module writes directly to `TimelineEvent` table → tight coupling, bypasses queue, breaks replay  
- HTTP POST from each module to Timeline API → network hop on hot paths; BullMQ is in-process and faster

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Event storms during high admission volume (ICU, OT) saturating BullMQ | Rate-limit the `timeline-ingestion` queue to 500 jobs/s; use Redis `XREAD COUNT` batching |
| `correlationId` missing on legacy events (pre-breaking-change modules) | Publisher validates `correlationId` presence; missing → generate UUID at ingestion worker; emit warning metric |
| Redis cache stale data after timeline amendment | On any new `TimelineEvent` INSERT for a patient, invalidate `timeline:patient:<id>:*` keys via Redis pattern delete |
| PostgreSQL FTS performance degrades beyond 5M events | Partition `TimelineEvent` by `created_at` year; `GIN` index per partition; migrate to `pgvector` semantic search for v2 |
| FHIR mapping metadata is inconsistently populated | FHIR field population is optional in v1; a future FHIR validation job will backfill and flag gaps |
| Timeline export PDF generation blocks API thread | PDF generation offloaded to BullMQ `timeline-export` queue; API returns a job ID; polling endpoint for status |

## Migration Plan

1. **Schema migration**: Add new Prisma models; run `prisma migrate deploy` — additive only, no column drops
2. **RLS policies**: Apply `enable_rls_timeline.sql` to Supabase prod via SQL editor (one-time manual step)
3. **Package publish**: Publish `@haspataal/timeline` to workspace; no external registry needed
4. **Worker deploy**: Deploy `workers/timeline.worker.ts` alongside existing workers; BullMQ queue is auto-created
5. **Module wiring**: Each module imports `@haspataal/timeline` and adds `await timeline.publish(...)` after its primary write — no existing logic removed
6. **Backfill (optional)**: A one-time migration script can backfill historical events from existing tables (appointments, admissions, lab orders) into `TimelineEvent`; out of scope for v1 launch
7. **Rollback**: Disable the `timeline.worker.ts` process; `TimelineEvent` writes fail silently (logged); all module primary flows are unaffected

## Open Questions

- **Consent model**: Should a patient be able to hide specific events from doctor view (e.g., sensitive psychiatric notes)? → Recommend adding `consentOverride: boolean` field to `TimelineEvent` for v2; v1 treats all events as visible to treating doctors
- **Cross-hospital visibility**: Can Hospital A's doctor see events recorded by Hospital B? → v1: No — scoped by `hospitalId` in RLS; cross-hospital sharing requires explicit patient consent record (future)
- **Backfill priority**: Should we backfill historical `LabOrder`, `Admission` data into `TimelineEvent` at launch? → Defer to post-launch; new events only for v1
- **PDF rendering engine**: Puppeteer vs `@react-pdf/renderer` for export? → Prefer `@react-pdf/renderer` (no headless Chrome dependency in prod); to be confirmed before implementation
