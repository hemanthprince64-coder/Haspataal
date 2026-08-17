## ADDED Requirements

### Requirement: Clinic online discoverability and local SEO
The system SHALL generate a public-facing, SEO-optimized clinic profile page for each clinic, accessible at `<slug>.haspataal.com/<city>/<specialty>`, including clinic name, doctor profiles, specialties, services, contact details, and appointment booking link.

#### Scenario: Patient searches for "cardiologist in Jaipur"
- **WHEN** a patient searches Google for "cardiologist in Jaipur"
- **THEN** the system SHALL ensure the clinic's profile page appears in local search results with correct structured data (Schema.org MedicalClinic)

### Requirement: Referral tracking and optimization
The system SHALL track patient referrals between doctors, clinics, and external facilities, providing clinics with analytics on referral sources, conversion rates, and revenue from referred patients.

#### Scenario: Doctor refers patient to another doctor in same clinic
- **WHEN** a doctor marks a patient as "Referred to [Doctor B]" in the EMR
- **THEN** the system SHALL log a `REFERRAL_INTERNAL` event, increment the referrer doctor's referral count, and surface the pending referral in Doctor B's task queue

#### Scenario: Clinic receives external referral
- **WHEN** a patient is referred to a clinic from an external source (hospital, lab, another clinic)
- **THEN** the system SHALL log a `REFERRAL_EXTERNAL` event, store the source, and track conversion (appointment booked within 7 days = converted)

### Requirement: Patient acquisition analytics dashboard
The system SHALL provide a clinic-specific analytics dashboard showing patient acquisition metrics: new patient count per week, source attribution (SEO, direct, referral), appointment conversion rate, and revenue per patient.

#### Scenario: Clinic owner views acquisition dashboard
- **WHEN** a clinic owner navigates to the Analytics > Acquisition section
- **THEN** the system SHALL render a dashboard with: total new patients (last 30 days), source pie chart, weekly trend line, top-converting specialties, and referral heat map
