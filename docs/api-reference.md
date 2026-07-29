# API Documentation

## Overview
Complete API inventory for Haspataal platform with request/response schemas, authentication, authorization, validation, and error handling.

## Authentication

### POST /api/auth/login
**Request:**
```json
{
  "mobile": "9999999999",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "mobile": "9999999999",
    "role": "DOCTOR|PATIENT|STAFF|HOSPITAL_ADMIN"
  }
}
```

### POST /api/auth/send-otp
**Request:**
```json
{
  "mobile": "9999999999"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent"
}
```

### POST /api/auth/verify-otp
**Request:**
```json
{
  "mobile": "9999999999",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "userId": "uuid"
}
```

## Doctor APIs

### GET /api/doctors
**Purpose:** List doctors (filtered by hospital)

**Query Parameters:**
- `hospitalId` (optional): Filter by hospital affiliation

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fullName": "Dr. John Doe",
      "mobile": "9999999999",
      "email": "john@example.com",
      "kycStatus": "PENDING|VERIFIED|REJECTED",
      "profile": {
        "speciality": "Cardiology",
        "experienceYears": 10,
        "gender": "Male"
      },
      "verification": {
        "status": "DOCUMENT_PENDING"
      },
      "affiliations": [
        {
          "hospital": {
            "id": "uuid",
            "legalName": "Hospital Name"
          },
          "department": "Cardiology",
          "consultationFee": 500
        }
      ]
    }
  ]
}
```

### POST /api/doctors (action: send_otp)
**Purpose:** Initiate doctor registration

### POST /api/doctors (action: verify_otp)
**Purpose:** Complete doctor registration after OTP verification

**Request:**
```json
{
  "action": "verify_otp",
  "mobile": "9999999999",
  "otp": "123456",
  "fullName": "Dr. John Doe",
  "email": "john@example.com",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "doctorId": "uuid",
  "verificationStatus": "DOCUMENT_PENDING"
}
```

### POST /api/doctors (action: update_profile)
**Purpose:** Update doctor profile information

**Request:**
```json
{
  "action": "update_profile",
  "doctorId": "uuid",
  "fullName": "Dr. John Doe",
  "dob": "1980-01-01",
  "gender": "Male"
}
```

### GET /api/doctors/verification
**Purpose:** Get doctor verification status

**Query Parameters:**
- `doctorId` (required): Doctor ID

**Response:**
```json
{
  "success": true,
  "status": "PENDING|DOCUMENT_PENDING|UNDER_VERIFICATION|VERIFIED|REJECTED",
  "isComplete": true,
  "documentsPending": 0,
  "hasProfile": true,
  "hasEducation": true,
  "hasRegistration": true
}
```

### PUT /api/doctors/verification
**Purpose:** Update verification status (Admin only)

**Request:**
```json
{
  "doctorId": "uuid",
  "status": "VERIFIED|REJECTED",
  "notes": "string",
  "verifiedBy": "admin_uuid"
}
```

### GET /api/doctors/education
**Purpose:** Get doctor education records

**Query Parameters:**
- `doctorId` (required): Doctor ID

**Response:**
```json
{
  "success": true,
  "education": [
    {
      "id": "uuid",
      "doctorId": "uuid",
      "degreeType": "MBBS|MD|MS|DM|MCh|DNB",
      "degreeName": "Medicine",
      "collegeName": "AIIMS Delhi",
      "year": 2010,
      "registrationNumber": "12345"
    }
  ]
}
```

### POST /api/doctors/education
**Purpose:** Create education record

**Request:**
```json
{
  "doctorId": "uuid",
  "degreeType": "MD",
  "degreeName": "Medicine",
  "collegeName": "AIIMS Delhi",
  "year": 2015,
  "registrationNumber": "12345"
}
```

### GET /api/doctors/certifications
**Purpose:** Get doctor certifications

**Response:**
```json
{
  "success": true,
  "certifications": [
    {
      "id": "uuid",
      "doctorId": "uuid",
      "courseName": "Advanced Cardiac Life Support",
      "authority": "American Heart Association",
      "certificateNo": "ACLS-12345",
      "expiryDate": "2025-12-31"
    }
  ]
}
```

### POST /api/doctors/certifications
**Purpose:** Add certification

### GET /api/doctors/search
**Purpose:** Search doctors with filters

**Query Parameters:**
- `query` (optional): Name or specialty search
- `specialty` (optional): Filter by specialty
- `city` (optional): Filter by city
- `department` (optional): Filter by department
- `availableToday` (optional): Filter available today
- `teleconsultation` (optional): Filter teleconsultation
- `minRating` (optional): Minimum rating (1-5)
- `maxFee` (optional): Maximum consultation fee
- `limit` (optional): Page size (default: 20)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fullName": "Dr. John Doe",
      "specialties": ["Cardiology"],
      "avgRating": 4.5,
      "reviewCount": 120,
      "experienceYears": 10,
      "city": "Mumbai",
      "state": "Maharashtra"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0
  }
}
```

