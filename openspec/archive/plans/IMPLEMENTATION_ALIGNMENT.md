# Haspataal Implementation Alignment (Hardened Edition)

## Existing Implementation Status

Based on codebase analysis, the database layer and core application modules have a robust schema foundation.

### ✅ Already Implemented (Database & Application Layers)

| Module | Status | Tables & Components Present |
|--------|--------|----------------------------|
| **Pregnancy Module** | ✅ Schema & UI Ready | PregnancyProfile, AncVisit, AncSupplementLog, McpCard, AncRetentionAlert, ReferralSlip, PartographRecord, NearMissAudit, NewbornRecord, ObstetricHistory |
| **Escalation/Retention** | ✅ Schema & Worker Ready | EscalationAlert (complete with hospital_id, patient_id, missedCount, acknowledgment, and queue processing worker) |
| **Follow-up** | ✅ Schema & Cron Ready | FollowUp (with hospital_id, patient_id, scheduledAt, status, and FollowUpWorker) |
| **Care Journey** | ✅ Schema Ready | CareJourney, RecoveryStep, EngagementLog, CareCheckIn, NudgeSchedule, MedicationPlan, FollowUpPlan, CareRedFlag |
| **Clinical Records** | ✅ Schema Ready | PatientRecord, ClinicalObservation, VisitNote, Visit, MedicalRecord |
| **Patient Clinical Data Module** | 🔄 Partial Schema | Patient, PatientProfile, PatientConsent, VitalSigns, ChiefComplaint, History, Examination, Diagnosis, Prescription, PrescriptionItem, Treatment, InvestigationOrder, LabResult, RadiologyOrder, ClinicalAttachment, CareJourney, TimelineEvent (tables exist but API, RBAC, CDS, Timeline, Event-driven updates missing) |
| **Notifications** | ✅ Schema & Meta API Ready | Notification (multi-channel: SMS, WhatsApp, Email), OutboxEvent, EventLog (integrated with Meta WhatsApp Business API) |
| **Audit/Consent** | ✅ Schema Ready | AuditLog, PatientConsent, OverrideLog |
| **Doctor Scheduling** | ✅ Schema & UI Ready | DoctorSchedule, DoctorSlot, DoctorSlotBlock, scheduling settings page |
| **Appointments** | ✅ Schema & API Ready | Appointment, Payment, WaitlistEntry, Slot |
| **Staff/RBAC** | ✅ Schema & Guards Ready | Staff (Role enum), HospitalRole, RolePermission, DoctorRole, role check middleware |
| **Doctor Identity** | 🔄 Partial Schema | Doctor (basic), DoctorProfile, DoctorSchedule, DoctorSlot, DoctorSlotBlock (core identity, education, qualifications, affiliations, verification missing) |
| **Doctor Discovery** | ❌ Not Started | DoctorSearchIndex, DoctorPublicProfile, HospitalLocation (aggregation service, public profiles, availability computation missing) |
| **Smart Confirmation** | ❌ Not Started | AppointmentConfirmation, AppointmentStatusHistory, ConfirmationTimer, RescheduleRequest (confirmation modes, timer, state machine missing) |
| **Billing** | ✅ Schema & Treasury Ready | Bill, Invoice, InvoiceLineItem, InvoicePayment, PharmacyDispense, Payment (supporting HSN code mapping and bank payouts) |
| **Facilities** | ✅ Schema Ready | HospitalFacilities (ICU, NICU, OT, emergency, pharmacy, lab) |
| **Insurance** | ✅ Schema Ready | InsuranceDetail, HospitalInsurance, TPA panel tie-ups |
| **Onboarding Wizard** | ✅ Wizard Framework Ready | Full-screen `/hospital/setup` wizard UI, granular stage components (Identity, Doctor, Dept, WA, Billing, Result), setup verification gate, and go-live UAT dashboard |

---

## 🔴 Platform Architecture Diagram

