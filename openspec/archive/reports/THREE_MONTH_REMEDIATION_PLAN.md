# THREE-MONTH REMEDIATION PLAN

Scope: Phased plan to reach MVP launch-readiness within ~3 months. Builds on DEPENDENCY_ORDER, P0_P1_P2_GAP_REGISTER, DATABASE_MIGRATION_RISK_REGISTER.
No code modified.

## Feasibility Verdict
**Achievable with scope control.** The engine skeleton, Outbox pattern, and several models already exist and can be *completed*, not rebuilt. The dominant work is schema migration + refactor of discharge/referral to transactional outbox + portal rewiring + new admin monitoring.

## Monthly Breakdown

### Month 1 — Foundation (P0-6, P0-7, P0-8, P0-1 partial)
- W1: Outbox contract hardening — add structured columns (`OutboxEvent` 1413), `eventId @unique`, `EventLog.idempotency_key` (MR-1/MR-2). Reference `journey/src/engine.ts:23`.
- W2: Outbox relay atomicity + real DLQ table + admin alert at `error_count>=3` (`outbox-relay.worker.ts:68-98`). Durable idempotency ledger for Search/Rules/Notification (K.4/K.5/K.6).
- W3: Canonical Patient Registry schema — `UserAccount` split, optional `phone`/`password`, `mobileEncrypted`/`mobileLookupHash`/`canonicalPatientId`/`identityStatus`, `PatientAlias`, `IdentityMergeRequest` (MR-3). Backfill script.
- W4: OTP — encrypt normalized mobile, keyed lookup hash, separate OTP-verification state (`OtpCode` 1363, `otp.ts`).
- Exit: events are safe under at-least-once; identity model in place (not yet fully cut over).

### Month 2 — State Machines + Engines (P0-4, P0-5, P0-10, P1-4..P1-9)
- W1: Discharge state machine — `Admission.status` enum + `dischargePatient` transactional outbox (`ipd.ts:191`, MR-6).
- W2: Referral lifecycle + Clinical Snapshot — `InternalReferral` FKs/enum (`~2492`), HMS routes, snapshot grant on ACCEPTED (G/I, MR-7).
- W3: Care Journey de-dup — retire legacy AI engine writes (`ai/engine.ts`), route suggestions to `JourneyEngine` with doctor decision; add pause/stop/ownership/revisions (M, MR-9/MR-12).
- W4: Rules safety — durable depth/cycle ledger, `update_record` whitelist, DLQ alert, rule lifecycle status (L, MR-10/MR-11).
- Exit: discharge/referral/journey emit and consume events correctly.

### Month 3 — Portals + Authorization + Identity cutover (P0-9, P0-11, P0-12, P0-2 cutover, P1-1..P1-3, P1-11, P1-12)
- W1: Authorization backbone — wire `packages/auth`; server-side visibility; `IdentityAuthority` role (H.7/H.8, Part 5).
- W2: Patient Portal rewiring — consume Timeline/Journey/Search engines; add dependent/caregiver/discharge-medicine/sharing; guest registration w/o mobile (B.1/B.2).
- W3: Admin observability — 9 monitoring endpoints (Outbox depth, DLQ, Rules failures, Timeline lag, Journey activation, referral delivery, cycle prevention, identity merge queue).
- W4: Identity cutover — migrate HMS Supabase/Prisma onto canonical registry; reconcile; DELETE DR-1/DR-2 after verification. Family/guardian graph + OTP invite (C.1/C.3/C.5/C.6).
- Exit: MVP launch-ready against approved invariants (remaining P2 deferred).

## Defer if Overrun (P2 — non-blocking)
- B.5 Aadhaar verification; B.6 caregiver-as-contact; C.4/C.7/C.8/C.9/C.10; D.4/D.7/D.9/D.11; G.9 access-expiry automation; M.19/M.20; L.8/L.17.
These do not block launch and can ship in a fast-follow.

## Risk Controls
- Every migration inside same transaction as first Outbox emit (J.1).
- Reuse existing engines; no second registry/timeline/journey.
- No historical clinical record rewrite; linked amendments only.
- Verify each phase with the digital-twin simulation (FINAL_IMPLEMENTATION_SEQUENCE.md appendix).
