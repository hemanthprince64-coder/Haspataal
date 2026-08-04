Version: 2.0
Owner: Haspataal Engineering
Last Updated: 2026-08-04

# Test Strategy

## Unit Tests
- **Framework:** Vitest (`npm run test`)
- **Scope:** Pure functions, domain use-cases, utilities.
- **Rule:** Mock Supabase using chainable mockup objects.

## Integration Tests
- **Framework:** Vitest + Testcontainers Postgres (`npm run test:integration`)
- **Scope:** Database repositories, complex API routes, Event Bus publishing.
- **Rule:** Verify RLS `SET LOCAL` is working correctly by asserting isolation between two generated hospital IDs.

## E2E Tests
- **Framework:** Playwright (`npm run test:e2e`)
- **Scope:** Critical user journeys (Patient Login, Booking, Hospital Onboarding, Doctor Prescription).

## Simulation & Race Conditions
- Run concurrent queries against `$queryRaw` lock queries (`FOR UPDATE SKIP LOCKED`) to ensure no deadlocks or duplicate processing occurs in workers.
