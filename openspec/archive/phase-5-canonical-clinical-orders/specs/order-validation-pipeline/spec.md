## ADDED Requirements

### Requirement: Independent Validation Pipeline
Clinical Decision Support (CDS) SHALL be an independent pipeline decoupled from the state machine (e.g., Duplicate Detection -> Drug Interaction -> Allergy -> Renal Dose).

#### Scenario: CDS Duplicate Warning
- **WHEN** a clinician orders a CBC and another CBC was completed 2 hours ago
- **THEN** the pipeline yields a Duplicate Warning.

### Requirement: Clinician Override
Duplicate detection and warnings SHALL NOT automatically suppress clinical intent. The system MUST allow the clinician to override the warning by providing a recorded reason.

#### Scenario: Overriding a Warning
- **WHEN** a clinician receives a Duplicate Warning for a CBC but decides it's clinically necessary
- **THEN** they submit an override with the reason "Monitoring post-transfusion", and the order is authorized and proceeds.
