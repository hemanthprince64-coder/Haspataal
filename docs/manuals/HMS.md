# Hospital Management System (HMS)

## Overview
Comprehensive hospital management system covering reception, patient registration, queue management, doctor management, department management, scheduling, billing, EMR, laboratory, radiology, pharmacy, IPD, OT, ICU, nursing, discharge, analytics, settings, and operational workflows.

## Hospital Onboarding

### Setup Wizard (`/hospital/setup`)
**Stages:**
1. **Identity** - Legal name, registration numbers, GST/PAN/CIN, address
2. **Doctor** - Initial doctor onboarding and affiliations
3. **Department** - Specialty configuration and department hierarchy
4. **WhatsApp** - Meta Business API integration
5. **Billing** - Invoice templates, payment gateways, pricing
6. **Result** - Verification gate and go-live UAT dashboard

### Verification Gates
- **Identity Verified**: Legal documents validated
- **Doctor Verified**: At least 1 verified doctor affiliated
- **Department Configured**: Minimum 1 department with schedule
- **WhatsApp Connected**: Business API validated
- **Billing Tested**: Invoice generation and payment flow tested
- **Go-live UAT**: Written sign-offs from all roles

## Reception

### Patient Registration
- **Walk-in Registration**: Quick demographic capture
- **Appointment-based Registration**: Pre-filled from booking
- **QR Medical Card Scan**: Instant lookup
- **ABHA ID Linking**: National health ID integration
- **Consent Capture**: Granular consent types (Clinical, AI, Research, Notifications, Emergency)

### Patient Lookup
| Method | Fields Required | Access Level |
|--------|----------------|--------------|
| Mobile | Phone + DOB | Reception |
| Patient ID | Global ID | All |
| QR Card | Scan | All |
| ABHA ID | ABHA number | All |
| Appointment Token | Token | Doctor |
| Hospital MRN | MRN | Reception |
| Emergency | Override + Audit | Doctor/ER |

## Queue Management

### Token System
- **Token Generation**: Sequential, department-specific, reset daily
- **Token Rules**: Prefix, format, reset policy, priority lanes
- **Display Boards**: Real-time queue status
- **SMS/WhatsApp Notifications**: Token number, estimated wait, room

### Queue Operations
- **Check-in**: Patient arrival confirmation
- **Call Next**: Doctor calls next token
- **Skip/Reschedule**: Handle no-shows
- **Priority Override**: Emergency cases
- **Transfer**: Move between departments

## Doctor Management

### Doctor Portal Access
- **Affiliation Management**: Add/remove hospital affiliations
- **Schedule Management**: Weekly OPD schedule with morning/evening sessions
- **Leave Management**: Create leave, automatic slot blocking
- **Fee Management**: Consultation fees per hospital
- **Profile Completion**: Track 100% completion for discovery
- **Discovery Publishing**: Automatic publish when all conditions met (verified, active affiliation, complete profile)

### Doctor Scheduling
- **Weekly Schedule**: Monday-Sunday with time slots
- **Slot Duration**: Configurable (10, 15, 20, 30 min)
- **Capacity**: Max patients per slot
- **Break Times**: Lunch, tea breaks
- **Teleconsultation**: Separate slots for virtual

### Leave Calendar
- **Leave Types**: Vacation, conference, emergency, sabbatical
- **Visibility**: Patient-facing or internal only
- **Recurring**: Weekly/monthly patterns
- **Approval Workflow**: Department head → Admin

## Department Management

### Department Configuration
- **Hierarchy**: Parent-child departments (e.g., Medicine → Cardiology)
- **Services**: Consultation, procedures, packages
- **Doctors**: Assign doctors with designations
- **Schedules**: Department-level slot rules
- **Pricing**: Department-specific consultation fees

## Schedules

### Master Schedule
- **Hospital Hours**: Open/close times
- **Working Days**: Monday-Saturday (configurable)
- **Holidays**: Festival, emergency, conference, vacation
- **Override Schedules**: Special days

