## MODIFIED Requirements

### Requirement: Consultation Check-In
The system SHALL transition a Booking to `CHECKED_IN` status when a receptionist marks the patient as arrived.

#### Scenario: Patient arrives at reception
- **WHEN** the receptionist confirms patient arrival
- **THEN** the booking status updates to `CHECKED_IN`
- **THEN** the system SHALL create a new active `Encounter` for the patient.
