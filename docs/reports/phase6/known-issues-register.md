# Haspataal Known Issues Register

**Date:** 2026-07-15  
**Status:** Active

## Critical Issues (P0)

| ID | Issue | Impact | Workaround | Owner | Status |
|----|-------|--------|-----------|-------|--------|
| — | None | — | — | — | — |

## High Issues (P1)

| ID | Issue | Impact | Workaround | Owner | Status |
|----|-------|--------|-----------|-------|--------|
| H-01 | Missing Dockerfiles for patient-portal, hospital-hms, admin-panel | Deployment will fail for app services | Use root Dockerfile with build args | DevOps | Open |
| H-02 | Feature flags not implemented | Cannot do gradual rollouts | Use environment variables | Engineering | Open |
| H-03 | Limited Prisma migration history | Schema drift risk on fresh deploy | Document current schema state | Engineering | Open |

## Medium Issues (P2)

| ID | Issue | Impact | Workaround | Owner | Status |
|----|-------|--------|-----------|-------|--------|
| M-01 | `discovery.test.ts` timeouts | CI noise, delayed feedback | Increase test timeout to 10000ms | QA | Open |
| M-02 | `appointment.integration.test.ts` import error | Integration tests fail | Fix path alias or create metrics module | Engineering | Open |
| M-03 | Auto-billing not event-driven | Billing logic coupled to clinical routes | Document for Phase 7 | Engineering | Open |
| M-04 | Appointment/Blood Bank billing gaps | Revenue leakage risk | Manual billing via new APIs | Engineering | Open |
| M-05 | Razorpay webhook stub | Payment reconciliation incomplete | Use manual payment recording | Engineering | Open |

## Low Issues (P3)

| ID | Issue | Impact | Workaround | Owner | Status |
|----|-------|--------|-----------|-------|--------|
| L-01 | N+1 queries in pharmacy/dispense | Performance degradation under load | Documented in performance report | Engineering | Open |
| L-02 | IPD invoice number collision risk | Duplicate invoice numbers | Use database sequence | Engineering | Open |
| L-03 | No OpenTelemetry instrumentation | Limited distributed tracing | Prometheus + Grafana sufficient for MVP | Engineering | Open |

## Pre-existing Issues (Not Phase 6)

| ID | Issue | First Seen | Status |
|----|-------|-----------|--------|
| P-01 | `discovery.test.ts` timeout | Phase 0 | Known |
| P-02 | `appointment.integration.test.ts` import error | Phase 2 | Known |
