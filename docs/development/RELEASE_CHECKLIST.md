---
version: 3.0
owner: Haspataal Engineering
last_updated: 2026-08-11
status: Active
---

# HASPATAAL GO-LIVE GATE (Pre-Deployment Checklist)

This runbook must be executed before transitioning the project from a local/staging environment to a live production environment. Kilo Code findings and AI-generated realities dictate that all P0 and P1 checks are **absolute mandatory blockers**.

## 🔴 P0 — Absolute deployment blockers

These must have **0 failures**:

- `[ ]` Rotate exposed database/Supabase credentials.
- `[ ]` Verify `.env` files are not tracked.
- `[ ]` Remove `ignoreBuildErrors`.
- `[ ]` Remove `ignoreDuringBuilds`.
- `[ ]` Fix the TypeScript errors exposed after removing suppression.
- `[ ]` Fix production authentication bypasses.
- `[ ]` Remove `dashboard-test` bypass.
- `[ ]` Verify every API route has hospital/tenant isolation.
- `[ ]` Verify RLS on every financial/clinical table.
- `[ ]` Remove hardcoded credentials/placeholders.
- `[ ]` Remove or feature-flag every `// MOCK:` production path.
- `[ ]` 0 failing tests.
- `[ ]` 0 critical/high security findings.
- `[ ]` Production build succeeds **without suppression**.

## 🟠 P1 — Clinical/financial correctness

Strict verification of AI-generated logic and aggregates. "Tests pass" is insufficient; manual and invariant audits are required.

- `[ ]` Encounter → Consultation → ClinicalOrder workflow
- `[ ]` Appointment/booking concurrency
- `[ ]` Laboratory state machine
- `[ ]` Radiology state machine
- `[ ]` Pharmacy state machine
- `[ ]` Billing event propagation
- `[ ]` ChargeItem idempotency
- `[ ]` Invoice generation concurrency
- `[ ]` PaymentIntent reservation
- `[ ]` Payment capture
- `[ ]` Payment allocation
- `[ ]` Receipt generation
- `[ ]` Refund/reversal
- `[ ]` Invoice immutability
- `[ ]` Financial invariants
- `[ ]` Cross-hospital access attempts
- `[ ]` Duplicate webhook/event replay
- `[ ]` Concurrent cashier operations

## 🟢 P2 — Standard Deployment Readiness

- `[ ]` **Rollback Plan:** Ensure immutable git tags exist for the previous healthy release and rollback procedures are tested.
- `[ ]` **Health Checks:** `/api/health` returns HTTP 200.
- `[ ]` **Monitoring & Logging:** Error tracking (Sentry) active, logs capturing accurate traces without PHI leaks.
- `[ ]` **Performance:** Static assets CDN-delivered, caches configured, and bundle size checked.
