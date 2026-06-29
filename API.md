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

## Future API Endpoints

### Planned
- GET /api/doctors/search - Search with filters
- GET /api/doctors/{id}/availability - Real-time availability
- POST /api/appointments - Appointment booking
- GET /api/patients/{id}/timeline - Clinical timeline
- POST /api/notifications - Send notifications
- GET /api/analytics/dashboard - Analytics data