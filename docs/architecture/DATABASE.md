# Database Architecture

## Overview
PostgreSQL database schema with Prisma ORM, multi-tenant RLS (Row Level Security) policies, and Supabase integration.

## Entity Relationship Diagram

### Core Entities
```
DoctorMaster ←→ DoctorProfile
DoctorMaster ←→ DoctorEducation
DoctorMaster ←→ DoctorCertification
DoctorMaster ←→ DoctorSkill
DoctorMaster ←→ DoctorExperience
DoctorMaster ←→ DoctorVerification
DoctorMaster ←→ DoctorHospitalAffiliation

Patient ←→ Consent
Patient ←→ VitalRecord
Patient ←→ PatientMedication
Patient ←→ PatientPrescription

HospitalsMaster ←→ DoctorHospitalAffiliation
HospitalsMaster ←→ Staff
HospitalsMaster ←→ Bed
HospitalsMaster ←→ Department

Appointment ←→ Payment
Appointment ←→ Visit
DiagnosticOrder ←→ DiagnosticOrderItem
```

## Tables

### Doctor Module

#### DoctorMaster
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| fullName | String | Doctor's full name |
| mobile | String | Unique mobile number |
| email | String | Unique email |
| dob | Date | Date of birth |
| gender | String | Gender |
| profilePhotoUrl | String | Photo URL |
| password | String | Hashed password |
| kycStatus | KycStatus | Verification status |
| accountStatus | AccountStatus | Account status |
| experienceYears | Int | Total experience |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update |

#### DoctorProfile
| Column | Type | Description |
|--------|------|-------------|
| doctorId | UUID | Foreign key to DoctorMaster |
| firstName | String | First name |
| lastName | String | Last name |
| gender | String | Gender |
| dob | Date | Date of birth |
| experienceYears | Int | Years of experience |
| speciality | String | Primary specialty |
| bio | String | Doctor biography |

#### DoctorEducation
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| doctorId | UUID | Foreign key |
| degreeType | String | MBBS, MD, MS, DM, MCh, DNB |
| degreeName | String | Specialty name |
| collegeName | String | College/University |
| year | Int | Graduation year |
| registrationNumber | String | Registration number |

#### DoctorCertification
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| doctorId | UUID | Foreign key |
| courseName | String | Certification name |
| authority | String | Issuing authority |
| certificateNo | String | Certificate number |
| expiryDate | Date | Expiry date |

#### DoctorIdentityDoc
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| doctorId | UUID | Foreign key |
| documentType | String | MBBS_CERT, PG_CERT, etc. |
| documentUrl | String | Secure storage URL |
| verificationStatus | VerificationStatus | Status enum |

#### DoctorVerification
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| doctorId | UUID | Unique foreign key |
| status | VerificationStatus | Current status |
| verifiedBy | String | Verifier ID |
| verifiedAt | DateTime | Verification time |
| rejectionReason | String | Rejection notes |

#### DoctorHospitalAffiliation
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| doctorId | UUID | Doctor foreign key |
| hospitalId | UUID | Hospital foreign key |
| role | String | DOCTOR, CONSULTANT, etc. |
| department | String | Department name |
| consultationFee | Decimal | Fee per consultation |
| verificationStatus | VerificationStatus | Affiliation status |

### Patient Module

#### Patient
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | String | Patient name |
| phone | String | Unique phone |
| email | String | Email |
| password | String | Hashed password |
| abhaAddress | String | ABHA ID |
| gender | String | Gender |
| dob | Date | Date of birth |
| bloodGroup | String | Blood group |

#### Consent
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| patientId | UUID | Foreign key |
| purpose | ConsentPurpose | Consent type |
| givenAt | DateTime | Consent given |
| withdrawnAt | DateTime | Withdrawal time |

#### PatientConsent
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| patientGlobalId | UUID | Global patient ID |
| hospitalId | UUID | Hospital ID |
| consentType | String | Consent type |
| version | Int | Version number |
| isActive | Boolean | Active status |

### Hospital Module

#### HospitalsMaster
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| legalName | String | Registered name |
| displayName | String | Display name |
| registrationNumber | String | Reg. number |
| gstNumber | String | GST number |
| panNumber | String | PAN number |
| hospitalType | String | Type |
| nabhAccredited | Boolean | NABH status |
| addressLine1 | String | Address |
| city | String | City |
| state | String | State |
| pincode | String | Pincode |

### Clinical Module

#### AuditLog
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | String | User ID |
| hospitalId | String | Hospital ID |
| action | String | Action type |
| entity | String | Entity type |
| entityId | String | Entity ID |
| details | Json | Details |
| createdAt | DateTime | Timestamp |

#### OtpCode
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| phone | String | Mobile number |
| code | String | OTP code |
| expiresAt | DateTime | Expiry time |
| createdAt | DateTime | Creation time |

## Indexes

### Critical Indexes
```sql
-- Doctor lookups
CREATE INDEX idx_doctors_mobile ON doctors_master(mobile);
CREATE INDEX idx_doctors_email ON doctors_master(email);

-- Patient lookups
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_abha ON patients(abha_address);

-- Hospital lookups
CREATE INDEX idx_hospitals_city ON hospitals_master(city);
CREATE INDEX idx_hospitals_registration ON hospitals_master(registration_number);

-- Affiliation lookups
CREATE INDEX idx_affiliations_hospital ON doctor_hospital_affiliations(hospital_id);
CREATE INDEX idx_affiliations_doctor ON doctor_hospital_affiliations(doctor_id);
CREATE UNIQUE INDEX idx_affiliations_unique ON doctor_hospital_affiliations(doctor_id, hospital_id);
```

