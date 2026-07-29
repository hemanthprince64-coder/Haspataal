# DELETION AND DEPRECATION REGISTER

Scope: What must be deleted ONLY after safe replacement. Per strict rules: no silent preservation of legacy behavior.
No code modified.

## Rule
DELETE-ONLY-AFTER-SAFE-REPLACEMENT. Each item lists the replacement that must be live and verified first.

| ID | Artifact | Type | Why delete | Safe replacement (must be live first) |
|---|---|---|---|---|
| DR-1 | `apps/hospital-hms/prisma/schema.prisma:464` duplicate `Patient` + standalone prisma client | SCHEMA/CLIENT | Third identity store; split-brain (A.8) | Canonical `packages/db` Patient registry; all HMS patient I/O routed through it; zero references remaining |
| DR-2 | `apps/hospital-hms/supabase/schema.sql:24-38` `global_patients`/`hospital_patients` | SCHEMA | Third identity store; split-brain (A.8) | Canonical registry + read-replica lookup; reconciliation verified |
| DR-3 | `apps/patient-portal/app/actions.ts:2129-2275` manual timeline stitching | CODE | Forbidden manual Prisma stitching (H.5); divergent stream (H.6) | `getPatientTimeline` engine query (same as HMS) |
| DR-4 | `apps/patient-portal/app/api/patient/records/route.ts:10-50` direct clinical queries | CODE | Divergent timeline (H.4/H.5) | Engine-backed patient records endpoint |
| DR-5 | `apps/patient-portal/components/clinical/TimelineView.tsx:31` fetch `/api/records` | UI | Endpoint does not exist (dead/divergent) | Engine-backed timeline view |
| DR-6 | `apps/patient-portal/app/actions.ts:2317` `getCareTimelineAction` (returns null) | CODE | Dead; referenced by `(patient)/page.tsx:55` | Remove reference or implement via engine |
| DR-7 | `apps/patient-portal/lib/ai/engine.ts` legacy `careJourney`/`medicationPlan`/`followUpPlan`/`recoveryStep`/`nudgeSchedule`/`careRedFlag` writes | CODE | Duplicates Journey Engine (M.1); auto-enrolls (M.5/M.6) | `packages/journey` engine + explicit doctor enrollment |
| DR-8 | `packages/rules/src/engine.ts:143` `update_record` blanket `(prisma as any)[table].update` | CODE | Rewrites any clinical table (L.15) | Whitelisted non-clinical action + outbox command |
| DR-9 | `workers/rules-worker.ts:9-11` in-memory `depthTracker` | CODE | Not source of truth for cycles (L.1) | Durable depth ledger (Redis/DB) keyed by correlationId/causationId |
| DR-10 | `workers/search.worker.ts:11` in-memory `inboxCache` Set | CODE | Non-durable dedup; lost on restart/multi-pod (K.6) | Durable processed-event ledger |
| DR-11 | `services/event.service.ts:28` in-memory `processedKeys` Set (sqlite fallback) | CODE | Non-durable (K.1) | DB `idempotency_key` constraint |
| DR-12 | `packages/timeline/src/index.ts:45-59,77-82` BILLING/PAYMENT/INSURANCE/ADMINISTRATIVE event types | CODE/SCHEMA | Non-clinical events in clinical Timeline (H.9/H.10) | Route to `EventLog`/ops stream |
| DR-13 | `apps/hospital-hms/lib/services/visits.ts:5-39` Supabase direct timeline stitching | CODE | Bypasses Timeline Engine (H.3 caveat) | Unified Prisma/Timeline path |

## Do NOT delete (reuse)
- `packages/db` Patient `id` (canonical key) — keep.
- `packages/timeline` engine + `timeline.worker.ts:424` (sole writer) — keep.
- `packages/journey` engine — keep (retire only the legacy AI duplicate).
- `TimelineSnapshot`/`JourneyTemplateVersion`/`NewbornRecord` models — complete, don't delete.
- Escalation worker durable dedup pattern — keep as reference.
