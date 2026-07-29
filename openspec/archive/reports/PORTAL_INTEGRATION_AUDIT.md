# PORTAL INTEGRATION AUDIT

Scope: Part 5 (Patient Portal, Hospital HMS, Admin Panel validation) + authorization wiring.
No code modified.

## 1. Patient Portal — `apps/patient-portal`
| Feature | Status | Evidence |
|---|---|---|
| Own longitudinal Timeline | CONTRADICTED | `app/actions.ts:2129-2275` stitches `prisma.visit/labOrder/patientPrescription/pharmacyDispense` directly; `app/api/patient/records/route.ts:10-50` repeats. No `@haspataal/timeline` import. |
| Family network | PASS | `app/actions.ts:900-940`, `lib/services.ts:836-861` |
| Dependent child profiles | MISSING | no route/component/page |
| Caregiver relationships | PARTIAL | `lib/services/abdm-mock.ts:63-75` links as `familyMember`; no UI |
| Referrals | PARTIAL | only ANC `app/api/hospital/anc/referral/route.ts:5-47`; no general patient referral |
| Discharge summary | PARTIAL | hospital-side only; no patient viewer |
| Discharge medicines | MISSING | `app/(patient)/pharmacy/page.js` is OTC storefront |
| Care Journeys | PARTIAL | `app/journeys/page.tsx` fetches `/api/journeys` but no matching patient-portal API route |
| Reminders | PARTIAL | hospital config exists; patient pause/stop MISSING |
| Patient-controlled pause/stop | MISSING | no control |
| Sharing controls | PARTIAL | consent record/withdraw `actions.ts:1544-1586`, `services.ts:2225-2291`; no granular UI |

**Headline:** Zero imports of `@haspataal/timeline`, `@haspataal/rules`, `@haspataal/search`, `@haspataal/notify` (only `@haspataal/queue`, `lib/infrastructure/queues.ts:1`). The portal bypasses engines and queries clinical Prisma directly — the forbidden pattern (H.4/H.5).

## 2. Hospital HMS — `apps/hospital-hms`
| Feature | Status | Evidence |
|---|---|---|
| Search/registration | PASS | `app/search/page.js`, `app/register/page.js`, `app/api/search/route.ts` |
| Guest registration | PARTIAL | `app/api/patients/route.ts:28-70` allows unauth but enforces mobile regex `/^[6-9]\d{9}$/` ⇒ mobile required (B.2 violated) |
| Identity reconciliation | MISSING | no request/merge flow |
| OPD | PASS | present |
| IPD | PASS | `lib/services/ipd.ts` |
| Discharge state machine UI/API | PARTIAL | API exists; no explicit state-machine UI; no `PATIENT_LEFT` |
| Referral creation | PARTIAL | `lib/services.ts:1733-1765` exists, no HMS route |
| Referral acceptance | MISSING | no route |
| Clinical Snapshot | MISSING | no endpoint |
| Care Journey selection | PASS | `app/api/journeys/route.ts` uses `@haspataal/journey` |
| Readmission | MISSING | no route |
| Timeline consumption | PASS (with caveat) | imports `TimelineQueryHandler` in 15+ routes; BUT `lib/services/visits.ts:5-39` stitches via Supabase, bypassing engine |

## 3. Admin Panel — `apps/admin-panel`
- Pages: dashboard, hospitals, journeys, notifications (templates/campaigns), rules (page/editor/simulation). **No `app/api/` directory.**
- Required monitoring signals — ALL MISSING: identity merge requests, Outbox queue depth, retry failures, DLQ, Timeline ingestion lag, Rules failures, cycle prevention, Care Journey activation failures, referral delivery failures.
- Rules dashboard (`app/dashboard/rules/page.jsx:17-30`) calls HMS `/api/rules` but shows no failure metrics.
- **Non-clinical admin authority: PASS** — admin actions (`actions.ts:1392-1438`) only mutate `hospitalsMaster` status; no clinical record mutation found.

## 4. Authorization
- `packages/auth/authorization.ts` + `security.ts` are Express middleware, **not imported by any Next.js app** (grep: 0 imports). CONTRADICTED (Part 5 expectation).
- Each app uses its own guard: patient-portal `lib/auth/requireRole.ts` (cookie RBAC); HMS `lib/auth/roleGuard.ts` (JWT); admin-panel raw cookie checks.
- Client-side flag gating: `admin-panel/app/dashboard/rules/page.jsx:18,32` passes `localStorage.getItem('token')` as Bearer; `patient-portal/app/components/PatientHeader.js:15` reads `localStorage` for city — frontend-influenced access (H.8 violation pattern).
- `api-gateway/` at repo root = only `node_modules`; no source/middleware. **API Gateway ABSENT.**

## 5. Must Refactor
- `apps/patient-portal/app/actions.ts` (2129-2275, 900-940) + `app/api/patient/records/route.ts` — consume Timeline/Journey/Search engines; add dependent/caregiver/discharge-medicine/sharing features.
- `apps/hospital-hms/app/api/referrals/route.ts` (create), `/receive`, `/accept`, `/depart`, `/arrive`; `app/api/identity/reconcile/route.ts`; guest registration without mobile.
- `apps/hospital-hms/lib/services/visits.ts:5-39` — migrate Supabase direct calls to unified Prisma/Timeline.
- `apps/admin-panel/app/api/**` — add the 9 monitoring endpoints (Outbox depth, DLQ, Rules failures, Timeline lag, Journey activation failures, referral delivery failures, cycle prevention, identity merge queue).
- `packages/auth/authorization.ts` — wire into Next.js middleware; consolidate per-app guards; remove `localStorage` auth gating.

## 6. Files Needing Change
- `apps/patient-portal/app/actions.ts`, `app/api/patient/records/route.ts`, `components/...`
- `apps/hospital-hms/app/api/referrals/**` (new), `lib/services/visits.ts`, `lib/services.ts:1733`
- `apps/admin-panel/app/api/**` (new), `app/dashboard/**`
- `packages/auth/authorization.ts`, `security.ts`; per-app `lib/auth/*`