```text
                     API Gateway (gateway.haspataal.com)
                                      │
 ┌──────────────────────┬─────────────┴─────────────┬──────────────────────┐
 │                      │                           │                      │
Patient Portal    Doctor Workspace (Portal)    Hospital HMS           Admin Panel
 │                      │                           │                      │
 └──────────────────────┴─────────────┬─────────────┴──────────────────────┘
                                      │
                               Platform Services
                                      │
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ Auth (Identity)  │ Tenant          │ Workflow         │ Scheduler       │
 │ Notifications    │ Search          │ Audit            │ Analytics       │
 │ AI Engine        │ Billing         │ Storage          │ Master Data     │
 │ Configuration    │ CDS Layer       │ Events (Bus)     │ Cache Manager   │
 └─────────────────────────────────────────────────────────────────────────┘
                                      │
                              PostgreSQL + Redis
```

---

## 🔴 Missing P0 Modules (Launch Blockers)

### 1. Master Data Versioning
Healthcare master tables must support updates without breaking clinical records history.
- [ ] **Implementation Pipeline:** `MasterVersion → Import → Activate → Rollback`
- [ ] **Schema Support:** Create a `MasterVersion` table containing:
  - `id`: unique version identifier.
  - `effectiveDate`: activation timestamp.
  - `isDeprecated`: boolean flag marking old codes.
  - `rollbackVersionId`: self-referencing key for quick rollback executions.
- [ ] Implement query logic that references code descriptions based on the visit's timestamp rather than current active masters.

### 2. Clinical Decision Support (CDS) Layer (Deterministic Rules)
A safety validation layer that operates independently of AI modules to prevent clinical accidents:
- [ ] **Allergy Checks:** Cross-checks prescribed medications against patient allergy lists.
- [ ] **Drug-Drug Interactions:** Queries interaction catalog for safety alerts on simultaneous prescriptions.
- [ ] **Duplicate Therapy:** Flags if a drug in the same therapeutic class is already active.
- [ ] **Dosage Guardrails:** Validates maximum single and daily dosage limits based on patient age and weight.
- [ ] **Contraindications:** Blocks prescriptions marked as contraindicated during pregnancy, lactation, or renal impairment.

### 3. Core Workflow Epics & State Engines

