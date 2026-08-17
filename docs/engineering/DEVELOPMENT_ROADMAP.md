# Haspataal Development Roadmap (6-Month Production Roadmap)

## Executive Summary

This roadmap provides a comprehensive modular development strategy for Haspataal - a multi-tenant healthcare operating system for India. The project follows a monorepo structure using Turborepo with separate applications for patient portal, doctor portal, hospital HMS, admin panel, API gateways, and background queue workers. 

To ensure complete healthcare compliance and operational readiness, the roadmap spans **25 weeks (approx. 6 months) of feature development, followed by a dedicated 1-week Production Readiness & Pilot Hardening Phase.**

---

## 🏗️ Core Epic Workflows

These end-to-end user workflows are targeted as core integration checkpoints across the milestones:

### 1. Reception Workflow
`Register Patient → Fuzzy Search/Duplicate Check → Walk-in / Appt Check-in → Token Generation → Active Queue Routing → Bill Payments → Receipt Printing`

### 2. Doctor Consultation Workflow
`Secure Login → Patient Queue View → Open Consultation → Vitals Check → Chief Complaints & History → Physical Exam → Diagnosis (ICD-10) → Prescription (e-signed) → Lab Dispatch → Complete Visit`

### 3. Patient Portal Workflow
`OTP Register/Login → Search Doctor/Hospital → Book Appointment (Time slots/waitlists) → Check-in QR Generation → View Prescription PDF & Lab Results → Family Accounts Management`

---

## Phase 1: Foundation, Shared Packages & Multi-Tenant Core (Weeks 1-3)

### Milestone 1.1: Multi-Tenant Architecture Core
**Priority: P0 - Critical** | **Duration: 4 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| DB Package | Hospital ID in ALL tables | Pending | None |
| DB Package | Tenant context provider | Pending | None |
| DB Package | Hospital isolation middleware | Pending | None |
| DB Package | Hospital-specific settings table | Pending | None |
| DB Package | Branding configuration schema | Pending | None |

### Milestone 1.2: Multi-Role RBAC System
**Priority: P0 - Critical** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Auth Package | Super Admin, Hospital Admin, and Doctor roles | Pending | None |
| Auth Package | Receptionist, Nurse, Pharmacist, and Lab Tech roles | Pending | None |
| Auth Package | Radiology Tech, Accountant, Resident, and Patient roles | Pending | None |
| Auth Package | Permission Matrix (CRUD mappings table) | Pending | All roles |
| Auth Package | API permission guard middleware | Pending | None |

### Milestone 1.3: Master Data Management
**Priority: P0 - Critical** | **Duration: 4 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| DB Package | ICD-10 Code Master table & seeds | Pending | None |
| DB Package | Drug Master database (formulations, brands, strengths) | Pending | None |
| DB Package | Laboratory & Radiology Test Masters (LOINC links) | Pending | None |
| DB Package | Specialties & Department Master catalogs | Pending | None |
| DB Package | Vaccine Master (birth schedules) & Allergy catalogs | Pending | None |

### Milestone 1.4: Infrastructure & Shared Services
**Priority: P0 - Critical** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| DB Package | Prisma ORM singleton setup | Pending | None |
| Shared | `@haspataal/events` (Redis Stream Event Bus singleton) | Pending | None |
| Shared | `@haspataal/scheduler` (BullMQ background cron engine) | Pending | None |
| Shared | `@haspataal/email` (SMTP/Resend notification client) | Pending | None |
| Shared | `@haspataal/sms` and `@haspataal/whatsapp` clients | Pending | None |
| Shared | `@haspataal/files` (S3/R2 storage driver & file scanner) | Pending | None |

**Definition of Done (DoD)**:
- [ ] Multi-tenant isolation verified by cross-hospital DB queries.
- [ ] RBAC guards tested against all 11 roles.
- [ ] Database seeds applied for ICD-10 and Drug masters.
- [ ] Event Bus publishes and Scheduler executes mock cron jobs.

---

## Phase 2: Authentication, Security & Accounts (Weeks 4-5)

### Milestone 2.1: Patient Authentication
**Priority: P0 - Critical** | **Duration: 4 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Patient Portal | Phone format & Zod validations | Pending | None |
| Patient Portal | OTP request endpoint & template SMS | Pending | SMS Package |
| Patient Portal | OTP verification & session token generation | Pending | Auth Package |
| Patient Portal | Registration form (Zod validation + Avatar upload) | Pending | Files Package |

### Milestone 2.2: Hospital Authentication
**Priority: P0 - Critical** | **Duration: 4 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| HMS | Email/Password login screen | Pending | None |
| HMS | Session cookie verification & RBAC context | Pending | Auth Package |
| HMS | Forgot password recovery flow (token generation) | Pending | Email Package |
| HMS | Session & device history logs (IP tracking, security alerts) | Pending | None |

### Milestone 2.3: Security Hardening
**Priority: P0 - Critical** | **Duration: 6 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Security | CSRF protection middleware | Pending | None |
| Security | CSP headers configuration (Helmet integration) | Pending | None |
| Security | File type & virus scan filters (ClamAV integration) | Pending | Files Package |
| Security | API Rate Limiting (sliding window Redis limiter) | Pending | Cache Package |
| Security | MFA enforcement for Admin / Hospital Admin users | Pending | None |