## Constraints

### Foreign Key Constraints
- All `doctorId` references `doctor_master.id`
- All `hospitalId` references `hospitals_master.id`
- All `patientId` references `patients.id`
- Cascade delete on patient/doctor removal

### Check Constraints
```sql
-- Mobile format validation
ALTER TABLE doctors_master ADD CONSTRAINT chk_mobile_format 
CHECK (mobile ~ '^[6-9][0-9]{9}$');

ALTER TABLE patients ADD CONSTRAINT chk_mobile_format 
CHECK (phone ~ '^[6-9][0-9]{9}$');
```

## RLS Policies

### Multi-Tenant Isolation
```sql
-- Doctor documents - owner only
CREATE POLICY doctor_docs_owner_only
ON doctor_identity_docs FOR ALL
USING (EXISTS (
  SELECT 1 FROM doctors_master 
  WHERE id = doctor_identity_docs.doctor_id
));

-- Doctor education - owner only
CREATE POLICY doctor_education_owner_only
ON doctor_education FOR ALL
USING (EXISTS (
  SELECT 1 FROM doctors_master 
  WHERE id = doctor_education.doctor_id
));

-- Doctor certifications - owner only
CREATE POLICY doctor_certs_owner_only
ON doctor_certifications FOR ALL
USING (EXISTS (
  SELECT 1 FROM doctors_master 
  WHERE id = doctor_certifications.doctor_id
));

-- Affiliations - hospital isolation
CREATE POLICY affiliations_hospital_isolation
ON doctor_hospital_affiliations FOR ALL
USING (
  hospital_id = current_setting('request.hospital_id')::uuid
);

-- Patient consents - hospital isolation
CREATE POLICY patient_consents_hospital_isolation
ON patient_consents FOR ALL
USING (
  hospital_id = current_setting('request.hospital_id')::uuid
);

-- Audit logs - hospital isolation for non-admins
CREATE POLICY audit_logs_hospital_isolation
ON audit_logs FOR ALL
USING (
  hospital_id = current_setting('request.hospital_id')::uuid
  OR (current_setting('request.role'))::text = 'SUPER_ADMIN'
);
```

### RLS Enable Commands
```sql
ALTER TABLE doctor_identity_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_hospital_affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

## Triggers

### Audit Triggers
```sql
-- Audit log trigger
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, entity, entity_id, details)
  VALUES (auth.uid(), TG_ARGV[0], TG_TABLE_NAME, NEW.id, row_to_json(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to critical tables
CREATE TRIGGER audit_doctors_insert
AFTER INSERT ON doctors_master
FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn('INSERT');
```

## Migrations

### Phase 1 Migration
- `migrations/01_phase1_rls_policies.sql` - RLS policies
- Prisma schema updates for new tables
- Verification status enum updates

### Doctor Verification
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| doctorId | UUID | Unique foreign key |
| status | VerificationStatus | Current status |
| verifiedBy | String | Verifier ID |
| verifiedAt | DateTime | Verification time |
| rejectionReason | String | Rejection notes |

#### DoctorSearchIndex
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| doctorId | UUID | Unique foreign key |
| fullName | String | Doctor name |
| specialties | String[] | Specialty array |
| departments | String[] | Department array |
| city | String | City |
| state | String | State |
| latitude | Float | Hospital lat |
| longitude | Float | Hospital lng |
| avgRating | Float | Average rating |
| reviewCount | Int | Review count |

#### DoctorPublicProfile
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| doctorId | UUID | Unique foreign key |
| fullName | String | Doctor name |
| qualifications | String[] | Qualifications |
| specialties | String[] | Specialty array |
| yearsExperience | Int | Experience years |
| languages | String[] | Spoken languages |
| consultationFee | Decimal | Fee amount |
| availableToday | Boolean | Available flag |
| availabilityStatus | String | Status enum |

#### DoctorAvailability
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| doctorId | UUID | Doctor foreign key |
| hospitalId | UUID | Hospital foreign key |
| date | Date | Availability date |
| status | String | Available/Limited/Full/Leave |
| availableSlots | Int | Slots count |
| bookableSlots | Int | Bookable count |
| cachedAt | DateTime | Cache timestamp |
| ttlExpiresAt | DateTime | TTL expiry |

#### DoctorHoliday
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| doctorId | UUID | Doctor foreign key |
| hospitalId | UUID | Hospital foreign key |
| date | Date | Holiday date |
| holidayType | String | FESTIVAL/PERSONAL/CONFERENCE |
| isRecurring | Boolean | Recurring flag |

#### DoctorLeave
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| doctorId | UUID | Doctor foreign key |
| leaveType | String | CASUAL/EARNED/SICK/CONFERENCE |
| startDate | Date | Start date |
| endDate | Date | End date |
| isApproved | Boolean | Approval status |
| visibility | String | PUBLIC/PRIVATE |

### Implementation
- `deletedAt` DateTime column on all major tables
- Queries filter `WHERE deletedAt IS NULL`
- Recovery possible within retention period

## Master Data

### Reference Tables
- `DiagnosticCategory` - Lab/Radiology categories
- `DiagnosticMasterTest` - Test catalog
- `Role` enum - User roles
- `VerificationStatus` enum - Doctor status
- `KycStatus` enum - KYC status
- `ConsentPurpose` enum - Consent types

## Future Migrations

### Phase 2
- DoctorSearchIndex table for discovery
- DoctorAvailability computation table
- CareJourney enhancements
- ClinicalDecisionSupport tables

### Phase 3
- Master data versioning schema
- Feature flags configuration
- Analytics materialized views