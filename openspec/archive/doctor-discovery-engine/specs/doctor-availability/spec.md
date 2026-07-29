## ADDED Requirements

### Requirement: Compute real-time availability
The system SHALL compute doctor availability based on weekly schedule, holidays, leaves, and existing appointments.

#### Scenario: Availability excludes leave days
- **WHEN** doctor is on leave for a date
- **THEN** system SHALL show availability as "On Leave"
- **THEN** booking SHALL be blocked for those dates

### Requirement: Weekly schedule support
The system SHALL read doctor's weekly schedule (morning/evening sessions) for availability.

#### Scenario: Morning session slots
- **WHEN** doctor has morning: 9:00-13:00 with 15min slots
- **THEN** system SHALL generate slots: 9:00, 9:15, 9:30, ..., 12:45
- **AND** system SHALL respect slot capacity limits

### Requirement: Holiday calendar integration
The system SHALL block availability on scheduled holidays.

#### Scenario: Festival holiday blocks slots
- **WHEN** hospital declares holiday for specific date
- **THEN** system SHALL show "Holiday" status
- **AND** all doctor slots SHALL be unavailable

### Requirement: Availability status calculation
The system SHALL return one of: Available, Limited Slots, Fully Booked, On Leave, Offline, Emergency Only.

#### Scenario: Fully booked status
- **WHEN** all slots for a day are booked
- **THEN** system SHALL return "Fully Booked" status
- **AND** patient SHALL NOT see available slots

### Requirement: Next available slot
The system SHALL compute the next available slot for a doctor.

#### Scenario: Next slot calculation
- **WHEN** doctor has schedule Monday-Saturday
- **AND** today is Friday after 17:00
- **THEN** system SHALL return next Saturday's first available slot

## MODIFIED Requirements

### Requirement: Leave creation updates availability
The system SHALL automatically hide slots when leave is created.

#### Scenario: Recuring leave applies weekly
- **WHEN** doctor creates recurring leave on Mondays
- **THEN** system SHALL block all Monday slots
- **AND** system SHALL show "Doctor is on Leave" to patients