**Definition of Done (DoD)**:
- [ ] Authentication flows (OTP/Password) tested and verified.
- [ ] Session validation records device logins.
- [ ] File uploads blocked if MIME-type fails validation or scan fails.
- [ ] Rate limits trigger 429 status on overflow.

---

## Phase 2.5: Doctor Identity & Hospital Affiliation Module (Weeks 5-7)

### Milestone 2.5.1: Doctor Platform Registration & Personal Info
**Priority: P0 - Critical** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Doctor Portal | Doctor registration: Mobile OTP, email, password → DRAFT status | Pending | Auth Package |
| Doctor Portal | Personal information: name, gender, DOB, photo, languages, bio, designation | Pending | Files Package |
| Doctor Portal | Medical council registration (number, council, validity) | Pending | Master Data |

### Milestone 2.5.2: Education, Qualifications & Credentials
**Priority: P0 - Critical** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Doctor Portal | Education records: UG (MBBS), PG, Super-specialty (DM/MCh/DNB SS/FNB), Diplomas, Fellowships | Pending | None |
| Doctor Portal | Certifications (course, authority, number, expiry), Skills (NICU, PICU, Ventilator, etc.) | Pending | None |
| Doctor Portal | Professional Memberships (IAP, IMA, NNF, FOGSI, API, RSSDI) | Pending | None |
| Doctor Portal | Publications (journal, DOI), Awards, Conferences, Licenses (state, NMC, international) | Pending | None |

### Milestone 2.5.3: Professional Experience & Documents
**Priority: P0 - Critical** | **Duration: 4 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Doctor Portal | Experience records: Hospital, designation, department, dates, responsibilities | Pending | None |
| Doctor Portal | Document upload: MBBS, PG, SS, registration, govt ID, experience letters, photo | Pending | Files Package, Security Package |
| Doctor Portal | Secure upload with virus scanning, AES-256 encryption | Pending | Files Package |

### Milestone 2.5.4: Verification & Profile Completion
**Priority: P0 - Critical** | **Duration: 4 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Doctor Portal | Verification workflow: DOCUMENT_PENDING → UNDER_VERIFICATION → VERIFIED/REJECTED | Pending | None |
| Doctor Portal | Profile completion gates: Mandatory fields check → 100% complete = ACTIVE | Pending | None |
| Doctor Portal | Dashboard showing completion percentage | Pending | None |

### Milestone 2.5.5: Hospital Affiliation Workflow
**Priority: P0 - Critical** | **Duration: 4 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Doctor Portal | Hospital searches doctor by name, registration, specialty | Pending | Search Service |
| Doctor Portal | Hospital sends invitation with role, department, fee, timings | Pending | None |
| Doctor Portal | Doctor accepts/rejects invitation → PENDING → ACCEPTED | Pending | None |
| Doctor Portal | Hospital admin confirms → ACCEPTED → ACTIVE | Pending | None |
| Doctor Portal | Hospital-specific data: department, specialty, fee, duration, working days/hours, teleconsultation, leave, room, token rules | Pending | Master Data |

### Milestone 2.5.6: Doctor Dashboard & Public/Private Profiles
**Priority: P0 - Critical** | **Duration: 4 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Doctor Portal | Doctor dashboard: profile completion, verification, affiliations, appointments, patients, consultations, analytics, revenue, reviews, documents | Pending | None |
| Doctor Portal | Public profile (patient-facing): name, qualifications, specialties, experience, languages, affiliations, availability | Pending | None |
| Doctor Portal | Private profile (hospital/platform): govt ID, registration docs, employment history, internal notes, verification metadata | Pending | Auth Package |

### Milestone 2.5.7: Credential Verification & Expiry Monitoring
**Priority: P1 - High** | **Duration: 3 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Doctor Portal | Credential verification layer: Self-declared → Uploaded → Verified by Haspataal → Verified with Authority → Expired | Pending | None |
| Doctor Portal | Hospital filter by verification status | Pending | None |
| Doctor Portal | Credential expiry monitoring: auto-notify before registration, fellowship, certification, training expiry | Pending | Scheduler Package |

### Milestone 2.5.8: Database Schema, APIs & Security
**Priority: P0 - Critical** | **Duration: 4 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| DB Package | Doctor identity schema: Doctor, DoctorProfile, DoctorEducation, DoctorQualification, DoctorSkill, DoctorCertification, DoctorMembership, DoctorPublication, DoctorAward, DoctorConference, DoctorExperience, DoctorDocument, DoctorVerification, DoctorAffiliation, DoctorSchedule, DoctorDepartment, DoctorLeave, DoctorAnalytics, DoctorReview (18 tables) | Pending | DB Package |
| Doctor Portal | REST APIs: POST /doctors/register, /profile, /education, /experience, /documents, /verify, /invite, /accept-affiliation; GET /doctors/search, /dashboard | Pending | Auth Package |
| Security | Platform identity, multi-hospital support, audit logs, document encryption (AES-256), RBAC, MFA, digital signatures, RLS, consent tracking, immutable qualification records | Pending | Security Package |

