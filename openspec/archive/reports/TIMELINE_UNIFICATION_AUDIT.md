# TIMELINE UNIFICATION AUDIT

Scope: Invariants H (Canonical Timeline), I (Clinical Snapshot), H.10 (ops/billing outside clinical timeline).
No code modified.

## 1. What Exists (SOUND — reuse)
- Write pipeline: `TimelinePublisher.publish()` → `prisma.outboxEvent` (`packages/timeline/src/index.ts:173`) → `workers/outbox-relay.worker.ts:35` (handleAddToTimeline) → BullMQ `timeline-ingestion` → `workers/timeline.worker.ts:424` `prisma.timelineEvent.create` → read via `TimelineQueryHandler` (`queries.ts`).
- **`timeline.worker.ts:424` is the ONLY `prisma.timelineEvent.create` in the entire repo** (grep-verified). H.1/H.2/H.3 PASS.
- HMS consumes the engine correctly: `TimelineQueryHandler` imported in 15+ HMS routes (`app/api/timeline/patient/[patientId]/route.ts:4`, etc.). H.3 PASS.
- `EventLog` is correctly separated from clinical timeline (`services/event-emitter.ts:58`, `event.service.ts:61`). H.10 half-PASS.

## 2. What Contradicts (P0/P1)
- **H.4 / H.5 / H.6 — Patient Portal bypasses the engine: CONTRADICTED.** `apps/patient-portal/app/actions.ts:2129 getPatientTimelineEventsAction` directly queries `prisma.visit` (`:2145`), `prisma.labOrder` (`:2150`), `prisma.patientPrescription` (`:2154`), `prisma.pharmacyDispense` (`:2159`) and fabricates events (`id: v-opd-${v.id}`). `app/api/patient/records/route.ts:10-50` repeats it. This is the forbidden manual Prisma stitching; it produces a DIVERGENT stream from the canonical one. The patient "EMR Timeline" and the clinician view are not the same stream (H.6 fails).
- **H.7 / H.8 — Authorization = visibility, no frontend gating: CONTRADICTED.** `TimelineQueryHandler.queries.ts` filters only by `hospitalId` (`tenantScope`); no relationship/role authorization. The stitched `actions.ts` has none. Frontends assemble their own views (`actions.ts`, `go-live-dashboard.tsx:109`) — frontend effectively decides access.
- **H.9 / H.10 — Non-clinical events in clinical Timeline: CONTRADICTED.** `packages/timeline/src/index.ts:45-59` defines `BILLING_COMPLETED, PAYMENT_RECEIVED, INSURANCE_VERIFIED, INSURANCE_CLAIMED, PATIENT_REGISTERED, CONSENT_GIVEN` and categories `BILLING/PAYMENT/INSURANCE/ADMINISTRATIVE` (`index.ts:77-82`). `billing.ts:114` publishes billing events into the clinical timeline. These violate H.9/H.10.
- **H.11 — Event metadata incomplete: CONTRADICTED.** `TimelineEvent` (`schema.prisma:2961-3008`) carries `hospitalId`, `actorId/actorType`, `timestamp` — but is **missing** `episodeId` (source episode), `visibility`, `accessPolicy`. No such columns exist.

## 3. What Is Partial / Missing
- **H.12 — Corrections = immutable linked amendments: PARTIAL.** Schema has `amendedEventId` + `status AMENDED/VOIDED` + `amendments` relation (`schema.prisma:2987,2995-2996`), but **no amendment-creation code path** (`mutations.ts` only pin/bookmark/export).
- **I.1 / I.2 — Clinical Snapshot: CONTRADICTED/MISSING.** `TimelineSnapshot` model exists (`schema.prisma:3556`) but is **never written** (zero `prisma.timelineSnapshot.create` in repo). Snapshots are built ad-hoc in `getClinicalSummary`/`getDoctorTimeline` (`queries.ts:142,100`), filtered only by `hospitalId` — no role-relationship authorization (active treatment, accepted referral, guardian, Care Journey, Episode Caregiver), no purpose/time scoping, no audit.

## 4. Trace (Patient Portal divergence)
```
Patient opens EMR Timeline
  → app/actions.ts:2129 getPatientTimelineEventsAction
  → prisma.visit + prisma.labOrder + prisma.patientPrescription + prisma.pharmacyDispense  (DIRECT)
  → returns fabricated events
  ≠ canonical timeline_events written by timeline.worker.ts:424
```

## 5. Adversarial Findings
- Because the Patient Portal builds its own timeline, a correction/amendment made via the canonical engine is invisible to the patient view (H.12 not reflected). Visibility/access policy cannot be enforced (H.7/H.8).
- Billing/payment/insurance events in the clinical timeline leak financial/operational data into the longitudinal clinical record (H.9/H.10) and would be exposed via any Snapshot.
- No `episodeId` ⇒ events cannot be tied to the admission/visit that produced them, breaking referral Snapshot scoping (I) and multi-episode reasoning.

## 6. Must Refactor (reuse, do NOT build a second timeline)
- `apps/patient-portal/app/actions.ts:2129-2275` — replace manual stitching with a `getPatientTimeline` engine query (same as HMS).
- `packages/timeline/src/index.ts:45-59,77-82` — remove BILLING/PAYMENT/INSURANCE/ADMINISTRATIVE types; route them to `EventLog`/ops stream (`billing.ts:114`).
- `packages/db/prisma/schema.prisma:2961` — add `episodeId`, `visibility`, `accessPolicy` to `TimelineEvent`.
- `packages/timeline/src/mutations.ts` + `queries.ts` — implement immutable amendment creation (H.12) and relationship-scoped Snapshot construction + audit (I).

## 7. Must Delete (only after safe replacement)
- `apps/patient-portal/components/clinical/TimelineView.tsx:31` fetch to `/api/records` (endpoint does not exist — dead/divergent).
- Dead `getCareTimelineAction` (`actions.ts:2317`, returns null) referenced by `(patient)/page.tsx:55`.

## 8. Files Needing Change
- `apps/patient-portal/app/actions.ts` (2129-2275, 2317)
- `apps/patient-portal/lib/services.ts` (1767)
- `apps/patient-portal/components/hospital/go-live-dashboard.tsx` (109)
- `apps/patient-portal/components/clinical/TimelineView.tsx` (31)
- `packages/timeline/src/index.ts` (45-59, 77-82)
- `packages/timeline/src/mutations.ts`, `queries.ts`
- `packages/db/prisma/schema.prisma` (`TimelineEvent` 2961; `TimelineSnapshot` 3556)
- `apps/hospital-hms/lib/services/billing.ts` (114)
