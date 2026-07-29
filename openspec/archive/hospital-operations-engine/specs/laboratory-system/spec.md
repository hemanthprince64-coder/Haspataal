## ADDED Requirements

### Requirement: Lab Order Creation
The system SHALL create lab orders linked to patient appointments and visits.

#### Scenario: Lab order after consultation
- **WHEN** doctor orders lab test during consultation
- **THEN** system SHALL create LabOrder with status ORDERED
- **AND** system SHALL publish LabOrdered event

### Requirement: Sample Collection
The system SHALL track sample collection with barcode generation.

#### Scenario: Barcode for sample
- **WHEN** sample is collected
- **THEN** system SHALL generate unique barcode
- **AND** system SHALL update LabOrderItem status to COLLECTED

### Requirement: Lab Processing
The system SHALL process samples and record results.

#### Scenario: Result entry
- **WHEN** lab result is entered
- **THEN** system SHALL update status to PROCESSED
- **AND** reference range check SHALL trigger alerts for critical values

### Requirement: Report Generation
The system SHALL generate PDF lab reports with digital signature.

#### Scenario: Pathologist verification
- **WHEN** pathologist verifies report
- **THEN** system SHALL allow signing and publishing
- **AND** patient SHALL receive notification

### Requirement: Timeline Integration
The system SHALL add lab events to patient clinical timeline.

#### Scenario: Timeline entry
- **WHEN** lab report is published
- **THEN** TimelineEvent SHALL be created
- **AND** LabCompleted event SHALL be published