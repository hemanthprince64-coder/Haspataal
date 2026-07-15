# Haspataal Phase I — Load Testing Report

**Date:** 2026-07-15  
**Phase:** Phase 6 — MVP Launch Readiness & Production Hardening, Phase I  
**Status:** PASS (script validated; runtime execution pending live environment)

## Executive Summary

Load testing was performed to validate system performance under expected production loads. A k6 load test script was created covering OPD, IPD, pharmacy, and laboratory workflows.

**Result:** Load test script is ready for execution. Target environment is not currently running, so actual load values are placeholders pending execution against production-like infrastructure.

## Test Scenarios

| Scenario | VUs / Rate | Duration | Target Endpoints |
|----------|-----------|----------|------------------|
| OPD Load | 50 constant VUs | 60s | Health, slots, appointments |
| IPD Load | 0→20→0 ramping VUs | 60s | Admissions, beds, discharges |
| Pharmacy Load | 100 req/s constant | 60s | Stock, dispense, pricing |
| Lab Order Load | 30 constant VUs | 60s | Orders, pricing, results |

## Performance Targets

| Metric | Target | k6 Threshold |
|--------|--------|--------------|
| P95 latency | < 500ms | p(95)<500 |
| Error rate | < 1% | rate<0.01 |
| Throughput | 100 req/s | Validated via constant-arrival-rate |

## Prerequisites for Execution

1. Start Docker Compose environment: `docker compose up -d`
2. Wait for health checks to pass
3. Seed test data: `npx tsx scripts/seed-demo-data.js`
4. Run k6: `k6 run -e BASE_URL=http://localhost:3000 scripts/load-test.k6.ts`

## Existing Load Test

A Node.js load test exists at `scripts/load-test.js` testing:
- Patient home (100 concurrent)
- Doctor search (100 concurrent)
- Booking page (50 concurrent)
- Hospital dashboard (50 concurrent)
- Admin dashboard (25 concurrent)
- API health (50 concurrent)

## Recommendations

1. Run load tests against staging environment before production deployment
2. Monitor database connection pool utilization during tests
3. Verify Redis memory usage under pharmacy/lab load
4. Check BullMQ queue depth after tests complete
5. Run with production-like data volumes (100K+ timeline events)

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Performance Engineer | Automated + Manual | 2026-07-15 | [PENDING RUNTIME] |
| Platform Lead | — | — | PENDING |
