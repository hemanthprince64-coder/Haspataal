# Doctor Portal

## Overview
Doctor workspace providing registration, qualifications, verification, affiliations, schedules, leave management, availability, consultation workflow, EMR, prescriptions, investigations, clinical timeline, follow-ups, care journey, AI assistant, analytics, and reviews.

## Doctor Registration

### Platform Identity
- **Mobile OTP**: 6-digit code sent via SMS
- **Email Verification**: Optional secondary verification
- **Initial Status**: DRAFT after OTP verification

### Registration Flow
```
Mobile OTP → Basic Info → Education → Registration → Documents → Verification → Profile Complete → Hospital Invite
```

### Information Collection
- **Personal**: Full name, gender, DOB, photo, languages, bio
- **Qualifications**: MBBS, PG, Super-specialty, Diploma, Fellowship
- **Registration**: Medical council number, validity, degree
- **Professional Experience**: Hospitals, designations, departments, dates

## Qualifications

### Education Records
- **UG**: MBBS, degree, college, year, registration number
- **PG**: MD/MS, specialty, college, year
- **Super-specialty**: DM/MCh/DNB SS/FNB, super-specialty, college
- **Diplomas**: DCH, DNB, etc.
- **Fellowships**: International/National fellowships

### Management
- CRUD operations for education records
- Document upload for each qualification
- Verification status per record

## Verification

### Status Flow
```
PENDING → DOCUMENT_PENDING → UNDER_VERIFICATION → VERIFIED / REJECTED
```

### Document Types
- MBBS Certificate
- PG Certificate
- Super-specialty Certificate
- Medical Registration
- Government ID (Aadhaar/PAN)
- Experience Letters
- Profile Photo

### Verification Workflow
- **Document Review**: Admin examines uploaded documents
- **Credential Check**: Verify against medical council databases
- **Status Updates**: Real-time status changes with notifications
- **Rejection Handling**: Reason provided, re-upload allowed

## Affiliations

### Hospital Invitation
- **Invitation**: Hospital sends affiliation request
- **Acceptance**: Doctor accepts request
- **Confirmation**: Hospital confirms affiliation
- **Active Status**: Ready for patient consultations

### Affiliation Status Flow
```
INVITED → PENDING → ACCEPTED → ACTIVE → ON_LEAVE → TERMINATED
```

### Per-Hospital Configuration
- Department assignment
- Designation
- Consultation fee
- Working hours
- Teleconsultation availability
- Role permissions

## Schedules

### OPD Schedule
- **Weekly Template**: Monday-Sunday with time slots
- **Session Types**: Morning, evening, night shifts
- **Slot Duration**: Configurable per hospital
- **Capacity**: Max patients per slot
- **Breaks**: Lunch, tea breaks

### Schedule Management
- Recurring weekly patterns
- Holiday overrides
- Emergency scheduling
- Leave auto-blocking

### Schedule API
- `GET /doctors/me/schedule` - Get personal schedule
- `POST /doctors/schedule` - Create/update schedule
- `PATCH /doctors/schedule/{day}` - Modify specific day

## Leave Management

### Leave Types
- Vacation (Annual)
- Conference/Workshop
- Emergency/Medical Leave
- Sabbatical
- Other

### Leave Creation
- Start/end dates
- Reason/Notes
- Visibility (public/internal)
- Recurring patterns
- Approval required

### Auto-Operations
- Slots hidden during leave period
- Booking blocked
- Alternative doctor suggestions
- Patient notifications for affected appointments

## Availability

## Availability Status
- **Available**: Has open slots
- **Limited Slots**: Few slots remaining
- **Fully Booked**: No available slots
- **On Leave**: Leave active
- **Offline**: Not seeing patients
- **Emergency Only**: Critical cases only

### Availability Computation
- Weekly schedule +
- Holiday calendar - +
- Active leave - +
- Existing bookings - +
- Slot capacity =

### Real-time Updates
- WebSocket updates for schedule changes
- Cache invalidation
- Patient portal sync

### Discovery Publishing
Doctor automatically publishes to search index when ALL conditions met:
- Verification status: VERIFIED
- Profile complete: 100% (speciality, experience, registration)
- Affiliation status: ACTIVE
- Hospital status: ACTIVE

If any condition fails, doctor is hidden from patient search.

### Discovery Dashboard
- View public profile as patients see it
- Edit visible qualifications
- Manage consultation fees
- View search analytics
- Track profile completeness

### Real-time Updates
- WebSocket updates for schedule changes
- Cache invalidation
- Patient portal sync

