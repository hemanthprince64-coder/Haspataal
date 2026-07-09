# AUTHORIZATION MATRIX

Scope: Invariant H.7/H.8 (backend authorization = visibility; no frontend-only access) + Part 5 (no clinical authority to non-clinical admins).
No code modified.

## 1. Current Authorization Topology (problem)
- `packages/auth/authorization.ts` + `security.ts` = Express middleware, **not imported by any Next.js app** (grep 0 imports).
- Per-app guards: patient-portal `lib/auth/requireRole.ts` (cookie RBAC), HMS `lib/auth/roleGuard.ts` (JWT), admin-panel raw cookie.
- Timeline read filters only by `hospitalId` (`queries.ts` tenantScope) — no relationship/role auth (H.7 fails).
- Patient Portal builds its own timeline view from direct queries — frontend effectively decides access (H.8 fails).
- `localStorage` used for token/city in admin & patient UI — client-influenced gating.

## 2. Required Authorization Matrix (target state)

| Consumer | Resource | Allowed If | Denied If | Visibility decision |
|---|---|---|---|---|
| Patient | Own Timeline | `actor.patientId == timeline.patientId` | otherwise | Backend (engine) |
| Patient | Family member timeline | explicit OTP-verified link + granted permission (C.3/C.5) | otherwise | Backend |
| Patient | Dependent child timeline | guardian relationship while minor (D.7) | emancipated/revoked | Backend |
| Patient | Caregiver view | verified caregiver link (B.6) | otherwise | Backend |
| Clinician | Patient Timeline | active treatment OR accepted referral OR Care Journey (I) | otherwise | Backend |
| Clinician (receiving) | Source hospital snapshot | referral ACCEPTED (G.8) | pending/declined | Backend, expires if no arrival (G.9) |
| Clinician | Other hospital records | NEVER (E.2/G.11) | always | Backend |
| Hospital staff | Identity merge request | hospital authority/staff (A.11) | otherwise | Backend |
| Identity Authority | Final merge | only Haspataal Identity Authority (A.12) | otherwise | Backend |
| Non-clinical Admin | Clinical records | NEVER (Part 5) | always | Backend |
| Non-clinical Admin | Observability (Outbox/DLQ/Rules) | admin role | — | Backend (read-only ops) |
| Episode Caregiver | Temp authority | incapacity grant active (C.8) | capacity regained (C.9) | Backend, time-bounded |

## 3. Rules
- R1: All visibility decided server-side by the engine/authorization service. Frontends receive a scoped view only.
- R2: No `localStorage`-based access decisions; tokens server-validated.
- R3: Non-clinical admin has zero clinical write/mutation authority (verified PASS today; keep enforced).
- R4: Snapshot/referral access is purpose-scoped, relationship-scoped, time-bounded, audited (I.2).

## 4. Must Refactor
- Wire `packages/auth/authorization.ts` into Next.js middleware; replace per-app ad-hoc guards with a shared server-side `authorize(actor, resource, purpose)` used by every engine read.
- Add relationship/role scoping to `TimelineQueryHandler` (`queries.ts`) and `TimelineSnapshot` construction.
- Remove `localStorage` auth gating in admin/patient UI.
- Add `IdentityAuthority` role + merge-execution gate.

## 5. Files Needing Change
- `packages/auth/authorization.ts`, `security.ts`
- `packages/timeline/src/queries.ts`, `mutations.ts`
- `apps/hospital-hms/middleware.ts`, `lib/auth/roleGuard.ts`
- `apps/patient-portal/lib/auth/requireRole.ts`
- `apps/patient-portal/app/components/PatientHeader.js`, `apps/admin-panel/app/dashboard/rules/**` (localStorage)
- `packages/db/prisma/schema.prisma` (add `IdentityAuthority` role, snapshot access policy)
