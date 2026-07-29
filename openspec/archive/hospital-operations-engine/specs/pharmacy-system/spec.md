## ADDED Requirements

### Requirement: Drug Inventory Management
The system SHALL track drug inventory with batch, expiry, and stock levels.

#### Scenario: Low stock alert
- **WHEN** drug stock falls below minimum threshold
- **THEN** system SHALL trigger purchase alert
- **AND** system SHALL notify pharmacy in-charge

### Requirement: Purchase Order Generation
The system SHALL generate purchase orders for low stock drugs.

#### Scenario: PO creation
- **WHEN** stock is low and auto-order enabled
- **THEN** system SHALL create purchase order
- **AND** system SHALL send to vendor via email/SMS

### Requirement: Dispensing Workflow
The system SHALL dispense drugs against prescriptions.

#### Scenario: Dispensing validation
- **WHEN** pharmacist dispenses medication
- **THEN** system SHALL check drug interactions
- **AND** system SHALL validate against patient allergies

### Requirement: Stock Audit
The system SHALL audit inventory periodically.

#### Scenario: Monthly audit
- **WHEN** audit is triggered
- **THEN** system SHALL generate variance report
- **AND** system SHALL log all discrepancies