## Consultation Workflow

### OPD Consultation
1. **Patient Select**: Choose from queue/appointments
2. **Vitals Record**: Record height, weight, BP, pulse, SpO2
3. **Chief Complaint**: Record primary issues
4. **History**: HPI, PMH, family, drug, allergy
5. **Examination**: System-wise findings
6. **Diagnosis**: ICD-10 codes
7. **Orders**: Lab, radiology, prescriptions
8. **Follow-up**: Set review date

### Teleconsultation
- Video call integration
- Same EMR workflow
- Digital prescription
- Remote monitoring

## EMR

### Clinical Documentation
- **Vitals**: Height, weight, BP, pulse, SpO2, temperature, BMI
- **Chief Complaints**: Multiple, severity, duration, priority
- **History**: HPI, past, family, drug, allergy, immunization, social
- **Examination**: General, systemic, pediatric, obstetric, neuro
- **Diagnosis**: Primary/secondary, ICD-10, differential
- **Investigations**: Lab orders, radiology orders
- **Prescriptions**: Drug, dose, route, frequency, duration
- **Treatments**: IV, nebulization, vaccination, procedures

### Progress Notes
- Visit notes
- Nurse notes
- Procedure notes
- Consultation summaries

## Prescriptions

### Prescription Writing
- Medicine search with brand/generic
- Dosage calculator (age/weight based)
- Drug interaction warnings (CDS)
- Allergy alerts
- Pregnancy contraindication checks

### Prescription Items
- Drug name, strength, form
- Dosage, route, frequency, duration
- Instructions, PRN flags
- Quantity, refills

### Integration
- Pharmacy stock check
- Pricing from hospital master
- Dispense workflow

## Investigations

### Lab Orders
- Test selection from catalog
- Price preview
- Priority (routine/stat)
- Clinical notes

### Radiology Orders
- Modality selection
- Contrast requirements
- Clinical indication

### Order Tracking
- Status: Ordered → Collected → Processed → Verified → Ready
- Result upload
- Notification to doctor

## Clinical Timeline

### Event Types
- Appointment Booked
- Vitals Recorded
- Consultation Started/Completed
- Prescription Created
- Lab Order Placed/Result Ready
- Radiology Order Placed/Report Ready
- Billing Events
- Follow-up Scheduled

### Timeline Features
- Chronological view
- Filter by event type
- Export capability
- Share with patient

## Follow-ups

### Follow-up Types
- **Review Visit**: Clinical review
- **Lab Review**: Lab result discussion
- **Procedure Follow-up**: Post-procedure check
- **Investigation Follow-up**: Test result review
- **Medication Review**: Drug efficacy/safety

### Follow-up Management
- Automatic scheduling based on conditions
- Retention rule integration
- Escalation on missed follow-ups
- Patient notifications

## Care Journey

### Care Journey Status
- **Active**: Ongoing care plan
- **Completed**: Treatment finished
- **On Hold**: Temporarily paused

### Components
- Recovery steps with daily guidance
- Medication plans
- Engagement logs (reminders, check-ins)
- Red flags monitoring
- Nudges schedule

## AI Assistant

### Doctor AI Features
- **SOAP Drafting**: Auto-generate consultation notes
- **ICD-10 Suggestions**: Based on clinical notes
- **Drug Suggestions**: Based on diagnosis
- **Interaction Checks**: Drug-drug, drug-allergy
- **Dosage Guardrails**: Age/weight-based limits
- **Clinical Summarization**: Visit/discharge summaries

### AI Safety
- All outputs marked as recommendations
- Doctor verification required
- Audit trail for all AI interactions
- Hallucination monitoring

## Doctor Analytics

### Consultation Metrics
- Daily/monthly consultations
- Revenue generated
- Prescriptions issued
- Lab orders placed
- Patient retention rate

### Performance
- Average consultation time
- Follow-up completion rate
- Patient satisfaction scores
- Review ratings

### Comparative Analytics
- Department ranking
- Specialty comparison
- Time-based trends

## Reviews

### Collected Reviews
- Patient ratings (1-5 stars)
- Comments
- Anonymous option

### Review Management
- Response capability (internal/public)
- Flag inappropriate content
- Review analytics

## Future Doctor Features

### Q3 2026
- Mobile app native features
- Voice-to-text for EMR
- AI-powered differential diagnosis
- Peer consultation network

### Q4 2026
- Telemedicine enhancement
- Second opinion workflows
- Publication management
- Conference management
- Research collaboration