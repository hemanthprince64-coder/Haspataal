# P0_P1_P2 GAP REGISTER

Scope: Consolidated gap register across all invariants. Status legend per APPROVED_DECISIONS_INVARIANT_REGISTER.
No code modified.

## P0 — Launch Blockers (must fix before MVP launch)

| ID | Invariant | Gap | Evidence |
|---|---|---|---|
| P0-1 | A.1,A.2,A.3,A.4,A.6,A.8 | Identity split-brain ×3; `phone @unique` = identity; no `UserAccount`; password required | `schema.prisma:434,437,439`; `hospital-hms/prisma/schema.prisma:464`; `supabase/schema.sql:24-38`; `patient/route.ts:23-33` |
| P0-2 | A.9 | OTP plaintext; no encrypted mobile; no keyed lookup hash | `OtpCode 1363`; `otp.ts:16-20` |
| P0-3 | A.14, B.3,B.4 | No PatientAlias / merge / reconciliation | no model/code |
| P0-4 | F.1,F.2,F.6 | No discharge state machine; no `PATIENT_LEFT`; no Outbox emit | `ipd.ts:191-254`; `Admission.status 1544` |
| P0-5 | G.2–G.14 (core) | No referral lifecycle / outbox / acceptance / snapshot | `services.ts:1754`; `InternalReferral ~2492` |
| P0-6 | J.1,J.2 | Outbox lacks all structured fields; discharge/referral not transactional | `OutboxEvent 1413` |
| P0-7 | K.4,K.5,K.6 | No durable idempotency for notification/rules/search | `notification.worker.ts`; `rules-worker.ts:30`; `search.worker.ts:11` |
| P0-8 | L.13,L.14 | No real DLQ; no admin alert on exhaustion | `outbox-relay.worker.ts:72` |
| P0-9 | H.4,H.5 | Patient Portal bypasses Timeline Engine (direct Prisma stitching) | `actions.ts:2129-2275`; `records/route.ts:10-50` |
| P0-10 | M.1,M.5,M.6 | Care Journey duplicated; legacy AI auto-enrolls | `ai/engine.ts:303,306`; `actions.ts:335` |
| P0-11 | Part 5 (Admin) | Admin Panel has no monitoring/API | `apps/admin-panel` (no `app/api`) |
| P0-12 | B.1,B.2 | No Guest/Emergency registration without mobile | `patients/route.ts:28-70` |

## P1 — High Priority (fix during launch window)

| ID | Invariant | Gap |
|---|---|---|
| P1-1 | H.9,H.10 | Billing/payment/insurance events in clinical Timeline |
| P1-2 | H.11 | TimelineEvent missing episodeId/visibility/accessPolicy |
| P1-3 | H.12,I.1,I.2 | No amendment path; Clinical Snapshot never written; no relationship-scoped auth |
| P1-4 | L.1,L.2,L.5,L.6,L.7 | In-memory cycle tracker; no durable depth/causation; not configurable |
| P1-5 | L.15 | `update_record` can rewrite any clinical table (no whitelist) |
| P1-6 | L.18 | No rule lifecycle status (DRAFT→SIMULATION→APPROVAL→PUBLISHED) |
| P1-7 | M.8,M.9,M.10 | Discharge journey gate missing; no PATIENT_LEFT; activation not event-driven |
| P1-8 | M.11,M.12,M.13 | No immutable revisions; completed milestones mutable; no current/future guard |
| P1-9 | M.14,M.15 | No journey ownership field / reassignment / history |
| P1-10 | M.17,M.18 | No patient pause/stop; no reminder-preference control |
| P1-11 | Part 5 | Portal missing dependent/caregiver/discharge-medicine/sharing features |
| P1-12 | C.1,C.3,C.5,C.6 | Family graph flat; no OTP invite; no timeline permission; no Primary Caregiver |

## P2 — Medium / Deferrable (post-launch, non-blocking)

| ID | Invariant | Gap |
|---|---|---|
| P2-1 | A.5 | Multiple verified auth methods per UserAccount |
| P2-2 | A.11,A.12 | Merge-request workflow + Identity Authority role (data model can land in P0, UI in P2) |
| P2-3 | B.5 | Aadhaar-backed verification |
| P2-4 | B.6 | Caregiver-as-contact for mobile-less patient |
| P2-5 | C.4,C.7,C.8,C.9,C.10 | Pending invites; authorized caregiver scoping; temp Episode Caregiver; capacity-regain; caregiver audit |
| P2-6 | D.4,D.7,D.9,D.11 | Temporary newborn name; guardian mgmt while minor; attach mobile later; institutional guardian isolation |
| P2-7 | G.9 | Referral access expiry automation |
| P2-8 | M.19,M.20 | Reminder≠adherence enforcement; engagement from template milestones |
| P2-9 | L.8,L.17 | Hospital-only-lower depth config; enforce rules-trigger-rules via events only |

## Counts
- P0: 12 items (all architecture-contradicting).
- P1: 12 items.
- P2: 9 items.