#### A. Reusable State Workflow Engine
- [ ] Implement a generic `WorkflowEngine` to process and log state transitions:
  - **Appointment State Machine:** `Requested → Confirmed → Checked In → In Consultation → Completed → Follow-up`
  - **Pregnancy State Machine:** `Registered → ANC Trimesters → Delivery → Postnatal`
  - **Billing State Machine:** `State Machine:** `Draft → Issued → Paid → Refunded`

#### B. Pharmacy Workflow
- [ ] Implement the step-by-step dispensing loop:
  `Prescription Created → Pharmacist Verification → Stock Availability Check & Deduction → Bill Generation → Payment Collection → Patient Dispensation`

#### C. Laboratory Workflow
- [ ] Implement the sample collection loop:
  `Doctor Lab Order → Sample Collection (Barcode Generation) → Sample Processing → Results Verification → Report Approval → Patient Portal Upload & Notification`

#### D. Radiology Workflow
- [ ] Implement the imaging loop:
  `Doctor Radiology Order → Slot Scheduling → Scan Execution (DICOM upload) → Radiologist Reporting → Report Verification → Patient Portal Upload`

#### E. Admission (IPD) Workflow
- [ ] Implement the hospital admission loop:
  `OPD Consultation → Admission Recommendation → Bed Allocation → Ward Check-in → Ward Transfer Logs → Care Plan Execution → Discharge Summary → Treasury Clearance`

#### G. Doctor Identity & Hospital Affiliation Workflow
- [ ] Implement the doctor platform identity lifecycle:
  `Doctor Platform Registration → Personal Info → Education → Experience → Documents → Verification → Profile Complete → Hospital Invitation → Accept Affiliation → Hospital Confirms → ACTIVE`

#### H. Doctor Discovery, Public Profile & Availability Workflow
- [ ] Implement the doctor discovery lifecycle:
  `Doctor Verified → Profile 100% Complete → Affiliation ACTIVE → Hospital ACTIVE → Indexed into Doctor Discovery → Visible to Patients`
- [ ] Doctor Discovery Service aggregates verified doctor profiles and active hospital affiliations
- [ ] Patient Portal reads ONLY from Doctor Discovery Service (never directly queries hospital doctor records)
- [ ] Public Doctor Card: photo, name, qualification, specialty, super-specialty, designation, years of experience, languages, masked registration number, verification badge, rating, review count, consultation fee, available today, next available slot, book appointment button
- [ ] Hospital Affiliations: hospital name, logo, department, designation, fee, city, state, distance, Google Maps button, hospital verification badge
- [ ] Google Maps: store latitude, longitude, full address, city, state, place ID; generate maps URL dynamically
- [ ] Doctor Availability Service: compute from weekly OPD schedule, holiday calendar, active leave, existing appointments, slot capacity
- [ ] Leave Management: create leave (type, start/end, reason, visibility, recurring, approval) → hide slots, stop bookings, show "Doctor is on Leave", recommend alternatives
- [ ] OPD Schedule: weekly with morning/evening sessions, holiday overrides (festival, emergency, conference, vacation)
- [ ] Availability Status: Available, Limited Slots, Fully Booked, On Leave, Offline, Emergency Only (auto-calculated)
- [ ] Patient Search: by name, specialty, hospital, disease/symptoms, city, distance, language, gender, experience, rating, availability
- [ ] Search Filters: Available Today/Tomorrow, Teleconsultation, In-person, Nearest, Highest Rated, Lowest Fee, Most Experienced
- [ ] Unified Doctor Search Index: denormalized, updated on profile/qualification/affiliation/schedule/leave/hospital changes
- [ ] Alternative Doctor Suggestions: same department, same hospital first, then nearby affiliated hospitals, preserve specialty and mode
- [ ] Doctor Dashboard: manage profile, qualifications, experience, skills, affiliations, schedules, leaves, fees, availability, documents, analytics, reviews
- [ ] Database Schema: Doctor, DoctorProfile, DoctorQualification, DoctorExperience, DoctorSkill, DoctorCertification, DoctorAffiliation, Hospital, HospitalLocation, DoctorSchedule, DoctorLeave, DoctorAvailability, DoctorHoliday, DoctorAnalytics, DoctorReview, DoctorSearchIndex, DoctorPublicProfile
- [ ] Security: Only public info exposed (hide govt ID, personal address, documents, personal mobile, email, employment contracts, internal notes); audit logs; authorized users only access private data
- [ ] APIs: GET /doctors, /doctors/search, /doctors/{doctorId}, /doctors/{doctorId}/availability, /doctors/{doctorId}/affiliations, /hospitals/{hospitalId}/doctors; POST /doctors/schedule, /doctors/leave; PATCH /doctors/availability

#### I. Smart Confirmation Engine Workflow
- [ ] Implement configurable appointment confirmation: AUTO_ACCEPT, MANUAL_ACCEPT, AUTO_ACCEPT_WITH_RESCHEDULE
- [ ] Appointment States: AVAILABLE → BOOKED → PENDING_CONFIRMATION → CONFIRMED → CHECKED_IN → IN_CONSULTATION → COMPLETED → FOLLOW_UP (+ REJECTED, EXPIRED, CANCELLED, NO_SHOW, RESCHEDULE_REQUESTED, RESCHEDULE_ACCEPTED, RESCHEDULE_DECLINED)
- [ ] Manual Confirmation: booking → PENDING_CONFIRMATION → notification (Doctor App, HMS, WhatsApp, Email) → 60-min timer → accept/reject/reschedule/forward → patient notified
- [ ] Doctor Actions: Accept, Reject, Reschedule, Forward to colleague, Mark unavailable
- [ ] Notification Timeline: 0min booking, 15min reminder, 45min urgent, 55min final, 60min auto-expiry
- [ ] Patient Screen: Pending confirmation, countdown timer, doctor name, hospital, expected confirmation time, cancel option, suggested alternatives
- [ ] Doctor Dashboard: Pending requests with countdown, accept/reject/reschedule/forward buttons, priority indicator
- [ ] Hospital Dashboard: Pending confirmations, acceptance SLA, average response time, expired requests, doctor response rate
- [ ] Configuration: Hospital-level mode, doctor-level override, consultation type override, emergency bypass, max pending requests, auto expiry duration
- [ ] Department-Level Routing: Patient chooses department → if doctor unavailable → offer next available doctor in same department
- [ ] Smart Escalation: 30min → notify doctor again, 45min → notify dept coordinator, 55min → notify hospital admin → expire + recommend another doctor
- [ ] Live Queue Integration: Once accepted → queue generated → estimated waiting time → live queue position
- [ ] AI-Based Recommendations: On expiry → suggest same specialty, same hospital, nearest affiliated hospital, earliest available slot, highest-rated available doctor
- [ ] Database Schema: Appointment, AppointmentConfirmation, AppointmentStatusHistory, ConfirmationTimer, DoctorAvailability, RescheduleRequest, NotificationLog
- [ ] Domain Events: AppointmentRequested, ConfirmationRequested, ReminderSent, AppointmentConfirmed, AppointmentRejected, AppointmentExpired, AppointmentRescheduled, AppointmentForwarded
- [ ] Security: Only assigned doctor may confirm, hospital admins may override, all actions audited, all status transitions immutable
- [ ] KPIs: Average confirmation time, acceptance rate, expiry rate, reschedule rate, doctor response SLA, patient cancellation rate

---

## ⚙️ Platform Infrastructure Gaps

### 1. Feature Configuration Service
- [ ] Implement a dynamic configuration engine supporting runtime feature-toggles scoped by:
  `Feature Flag → Enabled status → Hospital ID → Department ID → Doctor ID`
  This permits gradual features rollouts (e.g., enable SOAP AI drafting for specific doctors).

### 2. API Gateway (`gateway.haspataal.com`)
- [ ] Configure the gateway to execute:
  - Centralized JWT verification and tenant lookup.
  - Rate limiting (ioredis sliding-window).
  - Trace ID header injection for distributed logs tracking.
  - Circuit Breakers: Automatically fail-fast downstream if billing/notifications are unresponsive.

### 3. Distributed Cache Strategy
- [ ] Implement caching rules using Redis:
  - **TTL & Invalidation:** Standardize TTL on cached targets.
  - **Patient Cache:** Cache profile summaries (invalidated on vital/EMR writes).
  - **Search Cache:** Cache doctor search results (1-hour TTL).
  - **Master Data Cache:** Cache ICD-10 and Drug masters (invalidated only on MasterVersion activation).

### 4. Distributed Tracing & Observability
- [ ] **Trace ID Correlation:** Every request gets a trace ID at the Gateway.
- [ ] **Span Tracking:** Track transaction spans:
  `Gateway → Booking API → BullMQ Queue → Notification Service → WhatsApp API`
  Ensure the correlation ID is printed across all service Pinot logs.

### 5. AI Safety & Guardrails Layer
- [ ] **Patient AI:** Hardcode disclaimers on all outputs; block diagnostic/prescription drafting prompts; escalate emergencies.
- [ ] **Doctor AI:** Mark all summaries/drafts as recommendations requiring explicit doctor verification and sign-off.
- [ ] **Hospital/Admin AI:** Implement data-masking middleware to strip Personally Identifiable Information (PII) and PHI before sending prompts to external LLMs.
- [ ] **Patient AI - Prescription/Lab Explainer:** Generate patient-friendly explanations with mandatory medical disclaimers.
- [ ] **Doctor AI - SOAP Drafting:** Auto-generate SOAP notes from consultation input.
- [ ] **Doctor AI - ICD-10 Suggestions:** Suggest ICD-10 codes based on clinical notes.
- [ ] **Doctor AI - Clinical Summary:** Generate discharge/visit summaries.
- [ ] **Hospital AI - Capacity/No-show/Retention:** Predictive analytics for operations.

### 6. Universal Search Architecture
- [ ] Implement a search index strategy for:
  - Patients (fuzzy index on name + mobile).
  - Doctors & Hospitals (specialty + city index).
  - Medicines (molecules + brand names).
  - EMR Records (Timeline, prescriptions, lab results).
  - **QR Medical Card scan lookup.**
  - **ABHA ID lookup (future).**

### 7. SaaS Billing & Usage Analytics
- [ ] **Quota Tracking:** Track usage metrics per hospital tenant:
  - Number of onboarded doctors/staff.
  - Active patient registrations.
  - S3/R2 storage capacity used (MB).
  - Outbound SMS & WhatsApp messages sent.
  - AI engine tokens consumed.
- [ ] **Automation:** Auto-generate SaaS invoices and trigger renewal notifications based on quota limits.

### 8. Patient Clinical Data Retrieval & Update Module (NEW - P0 Launch Blocker)
Core clinical data layer enabling secure retrieval and updating of patient clinical information across the Haspataal ecosystem.

- [ ] **Patient Registration:** OTP verification, demographics, ABHA ID linking, consent capture, audit entry.
- [ ] **Multi-Method Patient Lookup:** Mobile, Patient ID, QR Medical Card, ABHA ID, Appointment Token, Hospital MRN with role-based verification (Reception: mobile+DOB, Doctor: active appointment, Emergency: override with audit).
- [ ] **Privacy-Aware Patient Summary:** Clinician view (name, age, gender, blood group, allergies, chronic diseases, pregnancy status, medications, alerts, recent visits, care journey) with PII hidden by default (address, Aadhaar, payment, family contacts, notes).
- [ ] **Clinical Record Updates:** Vitals, Chief Complaints (multi, duration, severity, priority), History (HPI, PMH, family, drug, allergy, immunization, social), Examination (general, systemic, pediatric, obstetric, neurological), Diagnosis (primary/secondary, ICD-10, differential), Orders (lab, radiology, procedures, referrals), Prescriptions (drug, dose, route, frequency, duration, instructions, PRN), Treatments (IV, nebulization, vaccination, injection, procedures), Follow-up (review date, care journey, escalation risk, retention rules).
- [ ] **Clinical Timeline:** Auto-generated chronological timeline from all events (Appointment Booked → Vitals → Consultation → Prescription → Lab → Billing → Follow-up → Retention).
- [ ] **Role-Based Access:** Patient (own), Reception (demographics/appointments), Doctor (clinical/prescriptions/investigations), Nurse (vitals/notes/meds), Lab Tech (orders/results), Radio Tech (orders/reports), Pharmacist (meds/dispensing), Hospital Admin (operational), Platform Admin (system).
- [ ] **Patient Consent Management:** Types (Clinical Care, AI Assistance, Record Sharing, Research, Notifications, Emergency Override) - versioned, timestamped, revocable, audited.
- [ ] **Notifications:** Appointment, Prescription Ready, Lab Report Ready, Follow-up, Pregnancy, Vaccination, Medicine, Retention Alert.
- [ ] **Audit Logging:** User, Role, Hospital, Patient, Action, IP, Device, Timestamp, Reason, Old Value, New Value.
- [ ] **Database Schema:** Patient, PatientProfile, PatientConsent, Visit, Appointment, VitalSigns, ChiefComplaint, History, Examination, Diagnosis, Prescription, PrescriptionItem, Treatment, InvestigationOrder, LabResult, RadiologyOrder, ClinicalAttachment, CareJourney, TimelineEvent, Notification, AuditLog, EventLog, OutboxEvent.
- [ ] **Security:** Multi-tenant RLS, AES-256, JWT, Refresh Tokens, MFA, Rate Limiting, CSRF, CSP, Helmet, Secure Cookies, Request IDs, Virus Scanning, Signed URLs, OWASP API Top 10.

#### 8.1 Patient Timeline (Flagship Feature)
- [ ] Unified chronological timeline: Registrations, OPD visits, IPD admissions, Prescriptions, Lab reports, Radiology, Pregnancy milestones, Vaccinations, Billing events, Follow-ups, Care journey milestones.
- [ ] Patient-owned lifelong health record view.
- [ ] Offline QR Medical Card with emergency data.

#### 8.2 Clinical Decision Support (Deterministic Safety Layer - Separate from AI)
- [ ] Drug-drug interaction detection.
- [ ] Drug allergy alerts.
- [ ] Pregnancy contraindication warnings.
- [ ] Pediatric maximum dose validation.
- [ ] Renal/hepatic dose adjustment checks.
- [ ] Duplicate medication detection.

#### 8.3 Multi-Tenant Data Isolation
- [ ] Platform DB: Identity, Authentication, Consent, Linked Hospitals.
- [ ] Hospital DB: Encounters, EMR, Prescriptions, Investigations, Billing.
- [ ] Cross-hospital sharing via explicit patient consent.

#### 8.4 Event-Driven Architecture
- [ ] Domain events: PatientRegistered, AppointmentBooked, VisitStarted, VitalsRecorded, PrescriptionCreated, InvestigationOrdered, VisitCompleted, FollowUpScheduled.
- [ ] Event bus integration for notifications, analytics, AI, retention modules.
- [ ] Outbox pattern for reliable event publishing.

### 9. Doctor Identity & Hospital Affiliation Module (NEW - P0 Launch Blocker)
Platform-wide verified doctor identity supporting multi-hospital practice.

- [ ] **Doctor Platform Registration:** Mobile OTP, email, password → DRAFT status.
- [ ] **Personal Information:** Name, gender, DOB, photo, languages, bio, designation, medical council registration (number, council, validity).
- [ ] **Education Records:** UG (MBBS), PG, Super-specialty (DM/MCh/DNB SS/FNB), Diplomas, Fellowships.
- [ ] **Certifications & Skills:** Certifications (course, authority, number, expiry), skills (NICU, PICU, Ventilator, etc.).
- [ ] **Professional Memberships & Publications:** IAP, IMA, NNF, FOGSI, API, RSSDI; publications (journal, DOI), awards, conferences.
- [ ] **Licenses:** State Medical Council, NMC, International.
- [ ] **Professional Experience:** Hospital, designation, department, dates, responsibilities.
- [ ] **Document Upload:** MBBS, PG, SS, registration, govt ID, experience letters, photo → encrypted storage.
- [ ] **Verification Workflow:** Status transitions: DOCUMENT_PENDING → UNDER_VERIFICATION → VERIFIED/REJECTED.
- [ ] **Profile Completion Gates:** Mandatory fields (Personal, Medical Registration, MBBS, PG, Experience, Govt ID, Photo, ≥1 Skill, Designation) → 100% complete = ACTIVE.
- [ ] **Hospital Affiliation Workflow:** Hospital searches → invites → doctor accepts → hospital confirms → ACTIVE.
- [ ] **Hospital-Specific Data:** Department, specialty, consultation fee, duration, working days/hours, teleconsultation, leave calendar, room, token rules.
- [ ] **Doctor Dashboard:** Profile completion, verification, affiliations, appointments, patients, consultations, analytics, revenue, reviews, public profile, documents.
- [ ] **Public vs Private Profile:** Public (patient-facing): name, qualifications, specialties, experience, languages, affiliations, availability. Private (hospital/platform): govt ID, registration docs, employment history, internal notes, verification metadata.
- [ ] **Credential Verification Layer:** Self-declared → Uploaded → Verified by Haspataal → Verified with Authority → Expired.
- [ ] **Credential Expiry Monitoring:** Auto-notify before registration, fellowship, certification, training expiry.
- [ ] **Database Schema:** Doctor, DoctorProfile, DoctorEducation, DoctorQualification, DoctorSkill, DoctorCertification, DoctorMembership, DoctorPublication, DoctorAward, DoctorConference, DoctorExperience, DoctorDocument, DoctorVerification, DoctorAffiliation, DoctorSchedule, DoctorDepartment, DoctorLeave, DoctorAnalytics, DoctorReview (18 tables).
- [ ] **Doctor Status Flow:** DRAFT → PROFILE_INCOMPLETE → DOCUMENT_PENDING → UNDER_VERIFICATION → VERIFIED → ACTIVE → SUSPENDED → ARCHIVED.
- [ ] **Affiliation Status Flow:** INVITED → PENDING → ACCEPTED → ACTIVE → ON_LEAVE → TERMINATED.
- [ ] **Validation Rules:** Hospital cannot create/edit doctor personal qualifications; Hospital can edit only schedule, fees, departments, availability, role, notes.
- [ ] **Security:** Platform identity, multi-hospital support, audit logs, document encryption (AES-256), RBAC, MFA, digital signatures, RLS, consent tracking, immutable qualification records.
- [ ] **APIs:** POST /doctors/register, /profile, /education, /experience, /documents, /verify, /invite, /accept-affiliation; GET /doctors/search, /dashboard.

### 10. Doctor Discovery, Public Profile & Availability Module (NEW - P0 Launch Blocker)
Doctor discovery service enabling patient portal to discover verified doctors with active hospital affiliations.

- [ ] **Doctor Discovery Service:** Aggregates verified doctor profiles and active hospital affiliations. Patient Portal reads ONLY from this service (never directly queries hospital doctor records).
- [ ] **Automatic Indexing:** IF doctor VERIFIED AND profile 100% complete AND affiliation ACTIVE AND hospital ACTIVE → publish to Patient Portal. If verification expires → hide automatically.
- [ ] **Public Doctor Card:** Photo, full name, qualification, specialty, super-specialty, designation, years of experience, languages, masked registration number, verification badge, rating, review count, consultation fee, available today, next available slot, book appointment button.
- [ ] **Hospital Affiliations Display:** Hospital name, logo, department, designation, consultation fee, hospital city, state, distance, Google Maps button, hospital verification badge.
- [ ] **Google Maps Integration:** Store latitude, longitude, full address, city, state, place ID; generate maps URL dynamically.
- [ ] **Doctor Availability Service:** Compute from weekly OPD schedule, holiday calendar, active leave, existing appointments, slot capacity (avoid stale data).
- [ ] **Doctor Controls:** Working days, morning/evening sessions, slot duration, max patients, break times, teleconsultation, walk-in allowed.
- [ ] **Leave Management:** Create leave (type, start/end date, reason, visibility, recurring, approval); when active → hide slots, stop bookings, show "Doctor is on Leave", recommend alternatives.
- [ ] **OPD Schedule:** Weekly schedule with morning/evening sessions, holiday overrides (festival, emergency closure, conference, vacation).
- [ ] **Availability Status:** Available, Limited Slots, Fully Booked, On Leave, Offline, Emergency Only (auto-calculated).
- [ ] **Patient Search:** By doctor name, specialty, hospital, disease/symptoms, city, distance, language, gender, experience, rating, availability.
- [ ] **Search Filters:** Available Today, Available Tomorrow, Teleconsultation, In-person, Nearest, Highest Rated, Lowest Fee, Most Experienced.
- [ ] **Unified Doctor Search Index:** Denormalized index updated whenever doctor profile changes, qualification verified, affiliation changes, OPD timings change, leave status changes, hospital status changes.
- [ ] **Alternative Doctor Suggestions:** When doctor on leave/fully booked → recommend same department, same hospital first, then nearby affiliated hospitals, preserve specialty and consultation mode.
- [ ] **Doctor Dashboard:** Manage profile, qualifications, experience, skills, affiliations, schedules, leaves, consultation fees, availability, documents, analytics, reviews.
- [ ] **Database Schema:** Doctor, DoctorProfile, DoctorQualification, DoctorExperience, DoctorSkill, DoctorCertification, DoctorAffiliation, Hospital, HospitalLocation, DoctorSchedule, DoctorLeave, DoctorAvailability, DoctorHoliday, DoctorAnalytics, DoctorReview, DoctorSearchIndex, DoctorPublicProfile.
- [ ] **Security:** Only public information exposed (hide government ID, personal address, documents, personal mobile, email, employment contracts, internal notes); audit logs; authorized users only access private data.
- [ ] **APIs:** GET /doctors, /doctors/search, /doctors/{doctorId}, /doctors/{doctorId}/availability, /doctors/{doctorId}/affiliations, /hospitals/{hospitalId}/doctors; POST /doctors/schedule, /doctors/leave; PATCH /doctors/availability.

### 11. Smart Confirmation Engine (NEW - P0 Launch Blocker)
Configurable appointment confirmation workflows balancing patient experience with clinician availability.

- [ ] **Confirmation Modes:** AUTO_ACCEPT (default for hospital OPDs), MANUAL_ACCEPT (private/visiting/super specialists, teleconsultation), AUTO_ACCEPT_WITH_RESCHEDULE (hospitals where doctor may reschedule).
- [ ] **Appointment States:** AVAILABLE → BOOKED → PENDING_CONFIRMATION → CONFIRMED → CHECKED_IN → IN_CONSULTATION → COMPLETED → FOLLOW_UP (plus REJECTED, EXPIRED, CANCELLED, NO_SHOW, RESCHEDULE_REQUESTED, RESCHEDULE_ACCEPTED, RESCHEDULE_DECLINED).
- [ ] **Manual Confirmation Workflow:** Patient books → PENDING_CONFIRMATION → notification (Doctor App, Hospital HMS, WhatsApp, Email) → 60-min timer → accept/reject/reschedule/forward → patient notified. On timeout → EXPIRED → slot released → alternative doctors suggested.
- [ ] **Doctor Actions:** Accept, Reject, Reschedule, Forward to colleague, Mark unavailable.
- [ ] **Notification Timeline:** 0min booking notification, 15min reminder, 45min urgent reminder, 55min final reminder, 60min auto-expiry.
- [ ] **Patient Screen:** Pending confirmation, countdown timer, doctor name, hospital, expected confirmation time, cancel option, suggested alternatives.
- [ ] **Doctor Dashboard:** Pending requests with countdown, accept/reject/reschedule/forward buttons, priority indicator.
- [ ] **Hospital Dashboard:** Pending confirmations, acceptance SLA, average response time, expired requests, doctor response rate.
- [ ] **Configuration:** Hospital-level confirmation mode, doctor-level override, consultation type override, emergency bypass, max pending requests, auto expiry duration.
- [ ] **Department-Level Routing:** Patient chooses department → if doctor unavailable → offer next available doctor in same department.
- [ ] **Smart Escalation:** 30min → notify doctor again, 45min → notify department coordinator, 55min → notify hospital admin → expire + recommend another doctor.
- [ ] **Live Queue Integration:** Once accepted → queue generated → estimated waiting time → live queue position.
- [ ] **AI-Based Recommendations:** On expiry → suggest same specialty, same hospital, nearest affiliated hospital, earliest available slot, highest-rated available doctor.
- [ ] **Database Schema:** Appointment, AppointmentConfirmation, AppointmentStatusHistory, ConfirmationTimer, DoctorAvailability, RescheduleRequest, NotificationLog.
- [ ] **Domain Events:** AppointmentRequested, ConfirmationRequested, ReminderSent, AppointmentConfirmed, AppointmentRejected, AppointmentExpired, AppointmentRescheduled, AppointmentForwarded.
- [ ] **Security:** Only assigned doctor may confirm, hospital admins may override, all actions audited, all status transitions immutable.
- [ ] **KPIs:** Average confirmation time, acceptance rate, expiry rate, reschedule rate, doctor response SLA, patient cancellation rate.

---

## 🇮🇳 Indian Compliance & Consents Layer

To prepare Haspataal for a compliant launch under Indian regulations:

- [ ] **DPDP Act (Digital Personal Data Protection):**
  - Implement granular consent checkboxes for data processing.
  - Build a data export utility for patients (Right to Data Portability).
  - Implement a data erasure workflow (Right to Erasure / Forgotten).
  - Create a "Legal Hold" mechanism to override erasure if records are under audit.
- [ ] **Consent Versioning:** Track active versions of the Privacy Policy and terms accepted by each patient/hospital admin.
- [ ] **ABDM Readiness:** Prepare FHIR R4 schema structures to support easy linking with India's ABDM health lockers.

---

## 🗓️ Dual Timeline & Launch Gate Strategy

### 1. Timeline Split
To satisfy launch timelines, separate development cycles:

```text
ENGINEERING PIPELINE (25 Weeks - Full Production Build)
├─ Weeks 1-3:    Foundation, Multi-Tenant Core & Shared Packages
├─ Weeks 4-5:    Authentication, Security & Accounts
├─ Weeks 5-7:    Doctor Identity & Hospital Affiliation Module (NEW)
├─ Weeks 7-8:    Doctor Discovery, Public Profile & Availability Module (NEW)
├─ Week 8:       Onboarding & Hospital Setup Wizard
├─ Weeks 9-10:   Appointment Engine, Scheduling + Smart Confirmation Engine (NEW)
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

### 2. Go-Live Gate (Definition of Launch)
Before declaring Haspataal active for public launch, require:

- [ ] **Active Pilot:** 1 physical hospital clinic fully executing queue workflows.
- [ ] **Staff Volume:** At least 10 doctors, 100 patient profiles, and 1,000 appointment tokens processed.
- [ ] **UAT Pass:** Written sign-offs from doctor, nurse, receptionist, and patient actors.
- [ ] **Compliance & Security:** Completed pen-testing, RLS validation, and DPDP consent logs active.
- [ ] **Operations:** Support desk ticketing system configured and backup recovery SLAs (<30 mins) verified.