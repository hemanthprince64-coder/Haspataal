# Migration Plan (9 Waves)

Do not perform a big-bang integration. Use incremental migration as specified.

## Wave 1: Shared Contracts Only
**Scope**: Deploy `packages/platform-contracts` with TypeScript and Zod schemas.
**Impact**: No runtime changes. Dependent packages update their dev dependencies.

## Wave 2: Context Normalization
**Scope**: Implement and enforce `TenantContext` and `ActorContext` server-side generation at the API Gateway / Middleware layer.
**Impact**: Backend routes now receive standard context objects instead of extracting IDs manually.

## Wave 3: Standard Event Envelope
**Scope**: All existing event publishers migrate to emitting `PlatformEvent<TPayload>`.
**Impact**: Consumers must handle both legacy payloads and new envelopes during transition, eventually deprecating legacy.

## Wave 4: Outbox and Inbox Patterns
**Scope**: Implement Transactional Outbox for DB writes and Consumer Inbox for idempotency.
**Impact**: Replaces fire-and-forget Redis Streams writes with guaranteed at-least-once delivery.

## Wave 5: Configuration Consumption
**Scope**: Extract Configuration Engine (currently designed-only) into a Control Plane with a local cache resolver.
**Impact**: Replaces direct DB queries on `OpdConfig` / `HospitalBillingProfile` with fast, cached lookups.

## Wave 6: Engine Adapters
**Scope**: Each engine adopts the new `PlatformCommand` and `PlatformQuery` interfaces.
**Impact**: Replaces any direct API/DB cross-talk with formal contracts.

## Wave 7: Portal BFF Integration
**Scope**: Portals (Patient, HMS, Admin) route requests exclusively through their respective BFF layers.
**Impact**: Frontend ceases to talk directly to domain engines.

## Wave 8: End-to-End Workflows
**Scope**: Full integration of multi-engine clinical flows (e.g. Appointment -> Timeline -> Rule -> Journey -> Search).
**Impact**: Enables complex automations.

## Wave 9: Remove Legacy Direct Integrations
**Scope**: Delete all old code bypassing the new architecture.
**Impact**: Finalizes the migration. Platform is now 100% compliant.
