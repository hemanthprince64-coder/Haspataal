## ADDED Requirements

### Requirement: Sample Lifecycle Management
The system SHALL manage physical laboratory samples through a defined lifecycle (ORDERED -> COLLECTED -> ACCESSIONED -> REJECTED or PROCESSED).

#### Scenario: Sample Collection
- **WHEN** a lab technician collects a sample for a ClinicalOrder
- **THEN** a `Sample` record is created with status COLLECTED and linked to the `ClinicalOrder`
- **THEN** a Timeline event `SAMPLE_COLLECTED` is published to the Encounter

#### Scenario: Sample Accession
- **WHEN** a collected sample is received and verified by the lab
- **THEN** the sample status transitions to ACCESSIONED
- **THEN** the overarching `ClinicalOrder` status transitions to IN_PROGRESS

### Requirement: Result Entry and Verification
The system SHALL provide an interface for entering and verifying diagnostic results.

#### Scenario: Result Entry
- **WHEN** a technician enters values for an accessioned sample
- **THEN** the values are saved to the `LabResult` record in DRAFT status

#### Scenario: Result Verification
- **WHEN** a pathologist approves and verifies a DRAFT result
- **THEN** the `LabResult` transitions to VERIFIED
- **THEN** the overarching `ClinicalOrder` transitions to VERIFIED
- **THEN** a Timeline event `RESULT_VERIFIED` is published to the Encounter