### Slot Engine
- **Auto-generation**: From doctor schedules
- **Capacity Management**: Per-slot patient limits
- **Real-time Availability**: Live slot status
- **Booking Rules**: Advance booking window, cancellation policy

## Billing

### Invoice Management
- **Templates**: Standard, detailed, insurance
- **Prefix/Numbering**: INV-1001 format
- **GST**: Inclusive/exclusive, HSN codes
- **Payment Modes**: Cash, UPI, card, insurance

### Payment Collection
- **Reception Collection**: At counter
- **Online Payments**: Payment gateway integration
- **Insurance Claims**: TPA panel management
- **Refunds**: Cancellation, overpayment

### Financial Reports
- Daily collection report
- Outstanding dues
- Insurance aging
- Revenue by department/doctor

## EMR (Electronic Medical Records)

### Clinical Workflow
1. **Vitals Recording** - Height, weight, BP, pulse, SpO2, temperature, BMI
2. **Chief Complaints** - Multiple, with duration, severity, priority
3. **History Taking** - HPI, PMH, family, drug, allergy, immunization, social
4. **Examination** - General, systemic, pediatric, obstetric, neurological
5. **Diagnosis** - Primary/secondary, ICD-10, differential
6. **Orders** - Lab, radiology, procedures, referrals
7. **Prescriptions** - Drug, dose, route, frequency, duration, instructions
8. **Treatments** - IV, nebulization, vaccination, injection, procedures
9. **Follow-up** - Review date, care journey, escalation risk

### Clinical Timeline
Auto-generated chronological timeline from all events:
- Appointment Booked → Vitals → Consultation → Prescription → Lab → Billing → Follow-up → Retention

### Record Access
| Role | Access Level |
|------|--------------|
| Patient | Own records only |
| Reception | Demographics, appointments |
| Doctor | Full clinical, prescriptions, investigations |
| Nurse | Vitals, notes, medications |
| Lab Tech | Orders, results |
| Radio Tech | Orders, reports |
| Pharmacist | Medications, dispensing |
| Hospital Admin | Operational |
| Platform Admin | System |

## Laboratory

### Lab Workflow
```
Doctor Lab Order → Sample Collection (Barcode) → Sample Processing 
→ Results Verification → Report Approval → Patient Portal Upload & Notification
```

### Lab Management
- **Test Catalog**: Master tests with reference ranges
- **Panels**: Grouped test packages
- **Pricing**: Hospital-specific pricing
- **Quality Control**: Daily QC logs
- **Equipment**: Instrument-based test tracking
- **TAT Tracking**: Turnaround time monitoring

### Sample Management
- Barcode generation
- Collection acknowledgment
- Rejection reasons
- Result entry templates

## Radiology

### Radiology Workflow
```
Doctor Radiology Order → Slot Scheduling → Scan Execution (DICOM) 
→ Radiologist Reporting → Report Verification → Patient Portal Upload
```

### Radiology Management
- **Modality Catalog**: X-ray, CT, MRI, USG, etc.
- **Body Regions**: Anatomical categorization
- **Contrast Tracking**: Contrast type and allergy check
- **DICOM Storage**: PACS integration ready
- **Report Templates**: Structured reporting

## Pharmacy

### Pharmacy Workflow
```
Prescription Created → Pharmacist Verification → Stock Check & Deduction 
→ Bill Generation → Payment Collection → Patient Dispensation
```

### Inventory Management
- **Stock Levels**: Real-time tracking
- **Expiry Management**: FIFO, expiry alerts
- **Reorder Points**: Automated purchase orders
- **Batch Tracking**: Lot numbers, manufacturer
- **HSN/GST**: Tax compliance

### Dispensing
- Prescription verification
- Drug interaction check (CDS)
- Substitution rules
- Patient counseling notes

## IPD (Inpatient Department)

### Admission Workflow
```
OPD Consultation → Admission Recommendation → Bed Allocation 
→ Ward Check-in → Ward Transfer Logs → Care Plan 
→ Discharge Summary → Treasury Clearance
```

