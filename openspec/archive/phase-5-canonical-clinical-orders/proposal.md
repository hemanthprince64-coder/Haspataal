## Why

Haspataal currently tracks clinical events and authorizations (Phases 0-4), but lacks a unified, canonical system for requesting clinical work (e.g., lab tests, radiology, pharmacy). Without a centralized order aggregate, each department might invent competing order models, leading to fragmentation, lost clinical intent, and inconsistent patient identity tracking. This change establishes the single authoritative Clinical Order Engine that governs every clinical order placed within the platform, ensuring robust authorization, traceability, and replay safety.

## What Changes

- Introduce `ClinicalOrderCatalog` and `ClinicalOrderCatalogVersion` to define reusable master order definitions (e.g., "CBC", "Paracetamol").
- Introduce a single canonical `Order` aggregate (instance) that references the catalog, serving as the root for all clinical requests.
- Establish strict separation: **Order** (clinical intent) → **Execution** (operational fulfillment) → **Result** (downstream findings).
- Enforce the Phase 2 Authorization Engine for every Order mutation (Creation, Approval, Cancellation, Completion).
- Implement explicit Order Versioning (Version 1 -> Version 2) instead of flat amendments to guarantee a flawless audit trail.
- Require every Order to belong to exactly one explicit Clinical Context (OPD, IPD, ER, ICU, etc.).
- Support Multi-department Order Groups (e.g., a "Sepsis Bundle" spawning Lab, Radiology, and Pharmacy tasks).
- Support Standing Orders (e.g., "Repeat CBC every morning until discharge") and Order Dependencies (A must happen before B).
- Implement a distinct non-blocking Clinical Decision Support (CDS) pipeline (Duplicate Warning, Drug Interactions, Allergies) with clinician override capabilities.
- Generate canonical Outbox events (e.g., ORDER_REQUESTED, ORDER_COMPLETED) for every state transition.
- Introduce replay-safe downstream consumers (Lab, Radiology, Pharmacy, Timeline, Analytics) that rebuild operational queues exclusively from events.
- Split execution into Phase 5A (Core Engine) and Phase 5B (Department Execution workflows).

**Out of Scope for Phase 5**:
- Laboratory analyzers, PACS, DICOM, HL7/FHIR gateways, pharmacy inventory, drug administration, blood compatibility, and billing engines.

## Capabilities

### New Capabilities
- `canonical-clinical-order`: The single authoritative aggregate (with versioning, catalog refs, context) that governs all clinical orders.
- `order-catalog`: The master dictionary defining standard orderable items and their dependencies.
- `order-execution-lifecycle`: Subtype-specific operational lifecycles (Meds vs Lab) detached from the clinical Order definition.
- `order-validation-pipeline`: Independent CDS hooks for duplicates, interactions, allergies, and pregnancy warnings.
- `order-authorization`: Enforcement via Phase 2 Authorization Engine for creation, approval, cancellation, and completion.
- `order-events`: Canonical event production to the Outbox (ORDER_REQUESTED, etc.) and replay-safe rebuilding of department queues.

### Modified Capabilities

## Impact

- **Database**: Additive schema migrations for Catalog, CatalogVersion, Order, OrderItem, OrderExecution, OrderGroup, and OrderDependency.
- **Event Bus**: New outbox events published to the stream for order creation, execution progression, and completion.
- **Core Domain**: New `@haspataal/core` domain services for Clinical Orders, Validation Pipeline, and Catalog Management.
- **Testing**: Massive expansion of PostgreSQL integration tests (concurrent cancellation, version creation, duplicate overrides, dependency ordering, external sync retry, consumer crash recovery).
