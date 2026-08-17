# APPROVED DECISIONS — INVARIANT REGISTER

Converts the approved Phase 6 architecture decisions (Parts 2 A–M) into machine-testable invariants.
Each invariant has a stable ID used by every other deliverable. Status legend:
`PASS / PARTIAL / CONTRADICTED / MISSING / LEGACY / DUPLICATED / UNSAFE_TO_MIGRATE_DIRECTLY`.

Current status is filled from the Phase 6 audit (see per-area audit files for evidence).

## A. Patient Identity
| ID | Invariant | Status |
|---|---|---|
| A.1 | One human = one lifelong canonical Patient ID | CONTRADICTED |
| A.2 | Patient and UserAccount are SEPARATE entities | CONTRADICTED |
| A.3 | A Patient may exist without a login account | CONTRADICTED |
| A.4 | Mobile number is auth/contact, NOT patient identity | CONTRADICTED |
| A.5 | One UserAccount may have multiple verified auth methods | MISSING |
| A.6 | ONE canonical Patient Registry is identity source of truth | CONTRADICTED |
| A.7 | Hospital records reference the canonical Patient ID | CONTRADICTED |
| A.8 | No Supabase/Prisma identity split brain | CONTRADICTED (split-brain ×3) |
| A.9 | Mobile lookup: encrypted normalized + keyed lookup hash + separate OTP state | CONTRADICTED |
| A.10 | Duplicate identities NEVER auto-merged | PASS (vacuous — no merge code) |
| A.11 | Hospital/staff may raise merge request | MISSING |
| A.12 | Only Haspataal Identity Authority performs final merge | MISSING |
| A.13 | Historical clinical records never rewritten during merge | MISSING |
| A.14 | Old Patient IDs become aliases → surviving canonical ID | MISSING |

## B. Guest and Emergency Identity
| ID | Invariant | Status |
|---|---|---|
| B.1 | Unknown/unconscious patient may receive Guest Patient ID | MISSING |
| B.2 | Mobile NOT mandatory for emergency registration | MISSING |
| B.3 | Guest episodes may reconcile to verified canonical Patient | MISSING |
| B.4 | Original Guest ID + reconciliation audit permanent | MISSING |
| B.5 | Aadhaar-backed verification optional | MISSING |
| B.6 | Patient w/o mobile may use verified caregiver as access/contact | MISSING |
| B.7 | Caregiver identity never becomes patient identity | PASS (structural) |

## C. Family and Guardian
| ID | Invariant | Status |
|---|---|---|
| C.1 | Family members retain independent Patient IDs + timelines | CONTRADICTED |
| C.2 | Family Network is a relationship graph | PARTIAL |
| C.3 | Mobile-linked family relationships require OTP | MISSING |
| C.4 | Pending invitations supported | MISSING |
| C.5 | Patient controls family timeline permissions | MISSING |
| C.6 | Primary Caregiver may be designated | MISSING |
| C.7 | Additional caregivers receive only authorized access | MISSING |
| C.8 | Incapacity may create temporary Episode Caregiver authority | MISSING |
| C.9 | Patient regaining capacity ends temporary authority | MISSING |
| C.10 | Guardian/caregiver actions audited | PARTIAL |

## D. Child and Dependent Identity
| ID | Invariant | Status |
|---|---|---|
| D.1 | Every child gets independent lifelong Patient ID | PARTIAL |
| D.2 | Newborn Patient ID created at birth in connected hospital | PARTIAL |
| D.3 | No mobile required for child | CONTRADICTED |
| D.4 | Temporary newborn names allowed | MISSING |
| D.5 | Multiple births get separate Patient IDs | PASS |
| D.6 | Vaccinations belong to child timeline | PASS |
| D.7 | Parents/guardians manage while minor | MISSING |
| D.8 | Same Patient ID continues into adulthood | PASS |
| D.9 | Mobile/login may later attach without new Patient | MISSING |
| D.10 | Guardian changes never change Patient ID | PASS |
| D.11 | Institutional guardians never own identity/timeline | MISSING |

## E. Clinical Record Ownership
| ID | Invariant | Status |
|---|---|---|
| E.1 | Each hospital owns clinical records it creates | PARTIAL |
| E.2 | Another hospital cannot edit/overwrite those records | PARTIAL |
| E.3 | Previous diagnoses remain historical opinions | PARTIAL |
| E.4 | New clinicians add their own opinion | PARTIAL |
| E.5 | Historical clinical records immutable | PARTIAL |
| E.6 | Corrections use linked amendment records | PARTIAL |
| E.7 | Original history remains auditable | PARTIAL |
*(No dedicated subsystem enforces cross-hospital ownership immutability; relies on FK ownership. See DATA_OWNERSHIP_MATRIX.)*

## F. Discharge (state machine)
| ID | Invariant | Status |
|---|---|---|
| F.1 | DISCHARGE_ORDERED ≠ PATIENT_DISCHARGED | CONTRADICTED |
| F.2 | PATIENT_DISCHARGED only after physical departure | CONTRADICTED |
| F.3 | Clinical discharge and financial settlement separate | PARTIAL |
| F.4 | Pending billing must not corrupt clinical state | PARTIAL |
| F.5 | Authoritative HMS service owns discharge state | PARTIAL |
| F.6 | Final discharge emits Outbox event | CONTRADICTED |
| F.7 | No direct Timeline write | PARTIAL (vacuous for discharge) |

