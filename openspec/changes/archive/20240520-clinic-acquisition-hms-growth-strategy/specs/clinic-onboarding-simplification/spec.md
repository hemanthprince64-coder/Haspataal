## MODIFIED Requirements

### Requirement: 14-step setup wizard supports clinic mode
The system SHALL support a "Clinic Mode" within the existing 14-step setup wizard that reduces the required steps to 6 for clinics, hiding hospital-specific modules (IPD, wards, bed management, complex treasury).

#### Scenario: Clinic user completes simplified setup
- **WHEN** a clinic user completes onboarding
- **THEN** the system SHALL require only: Identity, Clinical Structure (OPD only), Doctors, OPD, Billing (simplified), and Integrations — omitting IPD, Wards, Pharmacy (optional), Diagnostics (optional), Retention (pre-enabled), Marketplace, and Activation (auto-activated)

#### Scenario: Hospital user still completes full 14-step setup
- **WHEN** a hospital user completes onboarding
- **THEN** the system SHALL require all 14 steps as existing behavior

### Requirement: Clinic tier feature flag
The system SHALL support a per-account feature flag `ENABLE_CLINIC_TIER` that controls whether the clinic tier features are visible and usable. Default: `false` for existing accounts, `true` for new accounts that select "I am a clinic" during onboarding.

#### Scenario: Feature flag is `false`
- **WHEN** `ENABLE_CLINIC_TIER = false` for an account
- **THEN** the system SHALL behave as a hospital-only account (existing behavior)

#### Scenario: Feature flag is `true`
- **WHEN** `ENABLE_CLINIC_TIER = true` for an account
- **THEN** the system SHALL enable clinic mode UI, simplified billing, and clinic-specific retention engine

### Requirement: Clinic ABDM registration
The system SHALL support clinic-level ABDM registration using a simplified facility registration form that only requires: clinic name, address, PAN number, and owner KYC — omitting hospital-specific fields like bed count, department accreditations, and NABH number.

#### Scenario: Clinic owner registers with ABDM
- **WHEN** a clinic admin initiates ABDM registration
- **THEN** the system SHALL present a simplified form with only clinic name, address line 1, address line 2, city, state, pincode, PAN number, and owner KYC, and SHALL NOT require bed count or department accreditations

### Requirement: Clinic billing relaxed for non-GST
The system SHALL support GST-exempt billing for clinics with annual revenue below ₹20 lakh, removing HSN code requirements and generating a simplified invoice without GST line items.

#### Scenario: Clinic with revenue < ₹20 lakh generates invoice
- **WHEN** a clinic with `gstExempt = true` generates a patient bill
- **THEN** the system SHALL generate an invoice with: subtotal only, no GST line item, no HSN codes, a note "GST Exempt as per Section 23 of CGST Act", and the clinic's signature block

## REMOVED Requirements

### Requirement: IPD module in clinic mode
**Reason**: Clinics do not have in-patient departments; the IPD module is not applicable
**Migration**: If a clinic upgrades to hospital tier, the IPD module becomes available automatically via `facilityType = HOSPITAL`
