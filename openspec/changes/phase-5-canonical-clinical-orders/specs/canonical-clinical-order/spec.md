## ADDED Requirements

### Requirement: Unified Canonical Order Aggregate
The system SHALL support a single unified Canonical Order aggregate that governs all types of clinical orders. No department SHALL create its own competing order model. 

#### Scenario: Order Creation
- **WHEN** a clinician requests a lab test, radiology scan, or medication
- **THEN** the system creates a canonical `Order` record referencing the `ClinicalOrderCatalog`

### Requirement: Explicit Clinical Context
Every Order MUST explicitly belong to exactly one clinical context (e.g., OPD, IPD, ER, ICU). Context MUST NOT be inferred later.

#### Scenario: Enforcing Context
- **WHEN** a clinician creates an order
- **THEN** they must specify the context, and the system records the Order with Context = 'IPD'

### Requirement: Multi-department Order Groups
An Order Group MUST support multiple departments. Departments belong to `OrderItem`s, not the root Order.

#### Scenario: Sepsis Bundle
- **WHEN** a Sepsis Bundle is ordered
- **THEN** it generates a CBC item (Lab), Blood Culture item (Lab), X-Ray item (Radiology), and IV Antibiotic item (Pharmacy) within the same group.

### Requirement: Order Versioning (Immutable Auditing)
Orders SHALL be versioned. Additions or removals MUST create a new Version (V1 -> V2) instead of rewriting the Order or creating flat amendments.

#### Scenario: Versioning an Order
- **WHEN** a clinician modifies an existing Order to add CRP
- **THEN** the system issues Version 2 of the Order, keeping Version 1 as an immutable historical record.

### Requirement: Standing Orders and Dependencies
The system SHALL support Standing Orders (repeat until condition) and Order Dependencies (A must happen before B).

#### Scenario: Standing Order
- **WHEN** a clinician orders IV Antibiotics every 8 hours for 7 days
- **THEN** the system records the frequency and duration constraints on the Order item.
