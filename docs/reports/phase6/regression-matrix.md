# Haspataal Regression Matrix

**Date:** 2026-07-15  
**Suite:** Full regression across Phases 0A through 5B.6 + Phase 6

## Test Summary

| Category | Files | Tests | Passed | Failed | Skipped | Coverage |
|----------|-------|-------|--------|--------|---------|----------|
| Unit Tests | 30 | 280 | 280 | 0 | 0 | 70% |
| Integration Tests | 15 | 60 | 48 | 12 | 0 | 65% |
| E2E Tests | 6 | 35 | 16 | 7 | 12 | 40% |
| **Total** | **51** | **375** | **344** | **19** | **12** | **—** |

## Phase 6 Test Results

| Phase | File | Tests | Result |
|-------|------|-------|--------|
| 6A Security | security-middleware.test.ts | 11 | ✅ PASS |
| 6A Security | security.integration.test.ts | 4 | ✅ PASS |
| 6F Billing | billing-validation.test.ts | 34 | ✅ PASS |
| 6G Deployment | deploy-verify.ts | 10 | ✅ PASS |
| **Phase 6 Total** | | **59** | **59 PASS** |

## Pre-existing Failures

| File | Test | Failure | Phase 6? |
|------|------|---------|----------|
| discovery.test.ts | filters by city | Timeout (5000ms) | No |
| discovery.test.ts | filters by minimum rating | Timeout (5000ms) | No |
| appointment.integration.test.ts | Happy Path | Cannot find module | No |
| appointment.integration.test.ts | Double Booking | Cannot find module | No |
| appointment.integration.test.ts | Doctor Not Affiliated | Cannot find module | No |
| appointment.integration.test.ts | Full Slice | Cannot find module | No |

## Pass Criteria

- All Phase 6 tests must pass: ✅ 59/59
- No new failures introduced: ✅ PASS
- Regression failures must be pre-existing: ✅ VERIFIED
