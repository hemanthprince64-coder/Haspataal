## ADDED Requirements

### Requirement: Reception workflow validation
The reception workflow SHALL support patient registration, appointment booking, and queue management with minimum 3 clicks from landing to confirmed appointment.

#### Scenario: Minimum click reception
- **WHEN** receptionist creates new appointment for registered patient
- **THEN** appointment is confirmed in 3 or fewer clicks

### Requirement: Keyboard workflow support
All hospital workflows SHALL support keyboard-only navigation for power users.

#### Scenario: Keyboard navigation
- **WHEN** nurse navigates patient list using only keyboard
- **THEN** all actions are accessible via keyboard shortcuts

### Requirement: Authorization validation
Every workflow action SHALL enforce appropriate RBAC policies. Unauthorized actions SHALL be blocked with clear error messages.

#### Scenario: Authorization enforcement
- **WHEN** receptionist attempts to approve prescription
- **THEN** action is blocked with 403 Forbidden

### Requirement: Audit trail completeness
Every workflow step SHALL generate audit log entry with actor, timestamp, action, resource, and outcome.

#### Scenario: Complete audit trail
- **WHEN** doctor updates diagnosis
- **THEN** audit log contains complete record of the change

### Requirement: Rollback capability
Every workflow SHALL support rollback of the last action. Rollback SHALL restore previous state and generate compensating audit entry.

#### Scenario: Workflow rollback
- **WHEN** nurse rolls back medication administration
- **THEN** previous state is restored and audit trail records the rollback

### Requirement: Timeline accuracy
Every clinical event SHALL appear in the patient timeline within 5 seconds of occurrence.

#### Scenario: Timeline accuracy
- **WHEN** lab result is published
- **THEN** event appears in patient timeline within 5 seconds

### Requirement: Journey continuity
Patient care journey SHALL persist across all modules. Handoffs between departments SHALL maintain context.

#### Scenario: Journey continuity
- **WHEN** patient moves from OPD to IPD
- **THEN** care journey continues with all OPD context preserved

### Requirement: Billing integration
Every clinical event SHALL trigger appropriate billing event. Billing SHALL be accurate to within 1% of manual calculation.

#### Scenario: Automatic billing
- **WHEN** lab test is ordered
- **THEN** corresponding billing line item is created automatically

### Requirement: Notification delivery
Critical workflow events SHALL trigger notifications to appropriate staff. Delivery SHALL be confirmed.

#### Scenario: Critical notification
- **WHEN** critical lab result is published
- **THEN** attending doctor receives notification within 30 seconds
