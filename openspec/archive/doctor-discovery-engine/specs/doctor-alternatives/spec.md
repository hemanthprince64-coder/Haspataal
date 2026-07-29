## ADDED Requirements

### Requirement: Alternative doctor suggestions
The system SHALL suggest alternative doctors when primary selection is unavailable.

#### Scenario: Fully booked doctor suggests alternatives
- **WHEN** selected doctor is fully booked
- **THEN** system SHALL suggest same department doctors at same hospital
- **AND** system SHALL show 3 nearest alternatives

### Requirement: Same department priority
The system SHALL prioritize same department alternatives.

#### Scenario: Department routing precedence
- **WHEN** doctor on leave
- **THEN** system SHALL first suggest same department at same hospital
- **AND** system SHALL then suggest nearby affiliated hospitals

### Requirement: Emergency override
The system SHALL allow emergency appointments bypassing normal availability.

#### Scenario: Emergency booking allowed
- **WHEN** emergency flag is set
- **THEN** system SHALL allow booking regardless of availability
- **AND** system SHALL log audit entry for emergency override

### Requirement: Smart escalation alternatives
The system SHALL provide intelligent alternatives based on multiple criteria.

#### Scenario: Multi-criteria alternative selection
- **WHEN** suggesting alternatives
- **THEN** system SHALL consider: specialty match, distance, ratings, fees
- **AND** system SHALL rank by composite score