### GET /api/doctors/availability
**Purpose:** Get doctor availability for specific date

**Query Parameters:**
- `doctorId` (required): Doctor ID
- `hospitalId` (required): Hospital ID
- `date` (optional): Date in YYYY-MM-DD format (default: today)

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "Available|Limited|Full|Leave|Holiday",
    "availableSlots": 10,
    "bookableSlots": 8,
    "slotDetails": {}
  }
}
```

### GET /api/doctors/{id}/public
**Purpose:** Get doctor public profile

**Response:**
```json
{
  "success": true,
  "profile": {
    "fullName": "Dr. John Doe",
    "qualifications": ["MBBS", "MD"],
    "specialties": ["Cardiology"],
    "yearsExperience": 10,
    "languages": ["English", "Hindi"],
    "verificationStatus": "VERIFIED"
  }
}
```

**Request:**
```json
{
  "doctorId": "uuid",
  "courseName": "ACLS",
  "authority": "AHA",
  "certificateNo": "12345",
  "expiryDate": "2025-12-31"
}
```

### POST /api/doctors/documents
**Purpose:** Upload doctor identity documents

**Request:** Multipart form data
- `doctorId` (required): Doctor ID
- `documentType` (required): MBBS_CERT|PG_CERT|REGISTRATION|GOVT_ID|EXPERIENCE|PHOTO
- `file` (required): File upload (PDF, JPEG, PNG)

**Response:**
```json
{
  "success": true,
  "document": {
    "id": "uuid",
    "doctorId": "uuid",
    "documentType": "MBBS_CERT",
    "documentUrl": "url",
    "verificationStatus": "PENDING"
  }
}
```

## Patient APIs

### GET /api/patients
**Purpose:** List patients (Hospital staff only)

**Authorization:** ADMIN, DOCTOR, RECEPTIONIST roles

### POST /api/patients
**Purpose:** Register patient

**Request:**
```json
{
  "action": "register",
  "mobile": "9999999999",
  "name": "John Doe",
  "dob": "1990-01-01",
  "gender": "Male",
  "abhaId": "abha@example.com",
  "consents": ["APPOINTMENT_BOOKING", "HEALTH_RECORDS", "MARKETING"],
  "hospitalId": "optional_hospital_id"
}
```

**Response:**
```json
{
  "success": true,
  "patient": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "9999999999",
    "abhaAddress": "abha@example.com"
  }
}
```

## Hospital APIs

### POST /api/hospital/doctors/invite
**Purpose:** Invite doctor to hospital

**Authorization:** ADMIN role only

**Request:**
```json
{
  "doctorId": "uuid",
  "hospitalId": "optional",
  "role": "DOCTOR|CONSULTANT|SURGEON",
  "department": "Cardiology",
  "consultationFee": 500
}
```

### GET /api/hospital/doctors/invite
**Purpose:** Get doctor invitations

**Query Parameters:**
- `doctorId` (required): Filter invitations

## Authentication & Authorization

### JWT Token Claims
```json
{
  "id": "user_uuid",
  "mobile": "9999999999",
  "role": "DOCTOR|PATIENT|STAFF|HOSPITAL_ADMIN|PLATFORM_ADMIN",
  "hospitalId": "optional_hospital_uuid",
  "exp": 1234567890
}
```

### Role-Based Access
| Role | Access Level |
|------|-------------|
| DOCTOR | Own patients, own schedules, own prescriptions |
| PATIENT | Own records, own appointments |
| STAFF | Hospital-scoped operations |
| HOSPITAL_ADMIN | Full hospital operations |
| PLATFORM_ADMIN | System-wide access |

## Validation Rules

### Mobile
- Format: `^[6-9]\d{9}$` (Indian mobile format)
- Required for all registration flows

### Document Upload
- Max size: 10MB
- Allowed types: application/pdf, image/jpeg, image/png
- Virus scanning stub for production

### OTP
- 6-digit numeric code
- 5-minute expiry
- Rate limited (3 attempts per mobile)

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### Common Status Codes
- 400: Invalid request/validation error
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Resource not found
- 429: Rate limit exceeded
- 500: Internal server error

## Rate Limits

### Endpoints
| Endpoint | Limit |
|----------|-------|
| POST /api/auth/send-otp | 3/minute per IP |
| POST /api/auth/verify-otp | 10/minute per IP |
| POST /api/doctors/send_otp | 3/minute per IP |
| GET /api/doctors | 100/hour per hospital |
| File Upload | 10MB max, 10/hour per user |

## Pagination

### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

### Response Format
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Versioning Strategy

### API Versioning
- URL-based: `/api/v1/doctors` (future)
- Current: No version prefix
- Breaking changes: New version required

## Deprecation Strategy

### Response Headers
- `Warning`: Deprecation notice
- `Sunset`: Sunset date in ISO format

### Deprecation Process
1. 3-month notice period
2. Alert in response headers
3. Migration guide provided
4. Gradual removal

## Implemented Phase 3 Operations APIs

### Ward Management

#### GET /api/ward
Purpose: Get bed dashboard with occupancy metrics for hospital staff.

Authorization: ADMIN, DOCTOR, RECEPTIONIST, NURSE roles

Response:
```json
{
  "beds": [
    { "id": "uuid", "bed_number": "101", "status": "OCCUPIED", "type": "GENERAL" }
  ],
  "metrics": {
    "totalBeds": 50,
    "occupiedBeds": 35,
    "availableBeds": 10,
    "cleaningBeds": 3,
    "maintenanceBeds": 2,
    "occupancyRate": 70
  }
}
```

#### PATCH /api/ward/{bedId}
Purpose: Update bed status (cleaning, maintenance, etc.)

Authorization: ADMIN, RECEPTIONIST, NURSE roles

Request:
```json
{
  "status": "Available|Occupied|Cleaning|Under_Maintenance|Reserved"
}
```

### Nursing

#### GET /api/nursing
Purpose: Fetch nursing notes for an admission

Authorization: ADMIN, DOCTOR, NURSE roles

Query Parameters:
- admissionId (required): Filter by admission

Response:
```json
{
  "data": [
    { "id": "uuid", "nurse_id": "staff_uuid", "note": "Stabilized", "shift": "MORNING", "created_at": "ISO" }
  ]
}
```

#### POST /api/nursing
Purpose: Add clinical nursing note

Authorization: NURSE role

Request:
```json
{
  "hospitalId": "hospital_uuid",
  "admissionId": "admission_uuid",
  "nurseId": "staff_uuid",
  "note": "Patient stable, BP 120/80"
}
```

#### POST /api/nursing/mar
Purpose: Schedule medication administration record

Authorization: NURSE role

Request:
```json
{
  "hospitalId": "hospital_uuid",
  "admissionId": "admission_uuid",
  "medicationName": "Paracetamol",
  "dosage": "500mg",
  "route": "ORAL",
  "scheduledTime": "2026-06-30T08:00:00"
}
```

### Operation Theatre

#### GET /api/ot
Purpose: List OT schedules

Authorization: ADMIN, DOCTOR, SURGEON roles

Query Parameters:
- date (optional): Filter by date
- status (optional): Filter by status

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "procedure_name": "Appendectomy",
      "patient_id": "patient_uuid",
      "surgeon_id": "doctor_uuid",
      "theatre_name": "OT-1",
      "scheduled_at": "ISO",
      "status": "SCHEDULED",
      "who_checklist": {}
    }
  ]
}
```