**Definition of Done (DoD)**:
- [ ] Doctor registration completes with OTP, email, password → DRAFT status.
- [ ] Personal info, education, experience, documents captured with validation.
- [ ] Verification workflow transitions through all statuses correctly.
- [ ] Profile completion gate enforces 100% mandatory fields → ACTIVE.
- [ ] Hospital invitation → doctor acceptance → hospital confirmation → ACTIVE affiliation.
- [ ] Hospital-specific data (fee, timings, department, schedule) configurable per affiliation.
- [ ] Doctor dashboard shows all required widgets and data.
- [ ] Public/private profile split enforced by role-based access.
- [ ] Credential verification layer with 5 status levels operational.
- [ ] Expiry monitoring sends alerts before credential expiration.
- [ ] All 18 database tables created with proper relationships.
- [ ] All REST APIs functional with security hardening.
- [ ] Multi-hospital affiliations supported with isolated data per hospital.

---

## Phase 2.75: Doctor Discovery, Public Profile & Availability Module (Weeks 7-8)

### Milestone 2.75.1: Doctor Discovery Service & Automatic Indexing
**Priority: P0 - Critical** | **Duration: 3 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Doctor Portal | Doctor Discovery Service: aggregates verified doctor profiles and active hospital affiliations | Pending | Doctor Identity Phase 2.5 |
| Doctor Portal | Automatic indexing logic: IF doctor VERIFIED AND profile 100% complete AND affiliation ACTIVE AND hospital ACTIVE → publish to Patient Portal | Pending | Doctor Identity, Hospital Onboarding |
| Doctor Portal | If verification expires → hide doctor automatically from Patient Portal | Pending | Verification Service |

### Milestone 2.75.2: Public Doctor Card & Hospital Affiliations
**Priority: P0 - Critical** | **Duration: 3 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Patient Portal | Public Doctor Card: photo, name, qualification, specialty, super-specialty, designation, years of experience, languages, masked registration number, verification badge, rating, review count, consultation fee, available today, next available slot, book appointment button | Pending | Doctor Discovery Service |
| Patient Portal | Hospital Affiliations display: hospital name, logo, department, designation, fee, city, state, distance, Google Maps button, hospital verification badge | Pending | Hospital Data |
| Patient Portal | Google Maps integration: store latitude, longitude, full address, city, state, place ID; generate maps URL dynamically | Pending | Location Service |

### Milestone 2.75.3: Doctor Availability & Leave Management
**Priority: P0 - Critical** | **Duration: 4 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Doctor Portal | Doctor Availability Service: compute from weekly OPD schedule, holiday calendar, active leave, existing appointments, slot capacity (avoid stale data) | Pending | Scheduling Service |
| Doctor Portal | Doctor controls: working days, morning/evening sessions, slot duration, max patients, break times, teleconsultation, walk-in allowed | Pending | None |
| Doctor Portal | Leave Management: create leave (type, start/end date, reason, visibility, recurring, approval); when active → hide slots, stop bookings, show "Doctor is on Leave", recommend alternatives | Pending | Notification Service |
| Doctor Portal | OPD Schedule: weekly schedule with morning/evening sessions, holiday overrides (festival, emergency closure, conference, vacation) | Pending | None |
| Doctor Portal | Availability Status: Available, Limited Slots, Fully Booked, On Leave, Offline, Emergency Only (auto-calculated) | Pending | Availability Service |

### Milestone 2.75.4: Patient Search & Alternative Suggestions
**Priority: P0 - Critical** | **Duration: 3 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Patient Portal | Patient Search: by doctor name, specialty, hospital, disease/symptoms, city, distance, language, gender, experience, rating, availability | Pending | Search Service |
| Patient Portal | Search Filters: Available Today, Available Tomorrow, Teleconsultation, In-person, Nearest, Highest Rated, Lowest Fee, Most Experienced | Pending | None |
| Patient Portal | Unified Doctor Search Index: denormalized index updated on profile change, qualification verification, affiliation change, OPD timing change, leave status change, hospital status change | Pending | Search Service, Events Package |
| Patient Portal | Alternative Doctor Suggestions: when doctor on leave/fully booked → recommend same department, same hospital first, then nearby affiliated hospitals, preserve specialty and consultation mode | Pending | Doctor Discovery Service |

### Milestone 2.75.5: Doctor Dashboard & Database Schema
**Priority: P0 - Critical** | **Duration: 3 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Doctor Portal | Doctor Dashboard: manage profile, qualifications, experience, skills, affiliations, schedules, leaves, consultation fees, availability, documents, analytics, reviews | Pending | None |
| DB Package | Database Schema: Doctor, DoctorProfile, DoctorQualification, DoctorExperience, DoctorSkill, DoctorCertification, DoctorAffiliation, Hospital, HospitalLocation, DoctorSchedule, DoctorLeave, DoctorAvailability, DoctorHoliday, DoctorAnalytics, DoctorReview, DoctorSearchIndex, DoctorPublicProfile (16 tables) | Pending | DB Package |
| Doctor Portal | REST APIs: GET /doctors, /doctors/search, /doctors/{doctorId}, /doctors/{doctorId}/availability, /doctors/{doctorId}/affiliations, /hospitals/{hospitalId}/doctors; POST /doctors/schedule, /doctors/leave; PATCH /doctors/availability | Pending | Auth Package |
| Security | Security: Only public information exposed (hide government ID, personal address, documents, personal mobile, email, employment contracts, internal notes); audit logs; authorized users only access private data | Pending | Security Package |

