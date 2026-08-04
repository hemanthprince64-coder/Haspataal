---\nversion: 2.0\nowner: Haspataal Engineering\nlast_updated: 2026-08-04\nstatus: Active\n---\n
# ADR-0006: Pharmacy Implementation

## Status
Accepted

## Context
The Pharmacy module needs to track formulation inventory, reorder alerts, and safety audits for expired batches while syncing with doctor prescriptions.

## Decision
Implemented `PharmacyStateMachine` and associated Use Cases to manage drug stock. Stock reductions are tied to `PRESCRIPTION_DISPENSED` domain events, ensuring eventual consistency.

## Alternatives Considered
Synchronous stock checks during prescription writing were rejected to ensure sub-30s doctor UX. Doctors can prescribe regardless of internal stock; the pharmacy UI flags out-of-stock items for alternative sourcing.

## Consequences
- The Activation Gate must block hospital activation if expired batches exist in initial pharmacy stock setup.

## Migration Notes
None

## Related Packages
- @haspataal/core

## Related ADRs
None
