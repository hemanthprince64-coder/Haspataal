## ADDED Requirements

### Requirement: Structured Test Templates
The system SHALL allow definition of structured templates (e.g. CBC, LFT) containing multiple parameters with standard units and reference ranges.

#### Scenario: Defining a CBC Template
- **WHEN** an admin creates a CBC template
- **THEN** the template saves parameters (Hemoglobin, WBC, Platelets) along with gender/age-specific reference ranges.

### Requirement: Result Validation Against Templates
The system SHALL validate entered lab results against the selected template's reference ranges.

#### Scenario: Out of Range Detection
- **WHEN** a technician enters a value that is outside the template's reference range
- **THEN** the system visually flags the value as Abnormal during Result Entry
