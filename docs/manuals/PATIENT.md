# Patient Portal

## Overview
Patient-facing portal for registration, authentication, family profiles, medical timeline, appointments, medical records, pregnancy tracking, vaccinations, care journey, retention management, notifications, payments, insurance integration, QR medical card, AI assistant, and future features.

## Registration

### Sign-up Flow
1. **Mobile OTP**: Verify mobile number
2. **Basic Info**: Name, DOB, gender, blood group, pincode
3. **ABHA ID Linking**: Optional national health ID
4. **Consent Capture**: Clinical care, AI assistance, notifications, research, emergency
5. **Welcome**: Profile created, QR card generated

### Registration API
- `POST /patients/register` - Create patient with consent
- `POST /patients/send-otp` - Send registration OTP
- `POST /patients/verify-otp` - Verify OTP and activate

## Authentication

### Login Methods
- Mobile OTP (primary)
- ABHA ID (future)
- Email password (optional)

### Session Management
- JWT tokens with 7-day expiry
- Refresh token mechanism
- Device tracking
- Session revocation

### Security
- MFA for sensitive actions
- Rate limiting on OTP requests
- Suspicious activity alerts

## Family Profiles

### Family Member Management
- Add family members (spouse, children, parents)
- Relationship types: Self, Spouse, Son, Daughter, Father, Mother, Other
- Shared appointments
- Individual medical records
- Dependent consent management

### Access Control
- Primary user manages all family data
- Each member has individual records
- Appointment booking for dependents

## Medical Timeline

### Timeline Events
- Registration created
- OPD visits
- IPD admissions
- Prescriptions issued
- Lab orders/results
- Radiology reports
- Vaccinations
- Pregnancy milestones
- Billing events

### Timeline View
- Chronological display
- Event filtering (appointments, prescriptions, labs, etc.)
- Emergency QR data subset
- Export to PDF

### Offline Access
- QR Medical Card contains emergency timeline subset
- Vital signs, allergies, chronic conditions
- Emergency contact information

## Appointments

### Booking Flow
1. **Search Doctor**: By specialty, hospital, availability, location
2. **Select Slot**: Real-time availability with smart filters
3. **Confirmation**: Smart confirmation (auto/manual)
4. **Reminders**: SMS/WhatsApp before appointment

## Doctor Discovery

### Doctor Search
- **By Name**: Partial name match
- **By Specialty**: Cardiology, Pediatrics, etc.
- **By Disease/Symptoms**: Maps to relevant specialties
- **By Location**: City, pincode, or GPS-based
- **By Availability**: Available today/tomorrow
- **By Fee**: Price range filter
- **By Rating**: Minimum star rating
- **By Mode**: Teleconsultation or in-person

### Search Filters
| Filter | Description |
|--------|-------------|
| Available Today | Doctors with open slots today |
| Available Tomorrow | Doctors with open slots tomorrow |
| Teleconsultation | Only video consultation doctors |
| In-person | Only physical visit doctors |
| Nearest | Sorted by distance |
| Highest Rated | Sorted by average rating |
| Lowest Fee | Sorted by consultation fee |
| Most Experienced | Sorted by experience years |

### Doctor Cards
- Photo, name, qualifications
- Specialty, experience years
- Rating with review count
- Available today status
- Next available slot
- Consultation fee
- Book appointment button

### Hospital Cards (in doctor search)
- Hospital name, logo
- Department, designation
- Consultation fee
- City, state, distance
- Google Maps button
- Verification badge

### Alternative Suggestions
When doctor is unavailable:
1. Same department, same hospital
2. Same department, nearby hospitals
3. Nearby affiliated hospitals
4. Highest-rated alternatives
5. Earliest available slot

### Search API
```
GET /api/doctors/search?query=&specialty=&city=&availableToday=true
GET /api/doctors/availability?doctorId=&hospitalId=&date=
GET /api/doctors/public?doctorId=
```

## Appointment Types
- **OPD Consultation**: Routine outpatient visit
- **Follow-up**: Post-consultation review
- **Emergency**: Walk-in or priority booking
- **Teleconsultation**: Video call appointment

### Booking Features
- Favorite doctors/hospitals
- Recommended alternatives on unavailability
- Slot price preview
- Insurance coverage check

## Medical Records

### Record Types
- **Vital Records**: BP, weight, height, SpO2 history
- **Prescriptions**: Medication history with adherence tracking
- **Lab Reports**: PDF upload with structured data
- **Radiology Reports**: DICOM links, report PDFs
- **Medical History**: Chronic diseases, surgeries, allergies
- **Documents**: Uploaded medical documents