**Definition of Done (DoD)**:
- [ ] Doctor Discovery Service aggregates and indexes verified doctors correctly.
- [ ] Automatic indexing logic publishes/hides doctors based on status.
- [ ] Public Doctor Card displays all required fields with masked sensitive data.
- [ ] Hospital Affiliations show correct data with Google Maps integration.
- [ ] Doctor Availability Service computes status from schedule, leave, appointments, slots.
- [ ] Leave Management hides slots and recommends alternatives when active.
- [ ] OPD Schedule supports weekly sessions and holiday overrides.
- [ ] Availability Status auto-calculates correctly.
- [ ] Patient Search works across all specified fields with filters.
- [ ] Unified Search Index updates denormalized data in real-time.
- [ ] Alternative Doctor Suggestions recommend appropriate replacements.
- [ ] Doctor Dashboard manages all profile and availability settings.
- [ ] All 16 database tables created with proper relationships.
- [ ] All REST APIs functional with security hardening.
- [ ] Patient Portal reads ONLY from Doctor Discovery Service.

---

## Phase 4: Onboarding & Hospital Setup Wizard (Week 8)

### Milestone 4.1: Complete Onboarding & Configuration Wizard
**Priority: P0 - Critical** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| HMS | Hospital profile wizard forms (Identity, logo, contacts) | Pending | None |
| HMS | Department config & Specialties mapping UI | Pending | Master Data |
| HMS | Roster Setup: Doctor shifts & timings configuration | Pending | Master Data |
| HMS | Configuration Service: Operating hours & holiday rules | Pending | None |
| HMS | Configuration Service: Custom token rules & templates | Pending | None |
| HMS | Go-Live Setup validation check (minimum fields compliance) | Pending | None |

**Definition of Done (DoD)**:
- [ ] Wizard successfully captures and validates hospital metadata.
- [ ] Doctor shifts generated according to shift timings.
- [ ] Settings service serves correct branding tokens.

---

## Phase 5: Complete Appointment Engine (Weeks 8-9)

### Milestone 5.1: Smart Scheduling & Booking
**Priority: P0 - Critical** | **Duration: 7 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Booking | Walk-in booking endpoint & token assignment | Pending | None |
| Booking | Online booking flow (slot checking & lock duration) | Pending | None |
| Booking | Smart Slot: Buffer times between appointments | Pending | None |
| Booking | Smart Slot: Doctor leave/holiday overrides | Pending | Scheduler |
| Booking | Smart Slot: Overbooking configurations & constraints | Pending | None |
| Booking | Expected Waiting Time calculation service | Pending | None |

### Milestone 5.2: Queue Intelligence & Search
**Priority: P1 - High** | **Duration: 6 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Booking | Waitlist management & Priority bookings | Pending | None |
| Booking | Auto-fill cancelled slots (notifications to waitlist) | Pending | WhatsApp Package |
| Booking | Token prediction service (real-time duration analysis) | Pending | None |
| Shared | Global Search Service: Patient, doctor, and drug index | Pending | None |

**Definition of Done (DoD)**:
- [ ] Appointment scheduling handles double bookings.
- [ ] Waiting time updates based on active consultation lengths.
- [ ] Global search queries patients, doctors, and medicines under 500ms.

---

