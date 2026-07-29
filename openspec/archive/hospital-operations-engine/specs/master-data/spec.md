## ADDED Requirements

### Requirement: ICD-10 Master Data
The system SHALL maintain ICD-10 diagnosis codes with hierarchical structure.

#### Scenario: ICD-10 lookup by code
- **WHEN** user searches for diagnosis code "I10"
- **THEN** system SHALL return "Essential (primary) hypertension"
- **AND** system SHALL provide parent category "Diseases of the circulatory system"

### Requirement: LOINC Investigation Codes
The system SHALL maintain LOINC codes for laboratory investigations.

#### Scenario: LOINC code validation
- **WHEN** lab test uses LOINC code "2093-3"
- **THEN** system SHALL validate it maps to Cholesterol

### Requirement: SNOMED CT Integration Ready
The system SHALL be ready to import SNOMED CT concepts.

#### Scenario: SNOMED concept structure
- **WHEN** SNOMED data is imported
- **THEN** system SHALL map to existing clinical templates

### Requirement: Drug Master with Brands
The system SHALL maintain drug master with generic names and brand mappings.

#### Scenario: Drug variant lookup
- **WHEN** user searches "Paracetamol"
- **THEN** system SHALL return all brands: Crocin, P-250, Calpol, etc.

### Requirement: Investigation Master
The system SHALL maintain investigation catalog with reference ranges.

#### Scenario: Investigation with reference ranges
- **WHEN** "Hb" test is selected
- **THEN** system SHALL return adult range: 13-17 g/dL for men, 12-14 g/dL for women