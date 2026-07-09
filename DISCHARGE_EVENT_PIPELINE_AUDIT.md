# DISCHARGE EVENT PIPELINE AUDIT

Scope: Invariants F (Discharge state machine), J.1 (transactional outbox for discharge).
No code modified.

## 1. What Exists
- `Admission` model `packages/db/prisma/schema.prisma:1537` with `status String @default("ADMITTED")` (free-text, line 1544).
- `IPDService.dischargePatient` `apps/hospital-hms/lib/services/ipd.ts:191-254` — frees bed, sets `status:'DISCHARGED'` (`ipd.ts:222`), creates `Invoice` `status:'DRAFT'` (`ipd.ts:245`).
- `DischargeService.generateDischargeSummary` `apps/hospital-hms/lib/services/discharge.ts:33-49` — publishes `DischargeCompleted` via `TimelinePublisher` (read-only summary path).
- Patient-portal discharge route `apps/patient-portal/app/api/hospital/ipd/admissions/[id]/discharge/route.ts:57` — `prisma.$transaction` updates admission + invoice + bed, **no journey, no outbox**.

## 2. What Contradicts the Architecture (P0/P1)
- **F.1 — `DISCHARGE_ORDERED ≠ PATIENT_DISCHARGED`: CONTRADICTED.** No state machine. `Admission.status` is a String; only values observed are `'ADMITTED'` and `'DISCHARGED'`. No `DISCHARGE_ORDERED` enum/state anywhere.
- **F.2 — `PATIENT_DISCHARGED` only after physical departure: CONTRADICTED.** `dischargePatient` sets `status:'DISCHARGED'` immediately (`ipd.ts:222`) with no `PATIENT_LEFT` confirmation step. A patient can be marked discharged while still in bed.
- **F.6 — Final discharge emits Outbox event: CONTRADICTED.** `dischargePatient` performs 3 Supabase writes (bed update, admission update, invoice insert) with **no** `OutboxEvent`, no `EventLog`, no domain event. The only outbox discharge path is `generateDischargeSummary` (a separate, read-only summary publisher) — so the *state-changing* function emits nothing.
- **J.1 — State change + OutboxEvent in one transaction: CONTRADICTED.** `dischargePatient` uses Supabase client, not Prisma `$transaction`; no outbox at all. Admission update + bed update are separate calls (no atomicity).

## 3. What Is Partial / Acceptable
- **F.3 / F.4 — Clinical vs financial separation:** `Invoice.status:'DRAFT'` is independent of `Admission.status` (ok), but there is no guard preventing billing state from corrupting clinical state. Pending billing does not currently corrupt clinical state only by coincidence of schema.
- **F.5 — HMS owns discharge:** `IPDService.dischargePatient` owns the mutation (ok), but via Supabase without transactions.
- **F.7 — No direct Timeline write:** HMS uses `getTimelinePublisher().publish()` (`discharge.ts:32`) → `OutboxEvent` (`timeline/src/index.ts:173`). Vacuously satisfied for discharge because discharge emits nothing to reconcile.

## 4. Trace (as-built)
```
UI discharge button
  → apps/hospital-hms/app/api/ipd/admissions/[id]/discharge/route.ts
  → IPDService.dischargePatient (lib/services/ipd.ts:191)
       ├─ Supabase beds.update (free bed)        [no tx]
       ├─ Supabase admissions.update status=DISCHARGED  [no tx, no outbox]
       └─ Supabase invoices.insert status=DRAFT
  ⇒ NO OutboxEvent ⇒ Timeline/Search/Notification/CareJourney NOT triggered reliably
```

## 5. Adversarial Findings
- If process crashes after `status=DISCHARGED` but before any notification → inconsistent state, no recovery event.
- `PATIENT_DISCHARGED` before physical departure violates clinical/financial separation intent (F.2) and breaks the Care Journey activation gate (M.8: journey active only after `PATIENT_LEFT → PATIENT_DISCHARGED`).
- Because there is no Outbox, the Care Journey activation (M.8/M.10) has no event to trigger from.

## 6. Must Refactor (do NOT create a second discharge writer)
- `apps/hospital-hms/lib/services/ipd.ts:191` — convert to Prisma `$transaction` (or Supabase RPC with atomicity) and emit `DischargeOrdered`/`PatientLeft`/`PatientDischarged` OutboxEvents inside the same transaction, modeled on `packages/journey/src/engine.ts:23`.
- `packages/db/prisma/schema.prisma:1544` — replace `status String` with the discharge enum: `ORDERED → SUMMARY_READY → MEDICATIONS_FINALIZED → ADMIN_BILLING_COMPLETED → PATIENT_LEFT → DISCHARGED`. Backfill existing `ADMITTED`/`DISCHARGED` rows.
- Add `DischargeOutbox` publisher mirroring `TimelinePublisher`.

## 7. Migration Risk
- Medium-High: backfill `Admission.status` for production rows already `DISCHARGED`; preserve `discharged_at` semantics.

## 8. Files Needing Change
- `packages/db/prisma/schema.prisma:1537` (Admission status enum)
- `apps/hospital-hms/lib/services/ipd.ts:191` (dischargePatient)
- `apps/hospital-hms/lib/services/discharge.ts:33` (keep summary; ensure it reads from authoritative state)
- `apps/patient-portal/app/api/hospital/ipd/admissions/[id]/discharge/route.ts:57` (add outbox + journey trigger via outbox, NOT synchronous)
- `packages/timeline/src/index.ts`, `packages/notify/src/outbox.ts`, `packages/journey/src/engine.ts` (reference transactional patterns)