### Milestone 5.3: Smart Confirmation Engine
**Priority: P0 - Critical** | **Duration: 4 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Booking | Configurable confirmation modes: AUTO_ACCEPT (default OPD), MANUAL_ACCEPT (private/visiting/super specialists, teleconsultation), AUTO_ACCEPT_WITH_RESCHEDULE (hospitals) | Pending | None |
| Booking | Appointment States: AVAILABLE → BOOKED → PENDING_CONFIRMATION → CONFIRMED → CHECKED_IN → IN_CONSULTATION → COMPLETED → FOLLOW_UP (+ REJECTED, EXPIRED, CANCELLED, NO_SHOW, RESCHEDULE_REQUESTED, RESCHEDULE_ACCEPTED, RESCHEDULE_DECLINED) | Pending | None |
| Booking | Manual Confirmation Workflow: booking → PENDING_CONFIRMATION → notification (Doctor App, HMS, WhatsApp, Email) → 60-min timer → accept/reject/reschedule/forward → patient notified | Pending | Notification Service |
| Booking | Doctor Actions: Accept, Reject, Reschedule, Forward to colleague, Mark unavailable | Pending | None |
| Booking | Notification Timeline: 0min booking, 15min reminder, 45min urgent, 55min final, 60min auto-expiry | Pending | Scheduler Package |
| Booking | Patient Screen: Pending confirmation, countdown timer, doctor name, hospital, expected confirmation time, cancel option, suggested alternatives | Pending | None |
| Booking | Doctor Dashboard: Pending requests with countdown, accept/reject/reschedule/forward buttons, priority indicator | Pending | None |
| Booking | Hospital Dashboard: Pending confirmations, acceptance SLA, average response time, expired requests, doctor response rate | Pending | None |
| Booking | Configuration: Hospital-level mode, doctor-level override, consultation type override, emergency bypass, max pending requests, auto expiry duration | Pending | None |
| Booking | Department-Level Routing: Patient chooses department → if doctor unavailable → offer next available doctor in same department | Pending | Search Service |
| Booking | Smart Escalation: 30min → notify doctor again, 45min → notify dept coordinator, 55min → notify hospital admin → expire + recommend another doctor | Pending | Notification Service |
| Booking | Live Queue Integration: Once accepted → queue generated → estimated waiting time → live queue position | Pending | Queue Service |
| Booking | AI-Based Recommendations: On expiry → suggest same specialty, same hospital, nearest affiliated hospital, earliest available slot, highest-rated available doctor | Pending | AI Package |
| DB Package | Database Schema: Appointment, AppointmentConfirmation, AppointmentStatusHistory, ConfirmationTimer, DoctorAvailability, RescheduleRequest, NotificationLog | Pending | DB Package |
| Booking | Domain Events: AppointmentRequested, ConfirmationRequested, ReminderSent, AppointmentConfirmed, AppointmentRejected, AppointmentExpired, AppointmentRescheduled, AppointmentForwarded | Pending | Events Package |
| Security | Security: Only assigned doctor may confirm, hospital admins may override, all actions audited, all status transitions immutable | Pending | Security Package |

**Definition of Done (DoD)**:
- [ ] All three confirmation modes (AUTO_ACCEPT, MANUAL_ACCEPT, AUTO_ACCEPT_WITH_RESCHEDULE) functional.
- [ ] Appointment state transitions work correctly for all scenarios.
- [ ] Manual confirmation workflow handles 60-min timer, accept/reject/reschedule/forward.
- [ ] Notification timeline triggers at correct intervals (0, 15, 45, 55, 60 min).
- [ ] Patient screen shows countdown, alternatives, cancel option.
- [ ] Doctor dashboard shows pending requests with priority indicator.
- [ ] Hospital dashboard tracks SLA, response time, expiry rate.
- [ ] Configuration supports hospital/doctor/consultation type overrides.
- [ ] Department-level routing offers next available doctor in same department.
- [ ] Smart escalation notifies coordinator/admin at correct thresholds.
- [ ] Live queue integration generates queue position after confirmation.
- [ ] AI recommendations suggest appropriate alternatives on expiry.
- [ ] All database tables created with proper relationships.
- [ ] All domain events published via event bus.
- [ ] Security enforces assigned-doctor-only confirmation with audit logs.

---

## Phase 6: Doctor Workspace & Clinical EMR (Weeks 9-10)

### Milestone 6.1: Clinical EMR Documentation
**Priority: P0 - Critical** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| EMR | Chief complaints capture form (severity + duration) | Pending | None |
| EMR | Clinical history (HPI, medical, family, allergies) | Pending | Master Data |
| EMR | Systemic physical examinations templates | Pending | None |
| EMR | Vitals logging (BP, heart rate, temp, height/weight) | Pending | None |
| EMR | ICD-10 diagnostic indexing panel | Pending | Master Data |
| EMR | Clinical attachments (S3 links with PDF/Image viewer) | Pending | Files Package |

### Milestone 5.2: Clinical AI Workspace
**Priority: P1 - High** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Doctor AI | SOAP note drafting generator | Pending | AI Package |
| Doctor AI | ICD coding suggestions based on complaints notes | Pending | AI Package |
| Doctor AI | Discharge summary generator | Pending | AI Package |
| Doctor AI | e-Prescription writer with allergy/contraindication check | Pending | EMR Package |
| Doctor AI | Digital prescription signature integration | Pending | Auth Package |

### Milestone 5.3: Doctor Portal Workspace (`doctor.haspataal.com`)
**Priority: P0 - Critical** | **Duration: 4 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Doctor Portal | Dedicated dashboard: today's queue & appointments | Pending | None |
| Doctor Portal | Patient queue toggle (waiting, in-consult, completed) | Pending | None |
| Doctor Portal | Availability exceptions & Leave application dashboard | Pending | None |
| Doctor Portal | Doctor performance stats (consultation length, ratings) | Pending | None |

**Definition of Done (DoD)**:
- [ ] SOAP notes compile from clinical records inputs.
- [ ] ICD-10 indexing validates inputs.
- [ ] e-Signatures validated on generated prescription PDFs.
- [ ] Doctor queue syncs in real-time.

---

## Phase 7: Patient Clinical Data Retrieval & Update Module (Weeks 11-13)

### Milestone 7.1: Patient Registration & Multi-Method Lookup
**Priority: P0 - Critical** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Clinical Data | Patient registration: OTP verification, demographics, ABHA ID linking | Pending | Auth Package, Master Data |
| Clinical Data | Consent record creation (Clinical Care, AI Assistance, Sharing, Research, Notifications, Emergency) | Pending | None |
| Clinical Data | Audit entry on registration | Pending | Audit Package |
| Clinical Data | Multi-method lookup: Mobile, Patient ID, QR Medical Card, ABHA ID, Appointment Token, Hospital MRN | Pending | Search Service |
| Clinical Data | Role-based verification: Reception (mobile+DOB), Doctor (active appointment), Emergency (override with audit) | Pending | Auth Package |