### Document Management
- Upload medical records
- PDF/image preview
- Share with doctors
- Download for offline access

## Pregnancy

### Pregnancy Registration
- LMP (Last Menstrual Period)
- EDD (Estimated Delivery Date)
- USG EDD (Ultrasound verified)
- Gravida, Para, Abortions
- Blood group, Rh factor
- BMI, height

### ANC Tracking
- **ANC Visits**: Scheduled visits with checklist
- **Supplements**: Iron, calcium, vitamin logs
- **Investigations**: Hb, urine, glucose, scans
- **Risk Assessment**: Low/high risk tracking
- **MCP Cards**: Mother and Child Protection cards

### Pregnancy Timeline
- Milestones (1st, 2nd, 3rd trimester)
- Due date countdown
- Risk flags and alerts
- Delivery planning

## Vaccinations

### Vaccination Records
- Childhood immunization (DPT, Polio, Measles, etc.)
- Adult vaccines (Flu, COVID, etc.)
- Pregnancy vaccines (Tetanus, Hepatitis B)
- Due date tracking
- Next dose reminders

### Vaccination Tracking
- Age-appropriate schedule
- Missed dose alerts
- Contraindication checks
- Certificate generation

## Care Journey

### Active Care Plans
- **Conditions**: Diabetes, Hypertension, Pregnancy
- **Recovery Steps**: Daily guidance
- **Medication Plans**: Scheduled medications
- **Monitoring Schedule**: Check-in reminders

### Care Journey Features
- Daily status check-ins
- Symptom logging
- Recovery milestone tracking
- Red flag alerts
- Doctor notifications

### Nudges & Reminders
- Medication reminders
- Appointment reminders
- Investigation follow-ups
- Lab result checks

## Retention

### Retention Rules
- **Pregnancy**: Missed ANC visits
- **Chronic**: Medication refill due
- **Post-op**: Follow-up visits
- **Vaccination**: Due vaccines

### Escalation Flow
- Missed appointment → reminder → escalation → alternative doctor suggestion
- Red flags → immediate doctor notification
- Retention score → engagement priority

## Notifications

### Notification Types
- **Appointment**: Booking confirmation, reminders, completion
- **Prescription**: Ready for collect, refill reminder
- **Lab Report**: Ready for view
- **Follow-up**: Due date reminder
- **Pregnancy**: Milestone, investigation, visit reminders
- **Medication**: Adherence reminders
- **Vaccination**: Due date alerts
- **Retention**: Missed follow-up, health check reminders

### Channels
- SMS (primary)
- WhatsApp (secondary)
- Email (optional)
- In-app notifications

## Payments

### Payment Methods
- UPI
- Credit/Debit Card
- Net Banking
- Insurance
- Wallet (prepaid balance)

### Billing Flow
1. **Invoice Generation**: After consultation
2. **Payment Request**: Link or QR
3. **Collection**: Online or at counter
4. **Confirmation**: Receipt generation

### Wallet Management
- Prepaid balance
- Transaction history
- Auto-debit for regular visits

## Insurance

### Insurance Details
- Insurance company
- Policy number
- Validity period
- Coverage limits

### Insurance Workflow
- Eligibility check at booking
- Claim generation
- TPA panel integration
- Coverage preview

## QR Medical Card

### Card Features
- **Emergency Data**: Blood group, allergies, chronic conditions
- **Contact**: Emergency contact
- **Medical History**: Key conditions, medications
- **Vaccinations**: Critical vaccine dates
- **Pregnancy**: Current pregnancy status (if applicable)

### QR Generation
- Dynamic QR with latest emergency data
- Static fallback for offline access
- Hospital kiosk scanning
- Emergency responder access

## AI Assistant

### Patient AI Features
- **Health Q&A**: Symptom-based questions
- **Medication Explainer**: Drug purpose and side effects
- **Lab Report Explainer**: Result interpretation
- **Prescription Refill**: Renewal requests
- **Care Journey Updates**: Progress tracking

### AI Safety
- Disclaimer on all responses
- Emergency escalation
- No diagnostic/prescriptive outputs
- Medical disclaimer required

## Future Patient Features

### Q3 2026
- Telemedicine integration
- Health device integration (BP monitor, glucometer)
- AI-powered health insights
- Family health dashboard

### Q4 2026
- ABHA full integration
- Health insurance marketplace
- Medicine ordering integration
- Advanced care journey AI