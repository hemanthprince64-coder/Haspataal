# REFERRAL PIPELINE AUDIT

Scope: Invariants G (Referral lifecycle), J.1/J.2 (transactional outbox for referral).
No code modified.

## 1. What Exists
- `InternalReferral` model (`schema.prisma` ~2492): `fromDoctorId`, `toDoctorId`, `status: PENDING` (`schema.prisma:2495`).
- `ReferralSlip` model `schema.prisma:1309` — ANC-specific, no lifecycle.
- `createReferral` `apps/patient-portal/lib/services.ts:1754` — bare `prisma.internalReferral.create`, no Outbox.
- ANC referral route `apps/patient-portal/app/api/hospital/anc/referral/route.ts:24` — `ReferralSlip.create`, no Outbox.
- `getReferralTimeline` `apps/patient-portal/lib/services.ts:1767` — local timeline read.
- HMS has `lib/services.ts:1733-1765` (`internalReferral.create`) but **no HMS API route** exposes referral creation; **no acceptance route**.

## 2. What Contradicts (P0/P1)
- **G.13 — Lifecycle uses Transactional Outbox: CONTRADICTED.** Both `createReferral` and the ANC route write the referral with **no** `OutboxEvent`. No downstream tracking/notification/Snapshot triggers.
- **G.1 — Doctor owns clinical recommendation: PARTIAL.** `fromDoctorId` recorded, but the caller-supplied value is not authorization-checked as the acting doctor.
- **G.3 — Creating referral does NOT close source episode: PARTIAL.** Only an insert happens, but there is **no source-episode linkage** (no FK to `Admission`/`Visit`), so closure cannot be enforced later.
- **G.4 — Source episode closes on physical departure: MISSING.** No linkage, no closure mechanism.
- **G.5 — Referral tracking continues separately: PARTIAL.** `status` field exists but no lifecycle state machine (`CREATED → SENT → VIEWED → ACCEPTED/DECLINED → PATIENT_LEFT → ARRIVED/NOT_ARRIVED/OUTCOME_UNKNOWN`).

## 3. What Is Missing (MVP-critical)
- G.2 (patient/caregiver destination choice — `toDoctorId` is set programmatically, no patient-facing workflow)
- G.6 (receiving staff operational receipt)
- G.7 (receiving doctor clinical acceptance + opinion capture)
- G.8 (accepted referral grants Clinical Snapshot access)
- G.9 (access expiry if no arrival)
- G.10 (permanent link to receiving episode — no FK)
- G.11 (source diagnosis immutability — no diagnosis linked to referral)
- G.12 (receiving hospital adds own opinion)
- G.14 (BROUGHT_DEAD only by authorized clinician — no concept/enum/check)

## 4. Trace (as-built)
```
Referring doctor (or ANC flow) → createReferral (services.ts:1754)
  → prisma.internalReferral.create  [no transaction, no outbox]
  ⇒ No SENT/VIEWED/ACCEPTED events ⇒ receiving desk never notified
  ⇒ No Clinical Snapshot grant ⇒ receiving doctor cannot see source context
  ⇒ Source episode never linked ⇒ cannot close on physical departure
```

## 5. Adversarial Findings
- Two hospitals cannot act concurrently safely: no episode linkage, no diagnosis immutability guard → receiving hospital could overwrite source diagnosis (violates G.11) since nothing prevents it.
- If `createReferral` succeeds but notification fails (no outbox) → referral is silently lost to the receiving side.
- No BROUGHT_DEAD gate → an unauthorized user could mark a referral outcome that clinically should require a clinician.

## 6. Must Refactor (reuse, do NOT duplicate)
- Extend `InternalReferral` with: `sourceEpisodeId` (FK Admission/Visit), `receivingEpisodeId` (FK, set on arrival), `lifecycleStatus` enum (G lifecycle), `patientChosenDestination` (G.2), `receivingOpinion` (G.12), `broughtDead` flag + `broughtDeadByClinicianId` (G.14), `snapshotAccessExpiresAt` (G.9).
- Wrap `createReferral` and acceptance in `prisma.$transaction` + `outboxEvent.create` (model on `packages/journey/src/engine.ts:23`).
- Add HMS routes: `app/api/referrals/route.ts` (create), `app/api/referrals/[id]/receive`, `/accept`, `/depart`, `/arrive`.
- Clinical Snapshot grant: on `ACCEPTED`, emit event → Timeline Engine constructs role-scoped snapshot (see TIMELINE_UNIFICATION_AUDIT / I).

## 7. Migration Risk
- Medium: backfill `InternalReferral.status` (`PENDING` → `CREATED`); add FKs; existing ANC `ReferralSlip` needs reconciliation or merge into `InternalReferral`.

## 8. Files Needing Change
- `packages/db/prisma/schema.prisma` (InternalReferral ~2492, ReferralSlip 1309)
- `apps/patient-portal/lib/services.ts:1754` (createReferral → transactional outbox)
- `apps/patient-portal/app/api/hospital/anc/referral/route.ts:24` (outbox)
- `apps/hospital-hms/lib/services.ts:1733` (expose via route)
- NEW: `apps/hospital-hms/app/api/referrals/**` (create/receive/accept/depart/arrive)
- `packages/timeline/src/queries.ts` (snapshot-by-referral-acceptance)