### Milestone 6.2: Privacy-Aware Patient Summary & Clinical Updates
**Priority: P0 - Critical** | **Duration: 6 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Clinical Data | Clinician summary view: Name, Age, Gender, Blood Group, City, State, Allergies, Chronic Diseases, Pregnancy Status, Current Medications, Alerts, Recent Visits, Care Journey | Pending | Master Data |
| Clinical Data | PII protection: Hide address, Aadhaar, payment, family contacts, notes by default; role-based field visibility | Pending | None |
| Clinical Data | Vitals recording: Temperature, Pulse, RR, BP, SpO2, Height, Weight, BMI, Pain Score, Head Circumference | Pending | None |
| Clinical Data | Chief Complaints: Multiple complaints with duration, severity, priority | Pending | None |
| Clinical Data | History capture: HPI, PMH, Family History, Drug History, Allergies, Immunization, Social History | Pending | None |
| Clinical Data | Examination templates: General, Systemic, Pediatric, Obstetric, Neurological | Pending | None |

### Milestone 6.3: Diagnosis, Orders, Prescriptions & Treatments
**Priority: P0 - Critical** | **Duration: 6 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Clinical Data | Diagnosis: Primary/Secondary, ICD-10 indexing, Differential diagnosis | Pending | Master Data |
| Clinical Data | Orders: Lab tests, Radiology, Procedures, Referrals | Pending | Master Data |
| Clinical Data | Prescriptions: Drug, Dose, Route, Frequency, Duration, Instructions, PRN flag | Pending | Master Data, CDS |
| Clinical Data | Treatments: IV Fluids, Nebulization, Vaccination, Injection, Procedure Notes | Pending | None |
| Clinical Data | Follow-up: Review date, Care Journey assignment, Escalation Risk, Retention Rules | Pending | Care Journey Package |

### Milestone 6.4: Clinical Timeline, Events & RBAC
**Priority: P0 - Critical** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Clinical Data | Auto timeline generation: Appointment Booked → Vitals → Consultation → Prescription → Lab → Billing → Follow-up → Retention | Pending | Events Package |
| Clinical Data | Domain events: PatientRegistered, AppointmentBooked, VisitStarted, VitalsRecorded, PrescriptionCreated, InvestigationOrdered, VisitCompleted, FollowUpScheduled | Pending | Events Package |
| Clinical Data | Outbox pattern for reliable event delivery | Pending | Events Package |
| Clinical Data | RBAC for clinical data: Patient, Reception, Doctor, Nurse, Lab Tech, Radio Tech, Pharmacist, Hospital Admin, Platform Admin | Pending | Auth Package |
| Clinical Data | Patient Consent Management: Versioned, timestamped, revocable, audited; enforcement on data access | Pending | None |

### Milestone 6.5: Clinical Decision Support (Deterministic) & Security
**Priority: P0 - Critical** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| CDS | Drug-drug interaction detection | Pending | Drug Master |
| CDS | Drug allergy alerts | Pending | Patient Allergy Data |
| CDS | Pregnancy contraindication warnings | Pending | Pregnancy Module |
| CDS | Pediatric maximum dose validation | Pending | Drug Master, Patient Demographics |
| CDS | Renal/hepatic dose adjustment checks | Pending | Drug Master, Lab Results |
| CDS | Duplicate medication detection | Pending | Prescription Data |
| Clinical Data | Multi-tenant data isolation: Platform DB (identity, auth, consent) vs Hospital DB (encounters, EMR, billing) | Pending | DB Package |
| Clinical Data | Cross-hospital sharing via explicit patient consent | Pending | Consent Management |
| Clinical Data | Security: RLS policies, AES-256, JWT, MFA, Rate Limiting, CSRF, CSP, Helmet, Secure Cookies, Request IDs, Virus Scanning, Signed URLs, OWASP API Top 10 | Pending | Security Package |

### Milestone 6.6: API Layer & Patient Timeline (Flagship)
**Priority: P0 - Critical** | **Duration: 4 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Clinical Data | REST APIs: POST /patients/register, POST /patients/search, GET /patients/{id}/summary, GET /patients/{id}/timeline, POST /consultations, POST /vitals, POST /prescriptions, POST /investigations, POST /followups, POST /treatments, GET /audit | Pending | All Clinical Data Modules |
| Clinical Data | Patient Timeline (Flagship): Unified chronological timeline (Registrations, OPD, IPD, Prescriptions, Lab, Radiology, Pregnancy, Vaccinations, Billing, Follow-ups, Care Journey) | Pending | Timeline Events |
| Clinical Data | Offline QR Medical Card with emergency data | Pending | Files Package |
| Clinical Data | AI Integration: Patient AI (explainers), Doctor AI (SOAP, ICD, summary), Hospital AI (capacity, no-show, retention) | Pending | AI Package |

