# Phase 1 Foundation Design

## Architecture

### Multi-Tenant Data Layer
- **PostgreSQL RLS**: Row-level security policies on ALL tables with `hospital_id`
- **Platform vs Hospital DB Split**: 
  - Platform DB: Identity, Auth, Consent, Linked Hospitals
  - Hospital DB: Encounters, EMR, Prescriptions, Investigations, Billing
- **Tenant Context Middleware**: Express middleware extracting hospital from JWT claims

### Authentication Flow
```
Patient: Mobile OTP → Verify → Session Token (JWT)
Hospital: Email/Password → MFA Check → Session Token (JWT)
Doctor: Mobile OTP → Email/Password → Profile Setup → Hospital Invitation → Affiliation
```

### Doctor Identity Lifecycle
```
DRAFT → PROFILE_INCOMPLETE → DOCUMENT_PENDING → UNDER_VERIFICATION → VERIFIED → ACTIVE → SUSPENDED → ARCHIVED
```

### Hospital Onboarding State Machine
```
REGISTERED → DOCUMENTS_UPLOADED → UNDER_REVIEW → VERIFIED → SETUP_IN_PROGRESS → GO_LIVE_READY → ACTIVE
```

## Database Schema Additions

### Doctor Identity Module (18 tables)
| Table | Purpose | Key Fields |
|-------|---------|------------|
| DoctorProfile | Personal/details | name, dob, gender, photo, languages, bio |
| DoctorEducation | Qualifications | degree, college, year, registration |
| DoctorCertification | Certifications | course, authority, number, expiry |
| DoctorSkill | Clinical skills | skill_name, level, certified_date |
| DoctorMembership | Professional bodies | org_name, membership_type |
| DoctorPublication | Research papers | journal, doi, year |
| DoctorAward | Recognitions | title, authority, year |
| DoctorConference | Events attended | name, role, year |
| DoctorExperience | Work history | org_name, designation, dates |
| DoctorDocument | Secure uploads | doc_type, url, encrypted, verified |
| DoctorVerification | Status tracking | status, verified_by, notes |
| DoctorAffiliation | Hospital links | hospital_id, role, fee, schedule |
| DoctorSchedule | OPD timings | day_of_week, sessions, slot_duration |
| DoctorLeave | Leave calendar | type, start_date, end_date, status |
| DoctorAnalytics | Performance metrics | consultation_count, avg_rating |

### Patient Clinical Data Module (12 tables)
| Table | Purpose |
|-------|---------|
| PatientConsent | Versioned consent management |
| TimelineEvent | Unified chronological events |
| ChiefComplaint | Multi-complaint capture |
| ClinicalHistory | HPI, PMH, family, social |
| ClinicalExamination | Systemic exams |
| Diagnosis | ICD-10 linked diagnoses |
| InvestigationOrder | Lab/radiology orders |
| Treatment | Procedures, IV fluids |
| ClinicalAttachment | Secure file storage |

## API Endpoints

### Authentication
- `POST /api/v1/auth/patient/otp` - Send OTP
- `POST /api/v1/auth/patient/verify` - Verify OTP
- `POST /api/v1/auth/hospital/login` - Hospital login
- `POST /api/v1/auth/hospital/forgot-password` - Password recovery

### Doctor Identity
- `POST /api/v1/doctors/register` - Platform registration
- `POST /api/v1/doctors/profile` - Personal info
- `POST /api/v1/doctors/education` - Education records
- `POST /api/v1/doctors/documents` - Document upload
- `GET /api/v1/doctors/search` - Search doctors
- `POST /api/v1/doctors/verify` - Verification submission

### Hospital Onboarding
- `POST /api/v1/hospitals/setup` - Setup wizard
- `POST /api/v1/hospitals/{id}/onboard` - Complete onboarding
- `GET /api/v1/hospitals/{id}/config` - Get configuration

### Patient Clinical Data
- `POST /api/v1/patients/register` - Registration with consent
- `POST /api/v1/patients/search` - Multi-method lookup
- `GET /api/v1/patients/{id}/summary` - Privacy-aware summary
- `GET /api/v1/patients/{id}/timeline` - Chronological events

## Security Implementation

### RBAC Matrix
| Role | Scopes |
|------|--------|
| SUPER_ADMIN | All hospitals, system config |
| HOSPITAL_ADMIN | Single hospital, all ops |
| DOCTOR | Assigned hospital, patients |
| RECEPTIONIST | Registration, appointments |
| NURSE | Vitals, notes, medications |
| PHARMACIST | Drugs, dispensing |
| LAB_TECH | Lab orders, results |
| RADIO_TECH | Imaging orders, reports |
| ACCOUNTANT | Billing, payments |
| RESIDENT | Limited clinical access |
| PATIENT | Own records only |

### RLS Policies
```sql
CREATE POLICY "Hospital isolation" ON patients
FOR ALL TO authenticated
USING (hospital_id = current_setting('hospitaal_id')::uuid);
```