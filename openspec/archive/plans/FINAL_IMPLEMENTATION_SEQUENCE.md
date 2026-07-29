# FINAL IMPLEMENTATION SEQUENCE

Scope: Exact first coding phase + acceptance criteria + the master digital-twin patient simulation (Part 4).
No code was modified during this audit. This document defines WHAT to build, in order. Implementation begins only after these deliverables are reviewed and approved.

---

## PART A — FIRST CODING PHASE (do this first)

**Phase: Outbox Contract Hardening + Discharge P0** (unblocks everything safe + exercises the hardest cross-cutting path).

### Files likely affected
- `packages/db/prisma/schema.prisma` — `OutboxEvent` (1413), `EventLog` (1427)
- `packages/platform-contracts/src/events/outbox.ts` — NEW canonical envelope
- `workers/outbox-relay.worker.ts` (68-98) — atomic mark + DLQ + admin alert
- `services/event.service.ts` (78-86), `services/event-emitter.ts`
- `apps/hospital-hms/lib/services/ipd.ts` (191-254) — transactional discharge + outbox
- `packages/journey/src/engine.ts` (23) — REFERENCE pattern (do not change)
- All `outboxEvent.create` producers (timeline/rules/notify/journey/config/settings)

### Migration risks
- HIGH: 52+ producer call sites (MR-1). Mitigate with nullable columns + backfill + staged tighten.
- HIGH: `dischargePatient` Supabase→Prisma transaction (MR-13). Preserve RLS.

