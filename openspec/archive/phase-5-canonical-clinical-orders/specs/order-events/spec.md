## ADDED Requirements

### Requirement: Canonical Event Production
Every state transition of an Order MUST emit a canonical event to the Outbox (e.g., ORDER_REQUESTED, ORDER_ACCEPTED, ORDER_COMPLETED, ORDER_CANCELLED).

#### Scenario: Emitting Order Requested Event
- **WHEN** an Order is successfully created and persisted
- **THEN** an `ORDER_REQUESTED` event is transactionally written to the Outbox.

### Requirement: Replay Guarantee for Queues
Downstream consumers (Lab, Radiology, Pharmacy, Timeline, Analytics) SHALL consume Order events and MUST be replay-safe. Deleting a department's execution queue MUST perfectly reconstruct it from the Order events.

#### Scenario: Queue Reconstruction
- **WHEN** the Pharmacy Queue projection is deleted and the Outbox relay replays all events
- **THEN** the Pharmacy Queue is fully reconstructed with all dispensing histories.

### Requirement: Billing Independence
The Billing engine SHALL NOT own or modify clinical Orders. It MUST exclusively consume `ORDER_COMPLETED` events to generate charges.

#### Scenario: Billing on Completion
- **WHEN** a Lab test is marked COMPLETED
- **THEN** the billing consumer reads the `ORDER_COMPLETED` event and generates the corresponding charge.