### Bed Management
- **Bed Types**: General, semi-private, private, ICU, NICU
- **Allocation**: Automatic based on patient class/insurance
- **Transfer Tracking**: Ward-to-ward movement log
- **Occupancy**: Real-time bed status

### Ward Operations
- **Nursing Notes**: Shift handovers, vital monitoring
- **Care Plans**: Daily goals, interventions
- **Medication Administration**: MAR charts
- **Discharge Planning**: Checklist, medication reconciliation

## OT (Operation Theater)

### OT Scheduling
- **Elective List**: Planned surgeries
- **Emergency Slots**: Reserved capacity
- **Equipment Check**: Pre-op equipment verification
- **Team Assignment**: Surgeon, anesthetist, nurses

### OT Operations
- **Pre-op Checklist**: WHO surgical safety checklist
- **Intra-op Notes**: Real-time documentation
- **Post-op Recovery**: PACU monitoring
- **Implant Tracking**: Consumable tracking

## ICU (Intensive Care Unit)

### ICU Management
- **Bed Monitoring**: Ventilator, monitor integration ready
- **Scoring Systems**: APACHE, SOFA, Glasgow Coma Scale
- **Ventilator Logs**: Mode, settings, weaning
- **Infection Control**: HAI tracking, isolation protocols

## Nursing

### Nursing Station
- **Patient Assignment**: Nurse-to-patient ratios
- **Task Management**: Medication, vitals, procedures
- **Handover**: Shift change documentation
- **Alerts**: Critical value notifications

## Discharge

### Discharge Workflow
1. Doctor initiates discharge
2. Nursing completes checklist
3. Pharmacy reconciles medications
4. Billing generates final invoice
5. Treasury clears dues
6. Discharge summary generated
7. Patient receives summary + follow-up plan

### Discharge Summary
- Diagnosis, procedures, medications
- Follow-up instructions
- Red flags / emergency contacts
- Care journey continuation

## Hospital Analytics

### Operational Dashboards
- **OPD Volume**: Daily/monthly appointments
- **IPD Metrics**: Occupancy, ALOS, turnover
- **Lab/Radiology**: Volume, TAT, revenue
- **Pharmacy**: Prescriptions filled, revenue, stock
- **Revenue**: Department-wise, doctor-wise

### Clinical Quality
- Infection rates
- Readmission rates
- Mortality tracking
- Patient satisfaction

## Hospital Settings

### Operational Configuration
- **Timezone**: Asia/Kolkata default
- **Working Days**: Mon-Sat configurable
- **Operating Hours**: Open/close times
- **Emergency Contact**: 24x7 number

### Branding
- Logo, favicon, brand color
- Letterhead, prescription header/footer
- Invoice templates

### Marketplace
- Listing configuration
- Tagline, about, facilities
- Fee visibility settings
- Cancellation policy

### Integrations
- **WhatsApp**: Business API, templates
- **SMS**: Provider, templates
- **Email**: SMTP, templates
- **Payment**: Gateway, webhooks
- **Insurance**: TPA panels

## Operational Workflows

### Daily Operations
- Morning: Schedule review, bed status, lab QC
- Mid-day: Queue management, emergency handling
- Evening: Discharge planning, handover

### Weekly Operations
- Schedule publishing
- Leave approvals
- Inventory review
- Quality meetings

### Monthly Operations
- Billing reconciliation
- Insurance claims submission
- Compliance audit
- Staff roster planning

## Hospital Reports

### Clinical Reports
- Daily OPD summary
- Admission/discharge register
- Surgery register
- Birth/death register

### Financial Reports
- Daily collection
- Outstanding report
- Insurance aging
- Doctor revenue share

### Compliance Reports
- NABH/NABL readiness
- Bio-medical waste
- Infection control
- Radiation safety

## Future HMS Roadmap

### Q3 2026
- Advanced bed management
- Nurse scheduling
- Asset tracking
- Kitchen/dietary management

### Q4 2026
- AI bed prediction
- Automated discharge planning
- Robotic process automation
- Tele-ICU integration