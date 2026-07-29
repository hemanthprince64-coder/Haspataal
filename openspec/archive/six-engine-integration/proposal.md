# Six-Engine Architecture Audit & Pre-Integration Proposal

## Overview
This proposal governs the pre-integration phase for the Haspataal six-engine platform architecture. Before any integration with the Patient Portal, HMS, or Admin Portal can begin, all engines must pass strict architectural gates to ensure loose coupling, high cohesion, and scalable event-driven communication.

## Problem Statement
Immediate integration of portal frontends directly into disparate domain modules leads to spaghetti architecture, circular dependencies, duplicated sources of truth, and a distributed monolith.

## Proposed Solution
Execute a rigorous 13-phase engineering loop to map boundaries, declare single sources of truth, isolate databases (RLS), enforce server-side tenant context, and transition all inter-engine communication to standard `PlatformEvent`, `PlatformCommand`, and `PlatformQuery` contracts via an Event Bus / Transactional Outbox pattern.

## Scope
Includes all six foundational engines:
1. Configuration & Feature Management Engine (To be formalized as a Control Plane)
2. Clinical Timeline Engine
3. Clinical Rules Engine
4. Unified Notification Engine
5. Care Journey Engine
6. Unified Search & Discovery Engine

## Success Criteria
- 10 Architecture Gates passed (Ownership, Dependencies, Contracts, Events, Security, Configuration, Failure Safety, Observability, Testing, Documentation).
- No synchronous cross-domain writes.
- 0 Circular dependencies.
