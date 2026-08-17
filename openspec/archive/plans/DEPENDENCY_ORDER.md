# DEPENDENCY ORDER

Scope: Correct sequencing of remediation so no phase depends on an unfinished prerequisite.
No code modified.

## Dependency Graph (prerequisites → phase)

```
PHASE 0  Outbox Contract + Durable Idempotency + DLQ
           └─ required by EVERY downstream event-driven feature
                ├─ Discharge (F)            needs transactional outbox
                ├─ Referral (G)             needs transactional outbox
                ├─ Care Journey (M)         already uses outbox; needs DLQ/alert
                ├─ Rules (L)                needs durable depth/DLQ
                └─ Timeline (H)             needs episode/visibility fields (schema)

PHASE 1  Canonical Patient Registry
           (UserAccount split, PatientAlias, IdentityMergeRequest,
            encrypted mobile + lookup hash, OTP state split)
           └─ required by B (guest), C (family), D (child), G (snapshot scope),
              H/I (visibility by canonical ID), Authorization

PHASE 2  Authorization Backbone
           (wire packages/auth; server-side visibility; IdentityAuthority role)
           └─ required by H.7/H.8, I, Part 5, DataOwnership enforcement

PHASE 3  Discharge State Machine (F)  [depends 0,1,2]
PHASE 4  Referral Lifecycle + Clinical Snapshot (G,I)  [depends 0,1,2]
PHASE 5  Timeline Enrichment (H.9–H.12, I)  [depends 0,1,2]
PHASE 6  Rules Safety (L)  [depends 0]
PHASE 7  Care Journey De-dup + pause/stop + ownership (M)  [depends 0,3]
PHASE 8  Portal Rewiring (Patient Portal→engines; HMS referral/guest/reconcile)  [depends 3,4,5,7]
PHASE 9  Admin Observability (Part 5)  [depends 0,6]
PHASE 10 Family/Guardian/Child completion (C,D) + deferred P2  [depends 1,2]
```

## Hard Rules
- R1: Do NOT create a second Patient Registry, second Timeline, or second Journey Engine. Reuse `packages/db` Patient, `packages/timeline`, `packages/journey`.
- R2: Do NOT rewrite historical clinical records; use linked amendments.
- R3: Do NOT make mobile the Patient ID; canonical ID is the `Patient.id` uuid.
- R4: No frontend-only authorization; all visibility server-side.
- R5: No synchronous cross-engine calls for critical state; use Outbox + relay.

## Sequencing Rationale
1. Outbox/Idempotency/DLQ first because every other fix emits events and must be safe under at-least-once delivery.
2. Identity second because B/C/D/G/H/I all key off the canonical Patient ID and merge/alias semantics.
3. Authorization third because visibility decisions gate every portal/engine read.
4. Discharge/Referral before Journey because journey activation is triggered by discharge events (M.8).
5. Portal rewiring last (after engines are correct) to avoid rewiring twice.