#### POST /api/ot
Purpose: Schedule surgery with WHO safety checklist

Authorization: ADMIN, DOCTOR, SURGEON roles

Request:
```json
{
  "hospitalId": "hospital_uuid",
  "patientId": "patient_uuid",
  "procedureName": "Appendectomy",
  "surgeonId": "doctor_uuid",
  "theatreName": "OT-1",
  "scheduledAt": "2026-06-30T09:00:00",
  "whoChecklist": { "anesthesia": true, "sterility": true }
}
```

### ICU Management

#### POST /api/icu
Purpose: Admit patient to ICU

Authorization: ADMIN, DOCTOR, NURSE roles

Request:
```json
{
  "hospitalId": "hospital_uuid",
  "admissionId": "admission_uuid",
  "bedId": "bed_uuid",
  "scores": { "apache": 15, "prism": 5 },
  "ventilatorMode": "CMV"
}
```

#### PATCH /api/icu/{id}
Purpose: Update ICU vitals and infusion data

Authorization: ADMIN, DOCTOR, NURSE roles

Request:
```json
{
  "peep": 5,
  "fio2": 0.4,
  "infusions": [
    { "medication": "Dopamine", "rate": "5ml/hr" }
  ]
}
```

### Billing

#### POST /api/billing
Purpose: Create dynamic invoice with line items

