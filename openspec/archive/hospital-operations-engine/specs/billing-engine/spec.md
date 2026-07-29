## ADDED Requirements

### Requirement: Dynamic Billing
The system SHALL generate bills from multiple sources.

#### Scenario: Consolidated billing
- **WHEN** patient is discharged
- **THEN** system SHALL consolidate consultation, lab, pharmacy, and room charges
- **AND** system SHALL publish InvoiceGenerated event

### Requirement: Insurance Handling
The system SHALL process insurance claims.

#### Scenario: Cashless authorization
- **WHEN** insurance is verified
- **THEN** system SHALL mark as cashless
- **AND** TPA SHALL receive authorization request

### Requirement: Refund Processing
The system SHALL process refunds for cancellations.

#### Scenario: Refund approval
- **WHEN** refund is requested
- **THEN** system SHALL require admin approval
- **AND** system SHALL log RefundProcessed event

### Requirement: GST Compliance
The system SHALL calculate GST for all taxable items.

#### Scenario: GST calculation
- **WHEN** bill includes taxable items
- **THEN** system SHALL calculate 18% GST
- **AND** breakup SHALL be shown in invoice