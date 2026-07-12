## ADDED Requirements

### Requirement: Subtype-Specific Execution Lifecycles
The system SHALL strictly separate the canonical Order intent from the operational Execution. Execution workflows MUST be subtype-specific (e.g., Medications follow Verified -> Dispensed -> Administered, while Lab follows Collected -> Running -> Verified).

#### Scenario: Execution Progression
- **WHEN** a Pharmacy technician dispenses a medication order
- **THEN** the Execution state progresses to `DISPENSED`, emitting an event, while the canonical Order clinical intent remains unchanged.
