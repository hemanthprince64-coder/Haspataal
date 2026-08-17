## ADDED Requirements

### Requirement: PACS Metadata Capture
The system SHALL capture standardized DICOM metadata strings when an imaging study is accessioned to enable future PACS linkage.

#### Scenario: Study accession generates identifiers
- **WHEN** an imaging study is created
- **THEN** a globally unique `StudyInstanceUID` is generated and assigned
- **AND** a unique `AccessionNumber` is assigned for the hospital tenant

### Requirement: DICOM Modality Mapping
The system SHALL strictly map internal radiology order types to standard DICOM modality strings.

#### Scenario: X-Ray maps to DX/CR
- **WHEN** an X-Ray study is accessioned
- **THEN** its modality field is explicitly recorded as `DX` or `CR`