Authorization: ADMIN, BILLING roles

Request:
```json
{
  "hospitalId": "hospital_uuid",
  "patientId": "patient_uuid",
  "items": [
    { "serviceName": "Consultation", "quantity": 1, "unitPrice": 500 }
  ],
  "discountPercent": 10
}
```

Response:
```json
{
  "id": "uuid",
  "invoice_number": "INV-123",
  "subtotal": 500,
  "gst_total": 50,
  "total_amount": 550,
  "status": "DRAFT"
}
```

#### POST /api/billing/refund
Purpose: Process refund for invoice

Authorization: ADMIN, BILLING roles

Request:
```json
{
  "invoiceId": "uuid",
  "amount": 100,
  "reason": "Overcharged"
}
```

### Insurance

#### POST /api/insurance
Purpose: Verify insurance eligibility and pre-auth

Authorization: ADMIN, RECEPTIONIST, BILLING roles

Request:
```json
{
  "hospitalId": "hospital_uuid",
  "patientId": "patient_uuid",
  "policyNumber": "POL-123",
  "insurerName": "Star Health"
}
```

Response:
```json
{
  "id": "uuid",
  "status": "APPROVED",
  "pre_auth_amount": 50000
}
```

#### POST /api/insurance/claim
Purpose: Submit claim for invoice

Authorization: ADMIN, BILLING roles

Request:
```json
{
  "hospitalId": "hospital_uuid",
  "patientId": "patient_uuid",
  "invoiceId": "uuid",
  "claimAmount": 15000
}
```

### Patient Records (EMR)

#### GET /api/records/{patientId}
Purpose: Get longitudinal EMR timeline

Authorization: ADMIN, DOCTOR, PATIENT (own records)

Response:
```json
[
  {
    "type": "ADMISSION",
    "timestamp": "2026-06-01",
    "title": "Admitted for fever",
    "details": { "admission_number": "ADM-123" }
  }
]
```

### Discharge

#### POST /api/discharge/{admissionId}/summary
Purpose: Generate discharge summary

Authorization: ADMIN, DOCTOR, NURSE roles

Request:
```json
{
  "admissionId": "admission_uuid",
  "dischargeSummary": "Patient recovered and discharged",
  "followUpDays": 7
}
```

Response:
```json
{
  "admissionNumber": "ADM-123",
  "patientDetails": { "name": "John Doe" },
  "nursingNotes": [],
  "mars": [],
  "followUpDate": "2026-07-07"
}
```

# Haspataal API Reference

Generated: 2026-07-15T13:42:05.422Z

## Endpoints

