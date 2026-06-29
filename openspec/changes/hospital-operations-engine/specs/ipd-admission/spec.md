## ADDED Requirements

### Requirement: Bed Allocation
The system SHALL allocate beds based on patient type and availability.

#### Scenario: Bed assignment
- **WHEN** patient is admitted
- **THEN** system SHALL assign available bed
- **AND** system SHALL update bed status to OCCUPIED

### Requirement: Admission Workflow
The system SHALL track complete admission from request to confirmation.

#### Scenario: Admission completion
- **WHEN** admission is confirmed
- **THEN** system SHALL create Admission record
- **AND** system SHALL publish PatientAdmitted event

### Requirement: Ward Transfer
The system SHALL handle ward and bed transfers.

#### Scenario: Transfer logging
- **WHEN** patient moves wards
- **THEN** system SHALL log WardTransferred event
- **AND** bed statuses SHALL be updated

### Requirement: Discharge Planning
The system SHALL track expected discharge dates.

#### Scenario: Discharge preparation
- **WHEN** expected discharge approaches
- **THEN** system SHALL trigger discharge workflow
- **AND** final bill SHALL be generated