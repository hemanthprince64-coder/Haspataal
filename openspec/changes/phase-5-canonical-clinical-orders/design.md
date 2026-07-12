## Context

Currently, Haspataal relies on scattered events for patient identity and basic tracking. As we expand to core hospital functions, we need a centralized Clinical Order Engine. This engine will define the canonical "Order" aggregate. It explicitly separates the "Order" (clinical intent) from the "Execution" (operational fulfillment) and the "Result" (downstream findings), while introducing a Catalog to define standard orderable items.

## Goals / Non-Goals

**Goals:**
- Design a single canonical Order model scaling for LAB, RADIOLOGY, PHARMACY, PROCEDURE, etc.
- Introduce `ClinicalOrderCatalog` vs `ClinicalOrderInstance` distinction.
- Implement explicit Order Versioning (Version 1 -> 2) instead of flat amendments.
- Explicit clinical context assignment (OPD, IPD, ER).
- Implement a distinct non-blocking CDS validation pipeline (Duplicate, Allergy, Drug Interaction).
- Enable multi-department Order Groups and Order Dependencies.
- Explicit replay guarantees: deleting department queues must perfectly reconstruct from Order events.

**Non-Goals (Deferred to later phases):**
- Laboratory analyzers (LIS), PACS, DICOM, HL7/FHIR gateways.
- Pharmacy inventory, drug administration, blood compatibility.
- Billing engines (Billing only consumes ORDER_COMPLETED, it never owns Orders).
- Specimen lifecycle details (Order anticipates it, but full specimen lifecycle is deferred).

## Decisions

**1. Catalog vs Instance**
- *Decision*: `ClinicalOrderCatalog` and `ClinicalOrderCatalogVersion` define the metadata (e.g., "CBC", "Paracetamol"). `Order` instances reference the catalog version.
- *Rationale*: Prevents duplicating metadata into every order and centralizes clinical governance of available tests/drugs.

**2. Order vs Execution vs Result**
- *Decision*: `Order` is clinical intent. `OrderExecution` is operational (technician assigned, collected, running). `Result` is the clinical finding.
- *Rationale*: Allows medication orders (Ordered -> Verified -> Dispensed -> Administered) to have different execution workflows than lab orders (Requested -> Collected -> Running -> Verified) while maintaining a single canonical Order aggregate.

**3. Multi-department Orders**
- *Decision*: Departments belong to `OrderItem`s, not the root `Order`.
- *Rationale*: A "Sepsis Bundle" Order can contain a CBC (Lab), Blood Culture (Lab), Chest X-Ray (Radiology), and IV Antibiotic (Pharmacy) under the same clinical intent.

**4. Order Versioning**
- *Decision*: Modifications (adding/removing items) create a new Version (V1 -> V2) of the Order instead of modifying it or creating disconnected amendments.
- *Rationale*: Ensures an immutable, perfectly auditable timeline of clinical intent.

**5. CDS Validation Pipeline**
- *Decision*: Extracted from the state machine into an independent pipeline (Duplicate Detection -> Drug Interaction -> Allergy -> Renal Dose -> Approval). Duplicates trigger warnings that clinicians can override with a recorded reason.
- *Rationale*: Separation of concerns. CDS should not block state progression rigidly; clinical judgment can override it.

**6. External Integration Boundary**
- *Decision*: Reserve `externalSystem`, `externalReferenceId`, and `synchronizationStatus` on the Order and Execution models.
- *Rationale*: Future proofs for LIS, RIS, and Pharmacy robot integrations.

## Risks / Trade-offs

- **Risk**: Complex versioning could complicate query performance for "latest" status.
  → *Mitigation*: The `Order` root always points to the `activeVersionId`, while older versions remain in `OrderVersion` history tables for audit and replay.
- **Risk**: Eventual consistency between Order and Execution queues.
  → *Mitigation*: Execution tables are projections built via Outbox events. Strong replay guarantees and idempotency ensure crash recovery.

## Schema Additions Plan (Phase 5A)
- `ClinicalOrderCatalog`
- `ClinicalOrderCatalogVersion`
- `Order`
- `OrderVersion`
- `OrderItem`
- `OrderDependency`
- `OrderExecution`
- `OrderCancellation`
- `OrderPriority` (Enum)

## PostgreSQL Test Matrix Expansion
In addition to basic creation and authorization, tests MUST cover:
- Concurrent cancellation and completion.
- Version creation and amendment replay.
- Duplicate override and reason recording.
- Grouped order completion and dependency ordering.
- External sync retry and replay after consumer crash.
- Replay after version upgrade and full queue reconstruction after deletion.