**Definition of Done (DoD)**:
- [ ] Patient registration completes with OTP, demographics, ABHA, consent, audit.
- [ ] Multi-method lookup works with role-based verification.
- [ ] Clinician summary shows correct fields; PII hidden by default.
- [ ] All clinical update forms (vitals, complaints, history, exam, diagnosis, orders, rx, treatments, follow-up) functional.
- [ ] Auto timeline generates entries for all clinical events.
- [ ] Domain events published via outbox pattern.
- [ ] RBAC enforced across all clinical data endpoints.
- [ ] Consent management versioned, revocable, audited, enforced.
- [ ] CDS safety checks block unsafe prescriptions in real-time.
- [ ] Multi-tenant isolation verified (platform vs hospital DB).
- [ ] All REST APIs functional with security hardening.
- [ ] Patient timeline displays unified chronological view.
- [ ] QR Medical Card works offline for emergency access.

---

## Phase 8: Notification Center & Scheduling (Week 14)

### Milestone 8.1: Unified Notification Service & Crons
**Priority: P0 - Critical** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Shared | SMS, WhatsApp, and Email gateway configurations | Pending | Shared Package |
| Shared | Push notifications (PWA / Expo Push API) | Pending | None |
| Shared | Notification curfew scheduler (defer non-critical to 8 AM) | Pending | Scheduler |
| Shared | Retry queues, dead letter logging, and alerts | Pending | Queue Package |
| Shared | Cron: ANC/Pregnancy checkpoints reminder | Pending | Scheduler |
| Shared | Cron: Pediatric vaccinations timeline reminders | Pending | Scheduler |
| Shared | Cron: Missed follow-up chronic recall checks | Pending | Scheduler |

**Definition of Done (DoD)**:
- [ ] Gateway falls back to SMS on WhatsApp delivery failure.
- [ ] Curfew scheduler defers non-critical alerts to 8 AM IST.
- [ ] Chronological reminders compile correctly from patient databases.

---

## Phase 9: Patient Portal & Family Profiles (Weeks 15-16)

### Milestone 9.1: Enhanced Patient Portal Features
**Priority: P1 - High** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Patient Portal | Family profile management (dependents linked accounts) | Pending | DB Package |
| Patient Portal | QR Medical Card generator (offline scan check-in) | Pending | DB Package |
| Patient Portal | Health Cabinet: Prescriptions and lab reports download | Pending | Files Package |
| Patient Portal | Patient Timeline Service: Registration to follow-up | Pending | EMR Package |
| Patient Portal | Offline PWA caching (view records, show emergency details) | Pending | None |

### Milestone 8.2: Pregnancy & Pediatric Clinical Features
**Priority: P0 - Critical** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Patient Portal | Maternal health tracker & edd calculators | Pending | None |
| Patient Portal | Pediatric Vaccination Tracker (IAP timeline checks) | Pending | Master Data |
| Patient Portal | Pediatric Growth Charts visualization (WHO centiles) | Pending | None |
| Patient Portal | Pediatric Dose Calculator interface | Pending | Drug Master |
| Patient Portal | Bilingual Hindi/Bhojpuri translation toggle & TTS | Pending | None |
| Patient AI | Prescription & Lab Report explainers (Patient friendly) | Pending | AI Package |

**Definition of Done (DoD)**:
- [ ] Family profile accounts share check-in QR codes.
- [ ] Patient timeline displays complete visit history.
- [ ] Growth charts compute percentiles accurately.
- [ ] PWA caches data for offline access.

---

## Phase 10: HMS Extended Modules & Operations (Weeks 17-18)

### Milestone 10.1: Reception & Ward Operations
**Priority: P1 - High** | **Duration: 6 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| HMS | Reception Dashboard: Patient search & matching | Pending | Search Service |
| HMS | Duplicate detection matching wizard (mobile, Aadhaar) | Pending | None |
| HMS | Bed allocation & Ward inventory tracker | Pending | None |
| HMS | OT Scheduling calendar & ICU vitals monitor dashboard | Pending | None |

### Milestone 9.2: Care Journey & Retention
**Priority: P0 - Critical** | **Duration: 7 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| HMS | Care Journey: Chronic disease pathways setups | Pending | None |
| HMS | Missed Follow-up recall engine & campaigns manager | Pending | Scheduler |
| HMS | Escalation Alert Engine (notifies doctor on 2x missed) | Pending | Events Package |
| Hospital AI | No-show prediction & patient retention insights dashboard | Pending | AI Package |

**Definition of Done (DoD)**:
- [ ] Reception search resolves duplicate patient queries.
- [ ] Ward occupancy maps in real-time.
- [ ] Escalation triggers alerts after 2x missed checkups.

---

## Phase 11: Billing, Admin & SaaS Layer (Week 19)

### Milestone 11.1: Billing, Receipts & SaaS Subscription
**Priority: P0 - Critical** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Billing | Invoice generation, line items, and GST calculations | Pending | None |
| Billing | Concessions/Discounts approval flow & Refunds | Pending | None |
| Billing | Partial payments tracking & outstanding statements | Pending | None |
| Billing | Payment gateway integrations (Razorpay/Stripe checkout) | Pending | None |
| SaaS | Subscription plans setup, trial periods, and quotas limits | Pending | None |
| SaaS | Usage trackers & Next.js middleware feature gating | Pending | Auth Package |

