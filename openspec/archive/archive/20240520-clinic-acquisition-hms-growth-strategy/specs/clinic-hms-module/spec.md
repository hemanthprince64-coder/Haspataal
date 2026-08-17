## ADDED Requirements

### Requirement: Clinic profile creation
The system SHALL support creating a `ClinicProfile` linked to a `HospitalsMaster` record, indicating the account operates in clinic mode rather than hospital mode.

#### Scenario: Clinic profile created during onboarding
- **WHEN** a user selects "I am a clinic" during hospital/clinic onboarding
- **THEN** the system SHALL create a `HospitalsMaster` record with `facilityType = CLINIC` and a linked `ClinicProfile` record

#### Scenario: Existing hospital cannot downgrade to clinic
- **WHEN** an existing hospital-tier account attempts to set `facilityType = CLINIC`
- **THEN** the system SHALL reject the request with `400 Bad Request` and message "Hospitals cannot downgrade to clinic tier"

### Requirement: Simplified clinic HMS dashboard
The system SHALL render a simplified clinic dashboard that hides hospital-specific modules (IPD, wards, complex bed management, multi-branch treasury) and shows only clinic-relevant modules (OPD, prescriptions, billing, appointments, patient records, follow-ups, lab/pharmacy).

#### Scenario: Clinic user logs into HMS
- **WHEN** a clinic-tier user navigates to the HMS dashboard
- **THEN** the system SHALL show only OPD, Billing, Appointments, Patients, Pharmacy, Diagnostics, and Follow-up modules; IPD, Wards, and Treasury modules SHALL be hidden

#### Scenario: Hospital user still sees full HMS
- **WHEN** a hospital-tier user navigates to the HMS dashboard
- **THEN** the system SHALL show all modules including IPD, Wards, and Treasury

### Requirement: Clinic-scoped billing simplification
The system SHALL support simplified billing for clinics with optional GST (only if revenue >= ₹20 lakh) and without HSN code complexity.

#### Scenario: Clinic with revenue < ₹20 lakh
- **WHEN** a clinic's annual revenue is below ₹20 lakh and `gstExempt = true`
- **THEN** the system SHALL generate invoices without GST and without HSN codes

#### Scenario: Clinic with revenue >= ₹20 lakh
- **WHEN** a clinic's annual revenue is above ₹20 lakh or `gstExempt = false`
- **THEN** the system SHALL generate invoices with GST and HSN codes as per existing hospital billing logic
