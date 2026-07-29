# Dependency Audit

This document maps all six engines as a directed graph and classifies dependencies.

## Allowed Dependencies
- **Contract dependency**: Dependent on `packages/platform-contracts`.
- **Query dependency**: Asynchronous requests for explicitly exposed Read Models.
- **Command dependency**: Intent dispatch (e.g. `SendNotification`).
- **Event dependency**: Listening to Event Bus for `occurredAt` triggers.
- **Configuration dependency**: Reading from Configuration Engine cache/local resolver.

## High Risk Dependencies
- **Synchronous runtime dependency**: Direct API calls that could block if target is down.
- **Transitive dependency chain**: A -> B -> C (latency multiplier).

## Forbidden Dependencies (Action Required)
- **Direct cross-engine table access**: E.g. Rules Engine directly querying `patients` table.
- **Circular package imports**: A imports B, B imports A.
- **Shared mutable domain models**: Modifying a Prisma object passed between engines.

## Runtime Dependency Graph (Ideal Target State)

```mermaid
graph TD
    %% Engines
    Config[Configuration Control Plane]
    Timeline[Clinical Timeline Engine]
    Rules[Clinical Rules Engine]
    Notify[Unified Notification Engine]
    Journey[Care Journey Engine]
    Search[Search & Discovery Engine]
    
    %% Communication Infrastructure
    EventBus([Event Bus / Redis Streams])
    ConfigCache([Local Config Cache])

    %% Config Distribution (Allowed)
    Config -->|Publishes Config| ConfigCache
    ConfigCache -.->|Consumed by| Timeline
    ConfigCache -.->|Consumed by| Rules
    ConfigCache -.->|Consumed by| Notify
    ConfigCache -.->|Consumed by| Journey
    ConfigCache -.->|Consumed by| Search

    %% Event Producers (Allowed)
    Journey -->|Emits Events| EventBus
    Rules -->|Emits Action Events| EventBus
    Timeline -->|Emits Timeline Events| EventBus
    Notify -->|Emits Delivery Status| EventBus

    %% Event Consumers (Allowed)
    EventBus -->|Consumed by| Search
    EventBus -->|Consumed by| Notify
    EventBus -->|Consumed by| Journey
    EventBus -->|Consumed by| Rules
    EventBus -->|Consumed by| Timeline

    %% Queries / Commands
    Journey -- Query ReadModel --> Timeline
    Rules -- Command (SendNotification) --> Notify
```

## Existing Codebase Dependency Assessment

Based on the inventory:
- **Cross-Engine Table Access**: Currently, engines might be using `@haspataal/db` singleton directly. This is **Forbidden**. Engines should only access their own schema bounds or use dedicated Read Projections.
- **Configuration Resolution**: Currently relying on `HospitalsMaster` and DB lookups. Needs to transition to the `ConfigCache` model.
- **Circular Dependencies**: If Rules trigger a Journey which triggers a Rule, this could lead to infinite loops. Need strict causation tracking.

*Note: Every circular dependency must be resolved via the EventBus using idempotent consumers before portal integration.*
