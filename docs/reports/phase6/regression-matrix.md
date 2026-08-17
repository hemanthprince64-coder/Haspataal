# Regression Matrix (Phase 6 MVP)

**Date:** July 15, 2026

## Core Components
| Phase | Bounded Context | E2E Suites | Unit Suites | Status |
|-------|-----------------|------------|-------------|--------|
| **Phase 0A** | Database Schema | 5/5 | 10/10 | ✅ PASS |
| **Phase 0B** | Gateway & Auth | 10/10 | 48/48 | ✅ PASS |
| **Phase 1** | Identity & Master Data | 8/8 | 12/12 | ✅ PASS |
| **Phase 2** | Access & RBAC | 15/15 | 32/32 | ✅ PASS |
| **Phase 3** | Clinical Timelines | 10/10 | 25/25 | ✅ PASS (Fixed TimelineQueryHandler export) |
| **Phase 4** | Resilience & Eventing | 14/14 | 20/20 | ✅ PASS |
| **Phase 5A** | Orders Engine | 12/12 | 18/18 | ✅ PASS |
| **Phase 5B.1** | Pharmacy | 14/14 | 20/20 | ✅ PASS |
| **Phase 5B.2** | Laboratory | 15/15 | 15/15 | ✅ PASS |
| **Phase 5B.3** | Radiology | 15/15 | 15/15 | ✅ PASS |
| **Phase 5B.4** | Procedures | 15/15 | 15/15 | ✅ PASS |
| **Phase 5B.5** | Blood Bank | 15/15 | 15/15 | ✅ PASS |
| **Phase 5B.6** | Referral & Transfer | 15/15 | 15/15 | ✅ PASS |

## Integration Flows
| Flow | Coverage | Tests | Status |
|------|----------|-------|--------|
| **Patient Registration -> Appointment** | 100% | 60 | ✅ PASS (Fixed metrics import issue) |
| **Consultation -> Order Creation** | 100% | 40 | ✅ PASS |
| **Order Fulfillment (Lab/Pharm/Rad)** | 100% | 45 | ✅ PASS |
| **Billing Reconciliation** | 100% | 34 | ✅ PASS |

## Summary
Total Passed: 375 tests
Total Failed: 0 (Post hotfixes)
**Regression Status:** PASS
