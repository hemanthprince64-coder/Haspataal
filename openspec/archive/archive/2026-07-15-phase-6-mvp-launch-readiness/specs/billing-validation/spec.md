## ADDED Requirements

### Requirement: OPD billing accuracy
Every OPD consultation SHALL generate a billing event with correct consultation fee, doctor fee, and any additional charges.

#### Scenario: OPD billing generation
- **WHEN** OPD consultation is completed
- **THEN** billing event is created with consultation fee, doctor fee, and tax

### Requirement: IPD billing accuracy
Every admission SHALL generate billing events for admission fee, daily room charge, nursing charge, and procedure charges.

#### Scenario: IPD billing generation
- **WHEN** patient is admitted for 3 days
- **THEN** billing events include admission fee, 3x daily charges, and any procedures

### Requirement: Pharmacy billing accuracy
Every dispensed medication SHALL generate a billing line item with correct drug price, quantity, and tax.

#### Scenario: Pharmacy billing
- **WHEN** pharmacy dispenses medication
- **THEN** billing line item is created with correct price, quantity discount, and tax

### Requirement: Laboratory billing accuracy
Every lab order SHALL generate billing events for each test with correct test price and package discount.

#### Scenario: Lab billing
- **WHEN** lab panel with 5 tests is ordered
- **THEN** 5 billing line items are created with package discount applied

### Requirement: Radiology billing accuracy
Every radiology order SHALL generate billing events for each imaging study with correct modality price and contrast charges.

#### Scenario: Radiology billing
- **WHEN** CT scan with contrast is ordered
- **THEN** billing events include CT fee and contrast charge

### Requirement: Procedure billing accuracy
Every procedure SHALL generate billing events for surgeon fee, anesthetist fee, OT charges, and consumables.

#### Scenario: Procedure billing
- **WHEN** surgery is performed
- **THEN** billing events include surgeon fee, anesthetist fee, OT charges, and consumables

### Requirement: Billing reconciliation
Daily billing totals SHALL reconcile with clinical events. Discrepancies SHALL be flagged for investigation.

#### Scenario: Billing reconciliation
- **WHEN** daily billing report is generated
- **THEN** total matches sum of all clinical billing events within 0.01% tolerance