## G. Referral
| ID | Invariant | Status |
|---|---|---|
| G.1 | Doctor owns clinical recommendation | PARTIAL |
| G.2 | Patient/caregiver owns destination choice | MISSING |
| G.3 | Creating referral does NOT close source episode | PARTIAL |
| G.4 | Source episode closes on physical departure | MISSING |
| G.5 | Referral tracking continues separately | PARTIAL |
| G.6 | Receiving staff may operationally receive | MISSING |
| G.7 | Receiving doctor clinically accepts | MISSING |
| G.8 | Accepted referral grants Clinical Snapshot access | MISSING |
| G.9 | Access expires if referral closes w/o arrival | MISSING |
| G.10 | Referral permanently linked to receiving episode | MISSING |
| G.11 | Source diagnosis not modified by receiving hospital | MISSING |
| G.12 | Receiving hospital adds own opinion | MISSING |
| G.13 | Lifecycle uses Transactional Outbox | CONTRADICTED |
| G.14 | BROUGHT_DEAD only by authorized clinician | MISSING |

## H. Canonical Timeline
| ID | Invariant | Status |
|---|---|---|
| H.1 | Engine owns one stream per canonical Patient ID | PASS |
| H.2 | Engine is SOLE writer | PASS |
| H.3 | HMS never writes directly | PASS |
| H.4 | Patient Portal consumes Timeline Engine | CONTRADICTED |
| H.5 | Manual Prisma stitching forbidden | CONTRADICTED |
| H.6 | Patient + clinician same stream | CONTRADICTED |
| H.7 | Backend authorization = visibility | CONTRADICTED |
| H.8 | Frontends don't decide access | CONTRADICTED |
| H.9 | Only clinical events in Timeline | CONTRADICTED |
| H.10 | Ops/billing/security OUTSIDE clinical Timeline | PARTIAL |
| H.11 | Events preserve hospital/episode/actor/ts/visibility/policy | CONTRADICTED |
| H.12 | Corrections = immutable linked amendments | PARTIAL |

## I. Clinical Snapshot
| ID | Invariant | Status |
|---|---|---|
| I.1 | Role-specific snapshots by authorized relationship | CONTRADICTED |
| I.2 | Access backend-authorized, purpose/relationship/time scoped, audited | MISSING |

## J. Transactional Outbox Standard
| ID | Invariant | Status |
|---|---|---|
| J.1 | State change + OutboxEvent in ONE transaction | CONTRADICTED (discharge/referral) |
| J.2 | Required structured fields present | CONTRADICTED |
| J.3 | Sensitive payloads not copied unnecessarily | PARTIAL |
| J.4 | Consumers fetch authorized detail via contracts | PARTIAL |

## K. Idempotency
| ID | Invariant | Status |
|---|---|---|
| K.1 | Persist processed event IDs | PARTIAL |
| K.2 | Reject duplicate processing | PARTIAL |
| K.3 | No duplicate Timeline events | PASS |
| K.4 | No duplicate notifications | PARTIAL |
| K.5 | No duplicate rule executions | MISSING |
| K.6 | No duplicate Search updates | PARTIAL |
| K.7 | No duplicate Care Journey actions | MISSING |

## L. Rules Engine
| ID | Invariant | Status |
|---|---|---|
| L.1 | No in-memory recursion tracker as source of truth | CONTRADICTED |
| L.2 | Every chain uses eventId/correlationId/causationId/depth | PARTIAL |
| L.3 | Rule execution history durable | PASS |
| L.4 | Duplicate chains rejected | MISSING |
| L.5 | Cycles detected | PARTIAL |
| L.6 | Max chain depth enforced | PARTIAL |
| L.7 | Haspataal defines platform max | PARTIAL |
| L.8 | Hospitals configure only lower limits | MISSING |
| L.9 | Redis coordinates but not source of truth | PARTIAL |
| L.10 | Evaluation and action delivery separate | PASS |
| L.11 | Rule actions use Outbox | PARTIAL |
| L.12 | Failed actions retry | PARTIAL |
| L.13 | Retry exhaustion → DLQ | PARTIAL |
| L.14 | DLQ creates admin alert | CONTRADICTED |
| L.15 | Rules cannot rewrite authoritative clinical records | CONTRADICTED |
| L.16 | Rules may generate alerts/recommendations/commands/automation | PASS |
| L.17 | Rules trigger rules only via explicit domain events | PARTIAL |
| L.18 | Clinical rules DRAFT→SIMULATION→APPROVAL→PUBLISHED, versioning/rollback | MISSING |

## M. Care Journey
| ID | Invariant | Status |
|---|---|---|
| M.1 | Journey Engine sole source of truth | CONTRADICTED / DUPLICATED |
| M.2 | Timeline records only meaningful journey events | PARTIAL |
| M.3 | Journey changes use Transactional Outbox | PARTIAL |
| M.4 | Diagnosis/discharge/referral MAY suggest journey | PARTIAL |
| M.5 | Must NOT auto-enroll patient | CONTRADICTED |
| M.6 | Treating/discharging doctor final enrollment decision | CONTRADICTED |
| M.7 | Hospital default may be preselected | MISSING |
| M.8 | Discharge journey active only after PATIENT_LEFT→PATIENT_DISCHARGED | CONTRADICTED |
| M.9 | Journey activation failure must NEVER block discharge | PARTIAL |
| M.10 | Failed activation retries through Outbox | PARTIAL |
| M.11 | Journey modifications create immutable revisions | MISSING |
| M.12 | Completed milestones remain immutable | PARTIAL |
| M.13 | Only current/future milestones may change | MISSING |
| M.14 | Ownership reassigned if doctor unavailable | MISSING |
| M.15 | Ownership history permanent | MISSING |
| M.16 | Multiple simultaneous journeys supported | PASS |
| M.17 | Patient controls pause/stop across hospitals | MISSING |
| M.18 | Reminder preference patient-controlled | MISSING |
| M.19 | Reminder activity ≠ medication adherence | PARTIAL |
| M.20 | Engagement defined by clinically meaningful template milestones | MISSING |
