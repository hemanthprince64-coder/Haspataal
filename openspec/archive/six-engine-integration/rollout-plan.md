# Rollout Plan

## Environment Progression
1. **Local Development (Wave 1-4)**: Engineers implement Shared Contracts and Event Envelopes.
2. **Staging Environment (Wave 5-7)**: Portal BFFs and Configuration Engine testing.
3. **Pre-Production (Wave 8)**: End-to-End Workflow verification with shadow traffic.
4. **Production (Wave 9)**: Gradual enablement of new routes; legacy route decommissioning.

## Rollback Strategy
Every engine deployment during Waves 1-7 MUST support processing both legacy direct APIs and the new Event-Driven contracts.
If an issue occurs in Production:
- Re-route BFF traffic back to the legacy controllers via Feature Flags (Configuration Engine).
- Revert the `packages/platform-contracts` version locally.
- In-flight outbox events will continue to process; do not delete the Consumer Inbox tables.

## Communication Plan
- Notify all clinical staff 48 hours before Wave 8 (End-to-End Workflows) deployment regarding potential brief delays in Timeline updates.
