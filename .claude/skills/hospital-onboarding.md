# Skill: Hospital Onboarding Flow

## Overview
Complete hospital registration, verification, and configuration process for platform onboarding.

## Components

### Hospital Registration
- Hospital submits registration form with legal details
- Required fields: name, city, address, registration number, contact info
- Data stored in `hospitals_master` table

### Hospital Verification
- Admin reviews submitted documents
- Verification logs stored in `hospital_verification_logs`
- Status progression: PENDING → UNDER_REVIEW → VERIFIED / REJECTED
- Admin dashboard shows verification queue

### Doctor Credential Upload
- Doctors linked to hospitals via `doctor_hospital_affiliations`
- Identity documents stored in `doctor_identity_docs`
- Credential verification by hospital admin

### Department Setup
- Hospital configures available departments/specialities
- Maps doctors to departments
- Sets up service catalog via `hospital_services`
- Facility listing via `hospital_facilities`

### Billing Configuration
- Commission rates configured per hospital
- Payment gateway integration
- Invoice generation for OPD/IPD

## Onboarding Checklist
```
1. Hospital registration submitted
2. Documents uploaded and verified
3. Departments configured
4. Doctors affiliated and credentialed
5. Billing/commission setup complete
6. RLS policies applied for data isolation
7. Hospital goes live on platform
```

## Related Files
- `app/admin/dashboard/hospitals/` — Admin hospital management
- `prisma/schema.prisma` — Hospital, HospitalFacility, HospitalService models
- `haspataal-in/` — Provider portal for hospital self-service
