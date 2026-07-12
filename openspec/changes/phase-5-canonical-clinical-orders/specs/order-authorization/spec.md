## ADDED Requirements

### Requirement: Authorization Engine Integration
Every Order mutation (creation, status update, amendment, cancellation) SHALL pass through the Phase 2 Authorization Engine. Frontend authorization alone is insufficient.

#### Scenario: Order Creation
- **WHEN** a clinician attempts to create an order
- **THEN** the system MUST verify an ACTIVE treating relationship and adequate clinical privileges before allowing the creation.

### Requirement: Cancellation Authorization
Order cancellation SHALL require the ordering clinician or an authorized department delegate to document the reason and possess the specific capability.

#### Scenario: Unauthorized Cancellation Attempt
- **WHEN** a user without the 'cancel_order' capability attempts to cancel an order
- **THEN** the system rejects the operation with a 403 Forbidden error.