### Acceptance criteria (all must pass)
1. `OutboxEvent` has `eventId@unique`, `eventVersion`, `aggregateType`, `aggregateId`, `tenantContext`, `actorContext`, `correlationId`, `causationId`, `depth`, `occurredAt`.
2. Outbox relay marks `processed` **atomically with dispatch**; on `error_count>=3` routes to `DeadLetterEvent` and emits an admin alert (L.13/L.14).
3. `dischargePatient` runs in `prisma.$transaction` and emits `DISCHARGE_ORDERED` / `PATIENT_LEFT` / `PATIENT_DISCHARGED` OutboxEvents inside that transaction (F.6, J.1).
4. Replaying the same discharge event twice yields exactly one Timeline event, one Notification, one Care Journey trigger (K.3/K.4/K.5/K.7).
5. Two relay pods processing concurrently produce no duplicate downstream state (K, FAILURE #6/#9).

---

## PART B — DIGITAL-TWIN MASTER PATIENT SIMULATION (Part 4)

Patient "Asha" simulated across 14 stages against CURRENT code. Verdict per stage: SUPPORTED / PARTIAL / BLOCKED.

### Stage 1 — Birth & Family Identity
- Independent Patient ID at birth: PARTIAL (`NewbornRecord.babyPatientId` 1298 links a Patient; no explicit "create at birth" API — D.2).
- Temporary newborn name: BLOCKED (no field/flag — D.4).
- Mother/father linking: PARTIAL (`FamilyMember` flat rows — C.1).
- No-mobile identity: BLOCKED (`Patient.phone @unique` required — D.3).
- Timeline creation: PARTIAL (Timeline Engine exists; no newborn event emitted).
**Verdict: BLOCKED** (mobile-required identity + no newborn API).

### Stage 2 — Childhood (vaccinations)
- Child timeline ownership: PASS (`VaccinationRecord.patientId` 1147).
- Parent access: PARTIAL (family rows; no guardian-minor mgmt — D.7).
- Notification ownership: PARTIAL.
- Family permission: BLOCKED (C.5).
**Verdict: PARTIAL.**

### Stage 3 — Adult Account Activation (mobile added)
- Mobile OTP: PARTIAL (OTP exists but plaintext, no lookup hash — A.9).
- UserAccount creation: BLOCKED (no `UserAccount` — A.2).
- Linking to existing Patient: BLOCKED (identity split-brain; would create duplicate — A.14).
- Prevent duplicate Patient: BLOCKED (hard `@unique` error, not safe alias — A.10).
**Verdict: BLOCKED.**

### Stage 4 — Emergency Guest Registration (age 60, confused)
- Search: PASS (HMS search route).
- Failed identity discovery: N/A.
- Guest ID without mobile: BLOCKED (mobile regex enforced — B.1/B.2).
- Caregiver linking: BLOCKED (B.6).
- Emergency registration: BLOCKED.
**Verdict: BLOCKED** (no guest path).

### Stage 5 — Identity Reconciliation
- Canonical discovery: BLOCKED (no registry/lookup hash — A.9).
- Guest reconciliation: BLOCKED (no flow — B.3).
- Alias handling: BLOCKED (no `PatientAlias` — A.14).
- Duplicate prevention: BLOCKED.
- Audit trail: BLOCKED.
- No historical rewrite: N/A (no merge exists).
**Verdict: BLOCKED.**

### Stage 6 — Admission (DKA)
- Presenting complaint/diagnosis/investigations/treatment/medicines/progress: PARTIAL (Visit/VisitNote/MedicalRecord/PatientMedication exist; HMS writes via Supabase; no structured IPD admission clinical model beyond `Admission`).
- Admission state: PARTIAL (free `String` status — F).
- No ICU flowsheets required for MVP (in scope).
**Verdict: PARTIAL.**

### Stage 7 — Rules
- Event causation: PARTIAL (correlationId only; causationId/depth not propagated — L.2).
- Rule evaluation: PASS (durable history — L.3).
- Chained rule: PARTIAL (no durable chain tracking — L.4).
- Duplicate delivery: BLOCKED (rules worker no dedup — K.5).
- Cyclic rule attempt: PARTIAL (in-memory tracker, lost on restart — L.1/L.5).
- Max-depth breach: PARTIAL (hardcoded 10, not durable/configurable — L.6/L.7).
- Worker crash: GAP (in-memory state lost — FAILURE #2/#8).
- Multi-pod: GAP (divergent depth — FAILURE #9).
- Downstream Timeline outage: SAFE (Outbox + DB dedup).
**Verdict: PARTIAL w/ resilience gaps.**

### Stage 8 — Recovery & Discharge
- `DISCHARGE_ORDERED`→…→`PATIENT_DISCHARGED`: BLOCKED (no state machine; direct `DISCHARGED`; no `PATIENT_LEFT` — F.1/F.2).
- Episode/bed state: PARTIAL (bed freed; no left-state).
- Billing independence: PARTIAL (DRAFT invoice — F.3/F.4).
- Discharge medicines / duration: PARTIAL.
- Timeline event: BLOCKED (discharge emits no Outbox — F.6).
- Search update / Notification / Care Journey activation: BLOCKED (depend on discharge Outbox — M.8/M.10).
**Verdict: BLOCKED** (no discharge Outbox).

### Stage 9 — Post-Discharge Care Journey
- Doctor-selected journey: BLOCKED (legacy auto-enrolls; no doctor decision gate — M.5/M.6).
- Hospital default: MISSING (M.7).
- Patient customization / milestone completion / engagement / reminders: PARTIAL (legacy AI; no patient control — M.18).
- Modification / immutable revision: BLOCKED (no revision — M.11).
- Multiple journeys: PASS (M.16).
- Pause/stop: BLOCKED (no methods/UI — M.17).
- Doctor reassignment: BLOCKED (no ownership — M.14/M.15).
**Verdict: BLOCKED** (duplication + no controls).

### Stage 10 — Clinical Deterioration
- Follow-up record / reassessment: PARTIAL.
- Journey modification: BLOCKED (no revision — M.11).
- Readmission option: MISSING.
- Referral option: PARTIAL (createReferral exists, no lifecycle).
**Verdict: PARTIAL.**

### Stage 11 — Higher-Centre Named Referral
- Referral creation: PARTIAL (no outbox/lifecycle — G.13).
- Patient destination choice: BLOCKED (G.2).
- Receiving desk access: BLOCKED (no receive route — G.6).
- Receiving doctor acceptance: BLOCKED (G.7).
- Immediate Clinical Snapshot: BLOCKED (no snapshot grant — G.8/I).
- Source episode active until departure: BLOCKED (no linkage — G.3/G.4).
- Patient departure / source closure: BLOCKED.
- Referral tracking continuation: PARTIAL.
**Verdict: BLOCKED.**

### Stage 12 — Receiving Hospital
- Arrival confirmation: BLOCKED (no arrive route — G).
- Referral-linked new episode: BLOCKED (no `receivingEpisodeId` — G.10).
- Hospital A diagnosis preservation: PARTIAL (no enforcement guard — E/G.11).
- Hospital B independent diagnosis: BLOCKED (no `receivingOpinion` — G.12).
- Record ownership: PARTIAL (implicit hospitalId).
- Clinical Snapshot access: BLOCKED (I).
- Timeline continuity: PARTIAL (engine per canonical ID — but canonical ID split-brain undermines it — A.6).
**Verdict: BLOCKED.**

### Stage 13 — Second Discharge
- Hospital B discharge: BLOCKED (same as Stage 8).
- Patient journey decisions (A/B/both/pause/stop): BLOCKED (M.17).
**Verdict: BLOCKED.**

### Stage 14 — Failure Cases (see FAILURE_INJECTION_REPORT for full matrix)
- Authoritative state preserved: YES (where in-transaction outbox used).
- Data lost: YES risk on relay crash (dispatch-before-mark) + stale-retry skip (FAILURE #6/#10).
- Safe retry: ONLY Timeline safe; Search/Rules/Notification NOT (no durable dedup).
- Duplicate state: YES risk for Search/Rules/Notification/multi-pod.
- User blocked unnecessarily: NO (failures are silent, not blocking — but data inconsistency results).
- Admin alerted: NO (no DLQ alert — L.14).
**Verdict: RESILIENCE GAPS (P0-7/P0-8).**

---

## PART C — END-TO-END ACCEPTANCE (post-remediation, before launch)
Run the 14-stage simulation again. All stages must reach SUPPORTED/PARTIAL (no BLOCKED) for MVP scope. Specifically verify:
- Asha's canonical Patient ID is stable from birth through adulthood and across two hospitals (A.1/D.8).
- Emergency guest → reconciliation → alias, no duplicate, no historical rewrite (B.3/B.4/A.13/A.14).
- Discharge emits events; Care Journey activates only after `PATIENT_LEFT→PATIENT_DISCHARGED` and never blocks discharge (F/M.8/M.9).
- Named referral grants Snapshot on ACCEPTED, expires if no arrival; Hospital A diagnosis preserved (G.8/G.9/G.11).
- Replaying any event produces no duplicate state; DLQ exhaustions alert an admin (K/L.14).

> **STOP — audit complete. No remediation implemented. Awaiting review/approval of these 20 deliverables before any code changes.**
