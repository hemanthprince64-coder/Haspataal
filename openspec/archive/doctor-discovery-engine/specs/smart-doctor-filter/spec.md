## ADDED Requirements

### Requirement: Search by name
The system SHALL allow searching doctors by partial name match.

#### Scenario: Name search finds matching doctors
- **WHEN** patient searches "John"
- **THEN** system SHALL return doctors with "John" in their name
- **AND** results SHALL be ordered by relevance

### Requirement: Search by disease/symptoms
The system SHALL allow search by condition or symptoms.

#### Scenario: Condition search maps to specialty
- **WHEN** patient searches "diabetes"
- **THEN** system SHALL return doctors in Endocrinology or General Medicine
- **AND** system SHALL use ICD-10 mapping for condition to specialty

### Requirement: Filter by consultation mode
The system SHALL filter doctors by teleconsultation or in-person availability.

#### Scenario: Teleconsultation filter
- **WHEN** patient filters by teleconsultation
- **THEN** system SHALL return only doctors with teleconsultation enabled
- **AND** system SHALL show video call fee if different

### Requirement: Filter by distance
The system SHALL filter doctors by distance from patient location.

#### Scenario: Nearby doctors filter
- **WHEN** patient enables "Nearby" filter
- **THEN** system SHALL sort by distance to hospital
- **AND** system SHALL show distance in kilometers

### Requirement: Filter by ratings
The system SHALL allow filtering by minimum rating (1-5 stars).

#### Scenario: High-rated doctors filter
- **WHEN** patient filters rating >= 4
- **THEN** system SHALL return only doctors with average rating 4+
- **AND** system SHALL include review count