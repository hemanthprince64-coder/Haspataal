## ADDED Requirements

### Requirement: Doctor Schedule CRUD Actions
The system SHALL support fetching, creating, and updating weekly schedule templates for doctors.

#### Scenario: Fetch Doctor Schedule
- **WHEN** getDoctorSchedule is called with a doctor ID
- **THEN** it SHALL return the weekly schedule list for the doctor

#### Scenario: Upsert Doctor Schedule
- **WHEN** upsertDoctorSchedule is called with doctor ID, day of week, start time, end time, and active status
- **THEN** it SHALL update or create the schedule and return a success status

### Requirement: Batch Slot Generation
The system SHALL support generating daily slots from the weekly template for a specified date range.

#### Scenario: Successful slot generation
- **WHEN** generateSlotsFromSchedule is called with doctor ID and date range
- **THEN** it SHALL generate slots in 15-minute increments for active days and save them in the database

### Requirement: Slot Range Blocking
The system SHALL support blocking a range of slots for a doctor with a reason.

#### Scenario: Block Slots
- **WHEN** blockExistingSlots is called with doctor ID, date, start time, end time, and reason
- **THEN** it SHALL insert a DoctorSlotBlock record and return success

### Requirement: Doctor Slot Retrieval
The system SHALL support fetching paginated doctor slots.

#### Scenario: Fetch Slots
- **WHEN** getSlotsForDoctor is called with doctor ID, start date, and end date
- **THEN** it SHALL return the list of doctor slots