- DELETE apps/hospital-hms/app/api/timeline/bookmarks/[id]/route.ts
- DELETE apps/patient-portal/app/api/hospital/billing/copay/[id]/route.ts
- GET apps/hospital-hms/app/api/admin/timeline/analytics/route.ts
- GET apps/hospital-hms/app/api/appointments/pending/route.ts
- GET apps/hospital-hms/app/api/debug/health/route.ts
- GET apps/hospital-hms/app/api/diagnostics/route.ts
- GET apps/hospital-hms/app/api/doctors/availability/route.ts
- GET apps/hospital-hms/app/api/doctors/public/route.ts
- GET apps/hospital-hms/app/api/doctors/search/route.ts
- GET apps/hospital-hms/app/api/hospital/dashboard-test/route.ts
- GET apps/hospital-hms/app/api/notifications/analytics/route.ts
- GET apps/hospital-hms/app/api/notifications/metrics/route.ts
- GET apps/hospital-hms/app/api/patient/route.ts
- GET apps/hospital-hms/app/api/records/route.js
- GET apps/hospital-hms/app/api/records/route.ts
- GET apps/hospital-hms/app/api/timeline/doctor/[patientId]/route.ts
- GET apps/hospital-hms/app/api/timeline/events/[id]/verify/route.ts
- GET apps/hospital-hms/app/api/timeline/export/[jobId]/route.ts
- GET apps/hospital-hms/app/api/timeline/hospital/[patientId]/route.ts
- GET apps/hospital-hms/app/api/timeline/patient/[patientId]/route.ts
- GET apps/hospital-hms/app/api/timeline/search/route.ts
- GET apps/patient-portal/app/api/health/route.ts
- GET apps/patient-portal/app/api/hospital/diagnostics/orders/[id]/route.ts
- GET apps/patient-portal/app/api/hospital/insurance/route.ts
- GET apps/patient-portal/app/api/hospital/ipd/beds/route.ts
- GET apps/patient-portal/app/api/hospital/setup/completion/route.ts
- GET apps/patient-portal/app/api/hospitals/[hospitalId]/analytics/revenue/route.ts
- GET apps/patient-portal/app/api/hospitals/[hospitalId]/dashboard/metrics/route.ts
- GET apps/patient-portal/app/api/hospitals/[hospitalId]/events/route.ts
- GET apps/patient-portal/app/api/hospitals/[hospitalId]/followups/route.ts
- GET apps/patient-portal/app/api/hospitals/[hospitalId]/notifications/today/route.ts
- GET apps/patient-portal/app/api/hospitals/[hospitalId]/retention/kpi/route.ts
- GET apps/patient-portal/app/api/marketplace/doctors/route.ts
- GET apps/patient-portal/app/api/marketplace/hospitals/route.ts
- GET apps/patient-portal/app/api/patient/records/route.ts
- GET apps/patient-portal/app/api/patient/slots/route.ts
- GET, DELETE apps/patient-portal/app/api/hospital/setup/staff/route.ts
- GET, DELETE apps/patient-portal/app/api/hospital/staff/invites/route.ts
- GET, PATCH apps/hospital-hms/app/api/doctor/queue/route.ts
- GET, PATCH apps/hospital-hms/app/api/ward/route.ts
- GET, POST apps/hospital-hms/app/api/admin/applications/route.ts
- GET, POST apps/hospital-hms/app/api/clinical/complaints/route.ts
- GET, POST apps/hospital-hms/app/api/clinical/prescriptions/route.ts
- GET, POST apps/hospital-hms/app/api/clinical/vitals/route.ts
- GET, POST apps/hospital-hms/app/api/discharge/route.ts
- GET, POST apps/hospital-hms/app/api/doctors/certifications/route.ts
- GET, POST apps/hospital-hms/app/api/doctors/documents/route.ts
- GET, POST apps/hospital-hms/app/api/doctors/route.ts
- GET, POST apps/hospital-hms/app/api/hospital/doctors/invite/route.ts
- GET, POST apps/hospital-hms/app/api/hospital/settings/route.ts
- GET, POST apps/hospital-hms/app/api/icu/route.ts
- GET, POST apps/hospital-hms/app/api/ipd/admissions/route.ts
- GET, POST apps/hospital-hms/app/api/journeys/route.ts
- GET, POST apps/hospital-hms/app/api/lab/orders/route.ts
- GET, POST apps/hospital-hms/app/api/notifications/campaigns/route.ts
- GET, POST apps/hospital-hms/app/api/notifications/route.ts
- GET, POST apps/hospital-hms/app/api/notifications/templates/route.ts
- GET, POST apps/hospital-hms/app/api/patients/route.ts
- GET, POST apps/hospital-hms/app/api/pharmacy/route.ts
- GET, POST apps/hospital-hms/app/api/rules/route.ts
- GET, POST apps/hospital-hms/app/api/search/route.ts
- GET, POST apps/hospital-hms/app/api/timeline/bookmarks/route.ts
- GET, POST apps/hospital-hms/app/api/visits/route.ts
- GET, POST apps/patient-portal/app/api/hospital/anc/export/route.ts
- GET, POST apps/patient-portal/app/api/hospital/anc/profile/route.ts
- GET, POST apps/patient-portal/app/api/hospital/anc/visit/route.ts
- GET, POST apps/patient-portal/app/api/hospital/billing/copay/route.ts
- GET, POST apps/patient-portal/app/api/hospital/billing/gateways/route.ts
- GET, POST apps/patient-portal/app/api/hospital/billing/invoices/route.ts
- GET, POST apps/patient-portal/app/api/hospital/billing/packages/route.ts
- GET, POST apps/patient-portal/app/api/hospital/billing/services/route.ts
- GET, POST apps/patient-portal/app/api/hospital/branches/route.ts
- GET, POST apps/patient-portal/app/api/hospital/departments/route.ts
- GET, POST apps/patient-portal/app/api/hospital/diagnostics/orders/[id]/documents/route.ts
- GET, POST apps/patient-portal/app/api/hospital/diagnostics/orders/route.ts
- GET, POST apps/patient-portal/app/api/hospital/diagnostics/pricing/route.ts
- GET, POST apps/patient-portal/app/api/hospital/doctors/route.ts
- GET, POST apps/patient-portal/app/api/hospital/integrations/route.ts
- GET, POST apps/patient-portal/app/api/hospital/ipd/admissions/route.ts
- GET, POST apps/patient-portal/app/api/hospital/notifications/templates/route.ts
- GET, POST apps/patient-portal/app/api/hospital/opd/appointments/route.ts
- GET, POST apps/patient-portal/app/api/hospital/opd/queue/route.ts
- GET, POST apps/patient-portal/app/api/hospital/pharmacy/dispense/route.ts
- GET, POST apps/patient-portal/app/api/hospital/pharmacy/stock/route.ts
- GET, POST apps/patient-portal/app/api/hospital/pharmacy/suppliers/route.ts
- GET, POST apps/patient-portal/app/api/hospital/retention/rules/route.ts
- GET, POST apps/patient-portal/app/api/hospital/setup/stage/route.ts
- GET, POST apps/patient-portal/app/api/hospital/setup/workflow/route.ts
- GET, POST apps/patient-portal/app/api/hospital/staff/route.ts
- GET, POST apps/patient-portal/app/api/hospital/wards/beds/route.ts
- GET, POST apps/patient-portal/app/api/patient/lab-orders/route.ts
- GET, POST apps/patient-portal/app/api/patient/reviews/route.ts
- GET, POST, DELETE apps/patient-portal/app/api/hospital/notifications/mappings/route.ts
- GET, POST, PATCH apps/hospital-hms/app/api/diagnostics/orders/route.ts
- GET, POST, PATCH apps/hospital-hms/app/api/nursing/route.ts
- GET, POST, PATCH apps/hospital-hms/app/api/ot/route.ts
- GET, POST, PATCH apps/hospital-hms/app/api/ward/beds/route.ts
- GET, POST, PATCH apps/patient-portal/app/api/hospital/followups/route.ts
- GET, POST, PUT apps/hospital-hms/app/api/doctors/education/route.ts
- GET, POST, PUT apps/patient-portal/app/api/hospital/notifications/route.ts
- GET, POST, PUT, DELETE apps/patient-portal/app/api/hospital/roles-permissions/route.ts
- GET, PUT apps/hospital-hms/app/api/doctors/verification/route.ts
- GET, PUT apps/patient-portal/app/api/hospital/billing/packages/[id]/services/route.ts
- GET, PUT apps/patient-portal/app/api/hospital/billing/profile/route.ts
- GET, PUT apps/patient-portal/app/api/hospital/identity/route.ts
- GET, PUT apps/patient-portal/app/api/hospital/marketplace/route.ts
- GET, PUT apps/patient-portal/app/api/hospital/opd-config/route.ts
- GET, PUT apps/patient-portal/app/api/hospital/setup/marketplace/route.ts
- GET, PUT apps/patient-portal/app/api/hospital/staff/permissions/route.ts
- PATCH apps/hospital-hms/app/api/appointments/confirmation/route.ts
- PATCH apps/hospital-hms/app/api/ipd/admissions/[id]/route.ts
- PATCH apps/hospital-hms/app/api/lab/samples/route.ts
- PATCH apps/hospital-hms/app/api/timeline/events/[id]/pin/route.ts
- PATCH apps/patient-portal/app/api/hospital/diagnostics/documents/[documentId]/route.ts
- POST apps/hospital-hms/app/api/admin/applications/approve/route.ts
- POST apps/hospital-hms/app/api/billing/route.ts
- POST apps/hospital-hms/app/api/hospital/auth/login/route.ts
- POST apps/hospital-hms/app/api/hospital/auth/register/route.ts
- POST apps/hospital-hms/app/api/ipd/admissions/[id]/abscond/route.ts
- POST apps/hospital-hms/app/api/ipd/admissions/[id]/departure/route.ts
- POST apps/hospital-hms/app/api/ipd/admissions/[id]/discharge/route.ts
- POST apps/hospital-hms/app/api/ipd/admissions/[id]/lama/route.ts
- POST apps/hospital-hms/app/api/payments/create-order/route.js
- POST apps/hospital-hms/app/api/payments/verify/route.js
- POST apps/hospital-hms/app/api/rules/execute/route.ts
- POST apps/hospital-hms/app/api/timeline/export/route.ts
- POST apps/hospital-hms/app/api/upload/route.js
- POST apps/hospital-hms/app/api/webhooks/razorpay/route.ts
- POST apps/patient-portal/app/api/ai/process-visit/route.ts
- POST apps/patient-portal/app/api/hospital/anc/referral/route.ts
- POST apps/patient-portal/app/api/hospital/asha/visit-log/route.ts
- POST apps/patient-portal/app/api/hospital/billing/appointments/route.ts
- POST apps/patient-portal/app/api/hospital/billing/invoices/[id]/finalize/route.ts
- POST apps/patient-portal/app/api/hospital/billing/invoices/[id]/pay/route.ts
- POST apps/patient-portal/app/api/hospital/billing/procedure/route.ts
- POST apps/patient-portal/app/api/hospital/billing/radiology/route.ts
- POST apps/patient-portal/app/api/hospital/billing/test-gateway/route.ts
- POST apps/patient-portal/app/api/hospital/departments/[id]/units/route.ts
- POST apps/patient-portal/app/api/hospital/diagnostics/orders/[id]/results/route.ts
- POST apps/patient-portal/app/api/hospital/ipd/admissions/[id]/discharge/route.ts
- POST apps/patient-portal/app/api/hospital/opd/handoffs/route.ts
- POST apps/patient-portal/app/api/hospital/setup/activate/route.ts
- POST apps/patient-portal/app/api/hospital/staff/invite/route.ts
- POST apps/patient-portal/app/api/hospitals/[hospitalId]/followups/[followupId]/remind/route.ts
- POST apps/patient-portal/app/api/schedule/regenerate/route.ts
- POST apps/patient-portal/app/api/sync/replay/route.ts
- POST apps/patient-portal/app/api/webhooks/payment/route.ts
- POST apps/patient-portal/app/api/webhooks/sms-ussd/route.ts
- POST apps/patient-portal/app/api/webhooks/ussd/route.ts
- POST, PATCH apps/hospital-hms/app/api/insurance/route.ts
- PUT apps/patient-portal/app/api/hospital/departments/[id]/units/reorder/route.ts
- PUT, DELETE apps/patient-portal/app/api/hospital/billing/packages/[id]/route.ts
- PUT, DELETE apps/patient-portal/app/api/hospital/billing/services/[id]/route.ts
- PUT, DELETE apps/patient-portal/app/api/hospital/branches/[id]/route.ts
- PUT, DELETE apps/patient-portal/app/api/hospital/departments/[id]/route.ts
- PUT, DELETE apps/patient-portal/app/api/hospital/staff/[id]/route.ts
- PUT, DELETE apps/patient-portal/app/api/hospital/units/[id]/route.ts