### Milestone 10.2: Admin Console & Compliance
**Priority: P1 - High** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| Admin Panel | Hospital & Doctor license verification workflows | Pending | Files Package |
| Admin Panel | Support tickets dashboard & CMS system announcements | Pending | None |
| Compliance | Patient consent management & record sharing settings | Pending | None |
| Compliance | GDPR/DPDP Right to be Forgotten data deletion utility | Pending | None |
| Admin AI | Platform health analytics & fraud audits tracker | Pending | AI Package |

**Definition of Done (DoD)**:
- [ ] Invoice calculations include GST tax lines.
- [ ] Gateway redirects to checkout.
- [ ] Gating middleware blocks access if subscription is delinquent.
- [ ] Consent settings control records readability.

---

## Phase 12: Infrastructure, DevOps & Observability (Week 20)

### Milestone 12.1: DevOps, Rollbacks & Monitoring
**Priority: P0 - Critical** | **Duration: 5 days**

| Module | Component | Status | Dependencies |
|--------|-----------|--------|--------------|
| DevOps | Blue-Green deployment configuration scripts | Pending | None |
| DevOps | Canary releases routing configurations | Pending | None |
| DevOps | Database migration validation & automated rollbacks | Pending | DB Package |
| DevOps | Feature flags toggles & config overrides | Pending | None |
| DevOps | Synthetic endpoint monitoring alerts (uptime status) | Pending | None |
| DevOps | Sentry exceptions tracking with PHI scrubbing filters | Pending | None |

**Definition of Done (DoD)**:
- [ ] Blue-green deployment scripts validated.
- [ ] Database migration rollback script verified in staging.
- [ ] Sentry logs contain no unredacted patient details.

---

## 🏁 Phase 13: Production Readiness & Pilot Hardening (Final Week)

| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| PRD1.1 | Hardening & Seeding | - Seed master database records (ICD-10, Specialties, Drugs)<br>- Verify database recovery RTO (<30 mins)<br>- Run security penetration audits (OWASP API Top 10) | 12h | P0 |
| PRD1.2 | Benchmarking | - Execute gateway load testing under 10k concurrent users load scenario<br>- Benchmark latency targets (<2s dashboard load, <500ms search) | 12h | P0 |
| PRD1.3 | Pilot & Training | - Set up 1 pilot hospital account with actual doctor/receptionist UAT checks<br>- Run UAT tests (verify entire check-in to checkout loop)<br>- Finalize go-live rollback plans & support desk SLAs | 16h | P0 |

---

## 🚦 Definition of Launch (Go-Live Gates)

Haspataal is declared ready for production launch only when the following criteria are satisfied:

1. **Active Pilot Run:** At least 1 physical hospital/clinic onboarded and running the queue system.
2. **Operational Minimum:** Minimum active UAT volume achieved: 10 doctors, 100 patient profiles, and 1,000 appointment tokens processed without error.
3. **Workflow Validation:** The entire patient check-in → triage → consultation → billing → follow-up retention loop passes without manual database intervention.
4. **Data Isolation:** Zero-cross tenant leakage confirmed via automated multi-tenant boundary test suite.
5. **Security Gates:** OWASP API Top 10 penetration test clean report and database RLS policies verified.
6. **Support Ready:** Support helpdesk active, incident escalation response maps completed, and runtime recovery runbooks published.

---

## 🗓️ Updated Timeline Overview

```text
ENGINEERING PIPELINE (25 Weeks - Full Production Build)
├─ Weeks 1-3:    Foundation, Multi-Tenant Core & Shared Packages
├─ Weeks 4-5:    Authentication, Security & Accounts
├─ Weeks 5-7:    Doctor Identity & Hospital Affiliation Module (NEW)
├─ Weeks 7-8:    Doctor Discovery, Public Profile & Availability Module (NEW)
├─ Week 8:       Onboarding & Hospital Setup Wizard
├─ Weeks 9-10:   Appointment Engine & Scheduling Services + Smart Confirmation Engine (NEW)
├─ Weeks 10-11:  Doctor Workspace & Clinical EMR
├─ Weeks 11-12:  EMR & Medical Records Management
├─ Weeks 12-14:  Patient Clinical Data Retrieval & Update Module (NEW)
├─ Week 15:      Notification Center & Scheduling
├─ Weeks 16-17:  Patient Portal & Family Profiles
├─ Weeks 18-19:  HMS Extended Modules & Operations
├─ Week 20:      Billing, Admin & SaaS Layer
├─ Week 21:      Infrastructure, DevOps & Observability
├─ Week 22:      Production Readiness & Pilot Hardening

PUBLIC LAUNCH TARGET (18 Weeks - Core Scope Go-Live)
├─ Phase 1:      Core Platform, Patients booking, and basic HMS
├─ Phase 2:      Doctor Identity, Doctor Discovery, Clinical Data Module, Bihar Pregnancy tracker, WhatsApp notifications
└─ Phase 3:      Pilot hospital onboarding
```