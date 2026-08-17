# @haspataal/referral

Patient referral and care coordination domain package for the Haspataal platform.

## Purpose

Manages the complete referral lifecycle: creation, scheduling, consultation, care transfer, communication, outcome tracking, and event consumption.

## Public API

| Export | Type | Description |
|--------|------|-------------|
| `ReferralExecutionService` | class | Creates and manages referral execution items |
| `ConsultationService` | class | Handles specialist consultation booking and records |
| `SchedulingService` | class | Schedules referral appointments |
| `CareTransferService` | class | Manages patient transfer between care teams |
| `CommunicationService` | class | Handles referral communications |
| `OutcomeService` | class | Tracks referral outcomes and follow-ups |
| `ReferralConsumer` | class | Event consumer for referral lifecycle events |
| `ReferralEventType` | enum | Event type constants |
| `ReferralEvent`, `CreateReferralInput`, `RecipientInput` | types | Domain types |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@haspataal/core` | Core domain services |
| `@haspataal/db` | Prisma client access |
| `@haspataal/types` | Shared TypeScript types |

## What Must Remain Internal

- Event consumer implementations
- Outbox integration details
- Transaction boundaries

## Migration Notes

Previously part of `@haspataal/core` under `core/domain/referral/`.

Legacy imports remain supported via `@haspataal/core` barrel exports. New code should import directly from `@haspataal/referral`.
