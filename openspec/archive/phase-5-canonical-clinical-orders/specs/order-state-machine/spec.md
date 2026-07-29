## ADDED Requirements

### Requirement: Canonical Lifecycle Transitions
The system SHALL strictly enforce the state transitions of an Order. Direct status jumps that bypass necessary states MUST be rejected.

#### Scenario: Normal Order Lifecycle
- **WHEN** an order is verified
- **THEN** it transitions according to the strict state graph.

### Requirement: Order Cancellation
Cancelled orders SHALL remain as immutable historical records. Deletion of Orders is strictly prohibited. Cancellations MUST require an actor, reason, timestamp, and authorization.

#### Scenario: Order Cancellation
- **WHEN** an authorized clinician cancels an unfulfilled order
- **THEN** the order transitions to CANCELLED, and an `OrderCancellation` record is created with the reason and actor details.

### Requirement: Priority Management
Orders SHALL support priorities: ROUTINE, URGENT, and STAT. Any change to an Order's priority MUST emit a canonical event.

#### Scenario: Elevating Priority
- **WHEN** a clinician changes an IN_PROGRESS order's priority from ROUTINE to STAT
- **THEN** the order priority is updated and an ORDER_PRIORITY_CHANGED event is dispatched.
