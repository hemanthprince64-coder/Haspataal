# PHASE 6 EXECUTIVE VERDICT

> Digital-twin simulation of the current Haspataal codebase against the approved MVP architecture.
> No code was modified. Every conclusion is backed by an audit file and exact file:line evidence.

## 0. Verdict in One Line

**The platform is NOT launch-ready against the approved architecture.** The *engine skeleton* (Timeline, Journey, Rules publishers + Outbox relay) is sound and reusable, but the *identity backbone*, *discharge/referral state machines*, *Outbox contract*, *idempotency/DLQ*, and *portal integration* are materially contradictory to the approved invariants. Several MVP-critical capabilities (guest registration, identity reconciliation, referral lifecycle, patient-controlled journey pause/stop) do not exist at all.

## A. Current Readiness Score (0–5, 5 = production-grade & invariant-compliant)

| Area | Score | One-line basis |
|---|---|---|
| Identity | **0** | `Patient.phone @unique` is identity; no UserAccount/registry/alias/merge; 3-way split-brain (packages/db, hospital-hms Prisma, Supabase) |
| Discharge | **1** | No state machine; direct `DISCHARGED`; no `PATIENT_LEFT`; no Outbox emit |
| Referral | **1** | Model exists, no lifecycle, no Outbox, no snapshot/acceptance |
| Timeline | **3** | Engine pipeline correct & sole writer, but Patient Portal bypasses it; billing events leak in; missing episode/visibility fields |
| Rules | **2** | Durable execution history + outbox actions, but in-memory cycle tracker, unguarded `update_record`, no DLQ alert |
| Care Journey | **2** | New engine good, but DUPLICATED by legacy AI engine that auto-enrolls; no ownership/immutable-revision/pause-stop |
| Patient Portal | **1** | Bypasses engines, direct Prisma clinical stitching, missing dependent/caregiver/discharge-medicine/sharing features |
| HMS | **3** | Consumes Timeline correctly; but discharge/referral/auth use Supabase & lack state machines |
| Admin Observability | **0** | Admin Panel has 4 pages, no API routes, zero of the 9 required monitoring signals |
| Failure Resilience | **1** | No real DLQ; outbox relay dispatch-before-mark ⇒ duplicate risk; in-memory idempotency lost on restart |

## B. Top Launch Blockers (genuine, MVP-critical)

1. **Identity split-brain + mobile-as-identity (A.1–A.9, A.14).** Without a canonical Patient Registry, every downstream invariant (timeline per canonical ID, referral snapshots, family graph, merge) is unsound. This is the root blocker.
2. **No Discharge state machine (F.1–F.6).** Financial and clinical discharge are collapsed; `PATIENT_DISCHARGED` can fire before physical departure; no Outbox ⇒ Care Journey / Timeline / Search / Notification never trigger reliably.
3. **No Transactional Outbox contract (J.1–J.2).** `OutboxEvent` lacks `eventId/eventVersion/aggregateType/aggregateId/tenantContext/actorContext/correlationId/causationId/depth/occurredAt`. Cross-engine traceability, rule chain depth, and idempotency are impossible as specified.
4. **No durable idempotency / no real DLQ (K.1–K.7, L.13–L.14).** At-least-once delivery is NOT safe: search/rules/notification dedup is in-memory (lost on restart/multi-pod); outbox relay skips `errorCount>=3` silently (lost events, no alert).
5. **Patient Portal bypasses engines (H.4–H.5, Part 5).** It stitches `visit/labOrder/patientPrescription/pharmacyDispense` directly — a divergent, unauthorized, non-canonical timeline. This makes the canonical-Timeline invariant unenforceable for patients.
6. **Care Journey duplication + auto-enroll (M.1, M.5, M.6).** Legacy `apps/patient-portal/lib/ai/engine.ts` auto-creates `careJourney` on visit-save, bypassing doctor decision and the new engine. Two sources of truth for journey state.
7. **No Admin Observability (Part 5).** Outbox depth, DLQ, Rules failures, cycle prevention, journey activation failures, referral delivery failures are invisible — operationally unmanageable at launch.
8. **Missing MVP features entirely:** Guest/Emergency registration (B.1–B.6), Identity reconciliation (A.11–A.14, B.3–B.4), Referral lifecycle + acceptance + Clinical Snapshot (G.2–G.14), patient-controlled journey pause/stop/sharing (M.17, Part 5).

## C. Correct Implementation Order (dependency-safe)

See DEPENDENCY_ORDER.md and FINAL_IMPLEMENTATION_SEQUENCE.md. Summary:
1. **Outbox contract + durable idempotency + DLQ** (unblocks everything safe).
2. **Canonical Patient Registry + UserAccount split + alias/merge** (unblocks B/C/D/G/H/I).
3. **Authorization backbone** (wire `packages/auth`, server-side visibility).
4. **Discharge + Referral state machines via Outbox** (F, G).
5. **Timeline enrichment** (episode/visibility fields, remove billing events, Clinical Snapshot).
6. **Rules safety** (durable depth/cycle, action whitelist, DLQ alert).
7. **Care Journey de-duplication + pause/stop + ownership**.
8. **Portal rewiring** (Patient Portal → engines; Admin observability).

## D. Three-Month Feasibility

**Achievable with scope control.** The engine skeleton, outbox pattern, and several models already exist and can be completed rather than rebuilt. The work is primarily (a) schema migrations, (b) refactor of discharge/referral to transactional outbox, (c) portal rewiring, (d) new admin monitoring. 

**Must be deferred if overrun:** Aadhaar-backed verification (B.5), full family OTP invitation network (C.3–C.5), caregiver temporary-authority lifecycle (C.8–C.9), institutional-guardian model (D.11), referral access-expiry automation (G.9). These are non-blocking for MVP and can ship post-launch.

**Unrealistic within 3 months if attempted literally:** rebuilding identity from scratch (avoid — reuse `packages/db` Patient, add UserAccount/Alias/Merge alongside). Re-platforming HMS off Supabase (avoid — keep HMS Supabase for RLS but route identity through canonical registry via read-replica/lookup).

## E. First Coding Phase

**Target: Outbox Contract Hardening + Discharge P0 (the two hardest cross-cutting blockers).**
- Files: `packages/db/prisma/schema.prisma` (`OutboxEvent` 1413, `EventLog` 1427), `workers/outbox-relay.worker.ts:68-98`, `services/event.service.ts:78-86`, `apps/hospital-hms/lib/services/ipd.ts:191-254`, `packages/journey/src/engine.ts` (reference pattern).
- Migration risk: High (52+ `outboxEvent.create` call sites; extract payload-embedded fields to columns; backfill `Admission` status).
- Acceptance criteria: (1) `OutboxEvent` has all J.2 columns; (2) outbox relay marks `processed` atomically with dispatch and routes `errorCount>=3` to a DLQ table that emits an admin alert; (3) `dischargePatient` runs in `prisma.$transaction` and emits a `DISCHARGE_*` OutboxEvent; (4) a discharging patient physically leaving triggers Care Journey/Timeline/Notification via the relay with no duplicate on replay.

> **STOP — audit complete. No remediation implemented. Awaiting review/approval before any code changes.**
