# Integration Architecture & Circular Event Protection

This document outlines the delivery guarantees, patterns, and strict protections against infinite loops in the six-engine architecture.

## Delivery Guarantees

We do not claim exactly-once distributed processing. We design for:
- **At-least-once delivery**
- **Idempotent consumption**
- **Transactional Outbox & Consumer Inbox**
- **Deterministic idempotency keys**

### The Transactional Outbox Pattern
Every engine emitting events MUST write the event to an `Outbox` table within the same database transaction as the domain state change. A background relay worker reads from the outbox and publishes to the Event Bus (Redis Streams).

### The Consumer Inbox Pattern
Every engine consuming events MUST record the `eventId` in an `Inbox` table before or during processing. If the `eventId` exists, the event is skipped (idempotency).

## Circular Event & Recursion Protection

Dangerous loops (e.g., TimelineEvent -> Rule Triggered -> Rule Action creates TimelineEvent) MUST be mitigated through layered protections.

### 1. Event Identity
Every event has a globally unique `eventId` ensuring idempotency at the inbox layer.

### 2. Correlation Chain
All events in one business workflow share a single `correlationId`.

### 3. Causation Chain
Every derived event references a `causationId` pointing to the event/command that triggered it.

### 4. Origin Metadata
Record the originating engine and capability to prevent self-triggering loops.

### 5. Rule Re-entry Policy
Each rule MUST explicitly declare:
- `allowReentry`: boolean
- `maxExecutionsPerCorrelation`: number (e.g. 1)
- `cooldown`: time in seconds
- `terminalEventTypes`: list of events that immediately halt rule re-evaluations

### 6. Maximum Causation Depth
The Integration Runtime MUST reject or quarantine workflows exceeding a configured causation depth (e.g., depth > 10).

### 7. Event Suppression
Consumers can ignore self-generated event categories where appropriate (e.g., Timeline ignoring its own aggregate updates).

### 8. Dead-Letter Quarantine
Unresolved recursive flows go to a Dead-Letter Quarantine (DLQ) for manual investigation.
