# Test Architecture Plan

This document defines the required test suites to validate the six-engine architecture before and during portal integration.

## 1. Contract Tests
- **Objective**: Ensure Producers and Consumers agree on schema.
- **Implementation**: Publish dummy events to a mock bus; assert consumers successfully parse and process them using Zod schemas in `packages/platform-contracts`.

## 2. Tenant Isolation Tests
- **Objective**: Prove Hospital A cannot retrieve Hospital B's data.
- **Implementation**: Attempt to read/write resources across boundaries using a TenantContext for Hospital A while requesting Hospital B resources. Must return 404 or 403.

## 3. Authorization Tests
- **Objective**: Validate `PERMISSION_MATRIX.md`.
- **Implementation**: Automate every portal-role-resource combination ensuring only explicitly granted roles succeed.

## 4. Event Loop Tests
- **Objective**: Ensure recursive chains terminate safely.
- **Implementation**: Trigger a synthetic loop (e.g. Rule triggers Rule). Assert that after `maxExecutionsPerCorrelation`, the system terminates the loop.

## 5. Idempotency Tests
- **Objective**: Duplicate events do not duplicate effects.
- **Implementation**: Publish the exact same `eventId` twice to a consumer queue. Assert the database state only changes once.

## 6. Replay Tests
- **Objective**: Historical events can be safely replayed.
- **Implementation**: Process an event, modify state out-of-band, replay the event, and assert the expected final state is reached without crashing.

## 7. Failure Tests
- **Objective**: Dependencies can fail without corrupting state.
- **Implementation**: Mock Redis throwing connection errors; assert Outbox queues the event instead of crashing the primary request.

## 8. Configuration Tests
- **Objective**: Validate config resolution, caching, and fallback.
- **Implementation**: Mock the DB being down and ensure the engine resolves the last known good configuration from cache.

## 9. End-to-End Workflow Tests
- **Workflow 1**: Patient books appointment → Timeline updated → Rules evaluated → Notification queued → Search updated.
- **Workflow 2**: Doctor completes consultation → Timeline event → Journey milestone update → Rules evaluation → Follow-up task → Notification → Search refresh.
- **Workflow 3**: Pregnancy risk condition detected → Rule triggered → Journey risk updated → Clinical alert → Notification → Timeline event → Search projection updated.
- **Workflow 4**: Hospital configuration changes quiet hours → New configuration version → Cache invalidation → Notification behavior changes → No redeployment required.
