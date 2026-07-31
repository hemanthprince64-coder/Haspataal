## ADDED Requirements

### Requirement: Radiology Order Placement
The system SHALL allow doctors to place Radiology Orders from an active Encounter.

#### Scenario: Doctor orders an MRI
- **WHEN** a doctor adds an MRI order during an encounter
- **THEN** a `ClinicalOrder` is created with type `RADIOLOGY` and state `ORDERED`
- **AND** a `RADIOLOGY_ORDER_CREATED` event is pushed to the Timeline

### Requirement: Imaging Study Accessioning
The system SHALL allow technicians to accession scheduled imaging studies.

#### Scenario: Technician accessions an X-Ray
- **WHEN** a technician accepts an X-Ray order
- **THEN** an `ImagingStudy` is created and the `ClinicalOrder` transitions to `ACCESSIONED`
- **AND** an `IMAGING_STUDY_ACCESSIONED` event is pushed to the Timeline

### Requirement: Image Acquisition Tracking
The system SHALL allow tracking the acquisition status of a radiology order.

#### Scenario: Modality completes scan
- **WHEN** a technician marks the image as acquired
- **THEN** the `ImagingStudy` status is `IMAGE_ACQUIRED` and the `ClinicalOrder` transitions to `IMAGE_ACQUIRED`
- **AND** an `IMAGE_ACQUIRED` event is pushed to the Timeline

### Requirement: Radiology Report Drafting
The system SHALL allow radiologists to draft reports for acquired imaging studies.

#### Scenario: Radiologist saves draft
- **WHEN** a radiologist saves a text report for an acquired study
- **THEN** a `RadiologyReport` is created in `REPORT_DRAFTED` status
- **AND** a `RADIOLOGY_REPORT_DRAFTED` event is pushed to the Timeline

### Requirement: Radiology Report Verification
The system SHALL allow authorized radiologists to verify reports.

#### Scenario: Radiologist verifies report
- **WHEN** a radiologist verifies a draft report
- **THEN** the `RadiologyReport` is `REPORT_VERIFIED`, the `ClinicalOrder` transitions to `COMPLETED`
- **AND** a `RADIOLOGY_REPORT_VERIFIED` event is pushed to the Timeline
- **AND** a `RADIOLOGY_ORDER_COMPLETED` event is pushed to the Timeline (hook for Billing)
