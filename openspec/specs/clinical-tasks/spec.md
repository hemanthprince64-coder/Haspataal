## ADDED Requirements

### Requirement: Clinical Workflow Tasks
The system SHALL support `ClinicalTask` to model nursing and operational workflow items (e.g., "Give Injection", "Monitor Sugar", "Remove Foley") as distinct from diagnostic `ClinicalOrder`s.

#### Scenario: Creating a nursing task
- **WHEN** a doctor requests daily dressing changes for an inpatient
- **THEN** the system SHALL create a `ClinicalTask` for "Daily Dressing" linked to the active Encounter.

### Requirement: Task Execution Tracking
The system SHALL allow staff to claim and complete a `ClinicalTask`, logging the `performedBy` user and timestamp.

#### Scenario: Completing a nursing task
- **WHEN** a nurse completes a scheduled injection task
- **THEN** the task status transitions to `COMPLETED` and the nurse's ID is recorded.
