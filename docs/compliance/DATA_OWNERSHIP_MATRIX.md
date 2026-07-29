# DATA OWNERSHIP MATRIX

Scope: Invariant E (Clinical Record Ownership) + cross-hospital ownership for Referral (G.10/G.11/G.12).
No code modified.

## Legend
OW = Owning hospital (creator) | RO = Read-only / receiving | ND = No direct access
"Immutable" = original record never rewritten; corrections via linked amendment.

## 1. Clinical Record Ownership

| Record | Owner | Can another hospital edit? | Immutable? | Correction mechanism | Evidence |
|---|---|---|---|---|---|
| `Visit` / `VisitNote` | Creating hospital | No | Partial | linked note | `schema.prisma:838,863` |
| `MedicalRecord` | Creating hospital | No | Partial | amendment | `schema.prisma:995` |
| `DiagnosticResult` | Creating hospital | No | Partial | amendment | `schema.prisma:788` |
| `PatientPrescription` | Creating hospital | No | Partial | new Rx | `schema.prisma:550` |
| `Admission` | Creating hospital | No | Partial | discharge state machine | `schema.prisma:1537` |
| `TimelineEvent` | Timeline Engine (per canonical Patient) | No (engine-owned) | YES (amend only) | `amendedEventId` | `schema.prisma:2961,2987` |
| `CareJourney`/`Milestone` | Journey Engine | No | Milestones immutable when COMPLETED | revision | journey models 3791+ |
| `RuleExecution` | Rules Engine | No | YES | — | `schema.prisma:3598` |
| `OutboxEvent` | Producing service | No | YES | DLQ | `schema.prisma:1413` |

**Finding (E):** Ownership is implicit via `hospitalId` FK, NOT enforced by a dedicated ownership/immutability subsystem. Cross-hospital overwrite is prevented only by convention, not by a guard. This is PARTIAL against E.1–E.7 and becomes critical under Referral (G.11).

## 2. Cross-Hospital (Referral) Ownership — `InternalReferral`

| Aspect | Hospital A (source) | Hospital B (receiving) |
|---|---|---|
| Source diagnosis | OW, immutable | RO (G.11) — must NOT modify |
| Receiving opinion | ND | OW, adds own (G.12) |
| Referral record | OW (created by A doctor) | RO until acceptance; then linked to B episode (G.10) |
| Clinical Snapshot access | grants on ACCEPTED (G.8) | receives, expires if no arrival (G.9) |
| Episode linkage | `sourceEpisodeId` | `receivingEpisodeId` (set on arrival) |

**Finding (G):** None of `sourceEpisodeId`, `receivingEpisodeId`, `receivingOpinion`, `snapshotAccessExpiresAt`, `broughtDead` exist today. Without them, G.10/G.11/G.12 cannot be enforced → receiving hospital could overwrite source diagnosis.

## 3. Identity Ownership (see IDENTITY_SOURCE_OF_TRUTH_AUDIT)
- Canonical Patient Registry (to be built) owns `Patient` identity; hospitals reference `canonicalPatientId`.
- `PatientAlias` (old→surviving) owned by Identity Authority (A.12/A.14).
- Hospital-created records reference but never own the Patient identity.

## 4. Must Refactor
- Add an ownership/immutability guard: a `RecordOwnership` concept or `createdByHospitalId` + soft-immutability trigger preventing UPDATE of clinical records by a non-owning hospital.
- Extend `InternalReferral` with the G.10/G.11/G.12 fields (see REFERRAL_PIPELINE_AUDIT).
- Enforce corrections via linked amendment records (E.6) for `MedicalRecord`, `DiagnosticResult`, `TimelineEvent` (already modeled for Timeline).

## 5. Files Needing Change
- `packages/db/prisma/schema.prisma` (InternalReferral, MedicalRecord, DiagnosticResult, add ownership guard)
- `packages/timeline/src/mutations.ts` (amendment enforcement)
- `apps/hospital-hms/app/api/referrals/**` (ownership-aware access)
