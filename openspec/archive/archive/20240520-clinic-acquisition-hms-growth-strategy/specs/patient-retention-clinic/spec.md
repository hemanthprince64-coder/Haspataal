## ADDED Requirements

### Requirement: Clinic-calibrated follow-up reminders
The system SHALL send automated follow-up reminders to clinic patients at intervals appropriate for clinic cadence (e.g., 3 days, 7 days, 14 days for acute conditions) rather than hospital intervals (30, 60, 90 days). Care pathways for clinic users SHALL default to shorter intervals and be editable per clinic.

#### Scenario: Patient discharged from clinic with acute condition
- **WHEN** a patient completes an OPD visit for an acute condition and the doctor marks a follow-up needed
- **THEN** the system SHALL schedule reminders at 3, 7, and 14 days, NOT at 30, 60, and 90 days

### Requirement: Vaccination and chronic disease tracking for clinics
The system SHALL track vaccination schedules and chronic disease follow-ups specific to clinic care, including pediatric vaccination reminders, diabetes/hypertension monitoring, and annual health check alerts.

#### Scenario: Pediatric vaccination reminder
- **WHEN** a child patient is registered in a clinic and their age matches a due vaccination milestone
- **THEN** the system SHALL send a WhatsApp/SMS reminder to the parent's registered contact

#### Scenario: Missed appointment recovery for clinic
- **WHEN** a patient misses a clinic appointment and does not rebook within 48 hours
- **THEN** the system SHALL send a recovery message via WhatsApp with a direct booking link

### Requirement: Clinic-specific notification curfews
The system SHALL respect clinic operating hours for notifications, overriding the global 10 PM–8 AM curfew. Default operating hours for clinics are 9 AM–9 PM, configurable per clinic.

#### Scenario: Notification sent during clinic hours
- **WHEN** a notification is triggered during a clinic's configured operating hours
- **THEN** the system SHALL send the notification immediately

#### Scenario: Notification triggered outside clinic hours
- **WHEN** a notification is triggered outside a clinic's configured operating hours
- **THEN** the system SHALL defer the notification to the start of the next operating day
