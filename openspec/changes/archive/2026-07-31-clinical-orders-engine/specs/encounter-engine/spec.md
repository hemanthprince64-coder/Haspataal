## ADDED Requirements

### Requirement: Encounter as Clinical Anchor
The system SHALL treat the Encounter as the primary container for all clinical activities (Orders, Tasks, Vitals, Notes). An Encounter MUST have a `patientId` and `hospitalId`. An `appointmentId` is OPTIONAL. 

#### Scenario: Creating a walk-in emergency encounter
- **WHEN** a patient arrives in the ER without an appointment
- **THEN** the system SHALL create a new Encounter record of type `EMERGENCY` linked only to the patient.

### Requirement: Encounter Types
The system SHALL support explicit `EncounterType`s: OPD, IPD, EMERGENCY, TELECONSULTATION, HOME_VISIT, DAYCARE, and FOLLOW_UP.

#### Scenario: Categorizing an encounter
- **WHEN** an encounter is created for an admitted patient
- **THEN** the encounter type SHALL be set to `IPD`.
