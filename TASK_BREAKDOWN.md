# Haspataal Master Task Breakdown & Workflow Epics

A production-ready healthcare SaaS roadmap optimized for a successful 3-month launch.

---

## 🏗️ Workflow-Based Epics (End-to-End Journeys)

These workflow-based epics ensure clinical and operational continuity across system boundaries.

### Epic 1: The Patient Outpatient (OPD) Journey
`Registration → Appointment → Check-in → Consultation → Prescription → Billing → Follow-up`
- [x] Walk-in and online patient registration
- [x] Slot checking and appointment booking
- [x] Patient check-in and queue token generation
- [ ] Consultation queue visualization and routing to doctor
- [ ] Digital prescription generation with drug interaction checks
- [ ] Consolidated billing (consultation + pharmacy + lab) and receipting
- [x] Post-consultation follow-up scheduling

### Epic 2: The Doctor Consultation Workflow
`Login → Queue → Consultation → Prescription → Investigation → Follow-up`
- [x] Secure doctor login and role enforcement
- [ ] Active patient queue management with status indicators (waiting, in-consultation, completed)
- [ ] Longitudinal patient timeline display
- [ ] Medical record and history review
- [ ] Dynamic prescription writing with autocomplete and ICD-10 indexing
- [ ] Lab and radiology investigation ordering
- [ ] Slot blocking for leave and schedule override updates

### Epic 3: The Reception Desk Workflow
`Register → Token → Queue → Billing → Receipt`
- [x] New patient registration screen
- [ ] Advanced patient search (fuzzy + phonetic name matching)
- [ ] Duplicate detection based on Aadhaar, ABHA, mobile, or demographics
- [ ] Walk-in and emergency registration fast-track
- [ ] Convert online appointments to active visits on check-in
- [ ] Issue print/digital queue tokens
- [ ] Cashier checkout integration and printing physical bills

### Epic 4: Bihar Maternal Health (MCH) Workflow
`Registration → ANC → Labs → Scans → Vaccination → Delivery → Postnatal`
- [x] ABDM-compliant registration with ABHA ID
- [x] MoHFW-compliant digital MCP Card generation
- [x] Multi-trimester ANC visit scheduler
- [x] High-risk auto-flagging and triage alerts
- [x] Growth charting (ICMR norms) and BP trend analysis
- [x] Government scheme tracking (JSY/PMMVY eligibility)
- [x] Postnatal care scheduling and newborn record auto-creation

### Epic 5: Chronic Disease Care Workflow
`Registration → Care Plan → Follow-up → Reminder → Retention → Analytics`
- [x] Chronic care plan creation (diabetes, hypertension, etc.)
- [x] Care team assignments and patient scheduling
- [x] Missed follow-up automatic detection
- [x] WhatsApp/SMS follow-up notification dispatch
- [x] 2x missed follow-up escalation to Treating Doctor
- [x] Doctor acknowledgment flow and resolution logging

### Epic 6: Patient Clinical Data Retrieval & Update Module
`Registration → Lookup → Summary → Clinical Update → Timeline → Consent → Audit`
- [ ] Patient registration with OTP, demographics, ABHA ID, consent capture
- [ ] Multi-method patient lookup (Mobile, ID, QR, ABHA, MRN, Token)
- [ ] Privacy-aware patient summary (clinician view vs hidden PII)
- [ ] Clinical record updates: Vitals, Chief Complaints, History, Examination, Diagnosis, Orders, Prescriptions, Treatments, Follow-ups, Care Journey
- [ ] Longitudinal clinical timeline (auto-generated from all events)
- [ ] Role-based access control (Patient, Reception, Doctor, Nurse, Lab, Radio, Pharmacist, Admin)
- [ ] Patient consent management (versioned, timestamped, revocable, audited)
- [ ] Notification triggers (appointment, prescription, lab, follow-up, pregnancy, vaccination, medicine, retention)
- [ ] Comprehensive audit logging (user, role, hospital, patient, action, IP, device, timestamp, reason, old/new values)
- [ ] AI integration: Patient AI (explainers), Doctor AI (SOAP, ICD, summary), Hospital AI (capacity, no-show, retention)
- [ ] REST API endpoints for all operations
- [ ] Database schema: Patient, Profile, Consent, Visit, Appointment, Vitals, Complaints, History, Examination, Diagnosis, Prescription, Treatment, Investigation, Attachment, CareJourney, Timeline, Notification, AuditLog, EventLog, OutboxEvent
- [ ] Security: Multi-tenant RLS, AES-256, JWT, MFA, Rate Limiting, CSRF, CSP, Helmet, Secure Cookies, Request IDs, Virus Scanning, Signed URLs, OWASP API Top 10

#### 6.1 Patient Timeline (Flagship Feature)
- [ ] Unified chronological timeline: Registrations, OPD visits, IPD admissions, Prescriptions, Lab reports, Radiology, Pregnancy milestones, Vaccinations, Billing events, Follow-ups, Care journey milestones
- [ ] Patient-owned lifelong health record view
- [ ] Offline QR Medical Card with emergency data

#### 6.2 Clinical Decision Support (Deterministic Safety Layer)
- [ ] Drug-drug interaction detection
- [ ] Drug allergy alerts
- [ ] Pregnancy contraindication warnings
- [ ] Pediatric maximum dose validation
- [ ] Renal/hepatic dose adjustment checks
- [ ] Duplicate medication detection

#### 6.3 Multi-Tenant Data Isolation
- [ ] Platform-level identity, authentication, consent, linked hospitals
- [ ] Hospital-scoped clinical records (encounters, EMR, prescriptions, investigations, billing)
- [ ] Explicit patient consent for cross-provider record sharing

#### 6.4 Event-Driven Architecture
- [ ] Domain events: PatientRegistered, AppointmentBooked, VisitStarted, VitalsRecorded, PrescriptionCreated, InvestigationOrdered, VisitCompleted, FollowUpScheduled
- [ ] Event bus integration for notifications, analytics, AI, retention modules
- [ ] Outbox pattern for reliable event publishing

### Epic 7: Doctor Identity & Hospital Affiliation Module
`Registration → Profile → Education → Experience → Documents → Verification → Affiliation`
- [ ] Doctor platform registration with OTP, email, password (DRAFT status)
- [ ] Personal information capture (name, gender, DOB, photo, languages, bio, designation)
- [ ] Medical council registration (number, council, validity)
- [ ] Education records (UG, PG, Super-specialty, Diploma, Fellowships)
- [ ] Certifications, skills, professional memberships
- [ ] Publications, awards, conferences
- [ ] Licenses (state, NMC, international)
- [ ] Professional experience (hospital, designation, department, dates, responsibilities)
- [ ] Document upload (MBBS, PG, SS, registration, govt ID, experience letters, photo)
- [ ] Verification workflow (pending → verified → rejected)
- [ ] Profile completion validation (100% mandatory fields required for ACTIVE)
- [ ] Hospital affiliation workflow (hospital searches → invites → doctor accepts → hospital confirms → ACTIVE)
- [ ] Hospital-specific data: department, specialty, consultation fee, duration, working days/hours, teleconsultation, leave calendar, room allocation, token rules
- [ ] Doctor dashboard: profile completion, verification, affiliations, appointments, patients, consultations, analytics, revenue, reviews, public profile, documents
- [ ] Public profile (patient-facing) vs Private profile (hospital/platform only)
- [ ] Credential verification layer (self-declared → uploaded → verified by Haspataal → verified with authority → expired)
- [ ] Credential expiry monitoring (registration, fellowship, certification, training renewals)
- [ ] Database schema: Doctor, DoctorProfile, DoctorEducation, DoctorQualification, DoctorSkill, DoctorCertification, DoctorMembership, DoctorPublication, DoctorAward, DoctorConference, DoctorExperience, DoctorDocument, DoctorVerification, DoctorAffiliation, DoctorSchedule, DoctorDepartment, DoctorLeave, DoctorAnalytics, DoctorReview
- [ ] Security: Platform identity, multi-hospital support, audit logs, document encryption, RBAC, MFA, digital signatures, RLS, consent tracking, immutable qualification records
- [ ] APIs: register, profile, education, experience, documents, verify, search, invite, accept-affiliation, dashboard

### Epic 8: Doctor Discovery, Public Profile & Availability Module
`Verification → Discovery → Public Profile → Availability → Search → Book`
- [ ] Doctor Discovery Service (aggregates verified doctor profiles and active hospital affiliations)
- [ ] Automatic indexing: IF doctor VERIFIED AND profile 100% complete AND affiliation ACTIVE AND hospital ACTIVE → publish to Patient Portal
- [ ] Public Doctor Card: photo, name, qualification, specialty, super-specialty, designation, years of experience, languages, masked registration number, verification badge, rating, review count, consultation fee, available today, next available slot, book appointment button
- [ ] Hospital Affiliations display: hospital name, logo, department, designation, consultation fee, city, state, distance, Google Maps button, hospital verification badge
- [ ] Google Maps integration: store latitude, longitude, full address, city, state, place ID; generate maps URL dynamically
- [ ] Doctor Availability Service: compute from weekly OPD schedule, holiday calendar, active leave, existing appointments, slot capacity
- [ ] Doctor controls: working days, morning/evening sessions, slot duration, max patients, break times, teleconsultation, walk-in allowed
- [ ] Leave Management: create leave (type, start/end date, reason, visibility, recurring, approval); when active → hide slots, stop bookings, show "Doctor is on Leave", recommend alternatives
- [ ] OPD Schedule: weekly schedule with morning/evening sessions, holiday overrides (festival, emergency closure, conference, vacation)
- [ ] Availability Status: Available, Limited Slots, Fully Booked, On Leave, Offline, Emergency Only (auto-calculated)
- [ ] Patient Search: by doctor name, specialty, hospital, disease/symptoms, city, distance, language, gender, experience, rating, availability
- [ ] Search Filters: Available Today, Available Tomorrow, Teleconsultation, In-person, Nearest, Highest Rated, Lowest Fee, Most Experienced
- [ ] Unified Doctor Search Index: denormalized index updated on profile change, qualification verification, affiliation change, OPD timing change, leave status change, hospital status change
- [ ] Alternative Doctor Suggestions: when doctor on leave/fully booked → recommend same department, same hospital first, then nearby affiliated hospitals, preserve specialty and consultation mode
- [ ] Doctor Dashboard: manage profile, qualifications, experience, skills, affiliations, schedules, leaves, consultation fees, availability, documents, analytics, reviews
- [ ] Database Schema: Doctor, DoctorProfile, DoctorQualification, DoctorExperience, DoctorSkill, DoctorCertification, DoctorAffiliation, Hospital, HospitalLocation, DoctorSchedule, DoctorLeave, DoctorAvailability, DoctorHoliday, DoctorAnalytics, DoctorReview, DoctorSearchIndex, DoctorPublicProfile
- [ ] Security: Only public information exposed (hide government ID, personal address, documents, personal mobile, email, employment contracts, internal notes); audit logs; authorized users only access private data
- [ ] APIs: GET /doctors, /doctors/search, /doctors/{doctorId}, /doctors/{doctorId}/availability, /doctors/{doctorId}/affiliations, /hospitals/{hospitalId}/doctors; POST /doctors/schedule, /doctors/leave; PATCH /doctors/availability

### Epic 9: Smart Confirmation Engine
`Book → Auto/Manual Confirm → Notify → Queue → Timeout → Alternative`
- [ ] Configurable confirmation modes per hospital/doctor: AUTO_ACCEPT, MANUAL_ACCEPT, AUTO_ACCEPT_WITH_RESCHEDULE
- [ ] AUTO_ACCEPT: Patient books → system checks availability → appointment confirmed immediately → doctor notified
- [ ] MANUAL_ACCEPT: Patient books → PENDING_CONFIRMATION → doctor notified → 60-minute countdown → accept/reject → slot released on timeout → alternative doctors suggested
- [ ] AUTO_ACCEPT_WITH_RESCHEDULE: Auto-confirm → doctor may request new time → patient approves revised slot
- [ ] Appointment States: AVAILABLE → BOOKED → PENDING_CONFIRMATION → CONFIRMED → CHECKED_IN → IN_CONSULTATION → COMPLETED → FOLLOW_UP (plus REJECTED, EXPIRED, CANCELLED, NO_SHOW, RESCHEDULE_REQUESTED, RESCHEDULE_ACCEPTED, RESCHEDULE_DECLINED)
- [ ] Manual Confirmation Workflow: booking → PENDING_CONFIRMATION → notification (Doctor App, Hospital HMS, WhatsApp, Email) → 60-min timer → accept/reject/reschedule/forward → patient notified
- [ ] Doctor Actions: Accept, Reject, Reschedule, Forward to colleague, Mark unavailable
- [ ] Notification Timeline: 0min booking, 15min reminder, 45min urgent, 55min final, 60min auto-expiry
- [ ] Patient Screen: Pending confirmation, countdown timer, doctor name, hospital, expected confirmation time, cancel option, suggested alternatives
- [ ] Doctor Dashboard: Pending requests with countdown, accept/reject/reschedule/forward buttons, priority indicator
- [ ] Hospital Dashboard: Pending confirmations, acceptance SLA, average response time, expired requests, doctor response rate
- [ ] Configuration: Hospital-level confirmation mode, doctor-level override, consultation type override, emergency bypass, max pending requests, auto expiry duration
- [ ] Department-Level Routing: Patient chooses department → if doctor unavailable → offer next available doctor in same department
- [ ] Smart Escalation: 30min → notify doctor again, 45min → notify department coordinator, 55min → notify hospital admin → expire + recommend another doctor
- [ ] Live Queue Integration: Once accepted → queue generated → estimated waiting time → live queue position
- [ ] AI-Based Recommendations: On expiry → suggest same specialty, same hospital, nearest affiliated hospital, earliest available slot, highest-rated available doctor
- [ ] Database Schema: Appointment, AppointmentConfirmation, AppointmentStatusHistory, ConfirmationTimer, DoctorAvailability, RescheduleRequest, NotificationLog
- [ ] Domain Events: AppointmentRequested, ConfirmationRequested, ReminderSent, AppointmentConfirmed, AppointmentRejected, AppointmentExpired, AppointmentRescheduled, AppointmentForwarded
- [ ] Security: Only assigned doctor may confirm, hospital admins may override, all actions audited, all status transitions immutable
- [ ] KPIs: Average confirmation time, acceptance rate, expiry rate, reschedule rate, doctor response SLA, patient cancellation rate

---

## 📅 Phased Task Breakdown & Implementation Roadmap

### Phase 1: Foundation, Multi-Tenant Core & Shared Packages (Weeks 1-3)

#### 1.1 Multi-Tenant Database Setup
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| MT1.1 | Add hospital_id to ALL tables | - [x] Audit all tables for tenant scoping<br>- [x] Add hospital_id columns<br>- [x] Create migration scripts<br>- [x] Add foreign key constraints<br>- [x] Test cross-hospital queries | 12h | P0 |
| MT1.2 | Tenant context provider | - [x] Create tenant context hook<br>- [x] Add middleware for hospital scoping<br>- [x] Implement hospital lookup<br>- [x] Add caching<br>- [x] Test context isolation | 8h | P0 |
| MT1.3 | Hospital settings schema | - [x] Create hospital_settings table<br>- [x] Add branding fields<br>- [x] Add operational settings<br>- [x] Create API endpoints<br>- [x] Add validation | 8h | P0 |

#### 1.2 RBAC Implementation
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| RBAC1.1 | Define all 11 roles | - [x] Super Admin, Hospital Admin, Doctor, Receptionist, Nurse, Pharmacist, Lab Tech, Radiology Tech, Accountant, Resident, Patient roles | 12h | P0 |
| RBAC1.2 | Permission matrix | - [x] Define CRUD permissions per role<br>- [x] Create permissions table<br>- [x] Add role-permission mapping<br>- [x] Implement guard middleware<br>- [x] Create test matrix | 10h | P0 |
| RBAC1.3 | API permission guards | - [x] Create auth middleware<br>- [x] Add role checks to all routes<br>- [x] Implement permission decorator<br>- [x] Add 403 handling<br>- [x] Create audit logging | 10h | P0 |

#### 1.3 Database Entities (20+ tables)
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| DB1.1 | Core entities | - [x] Departments table<br>- [x] Specialties table<br>- [x] Slots/Shifts/Tokens tables<br>- [x] Visits table<br>- [x] Vitals table | 15h | P0 |
| DB1.2 | Clinical entities | - [x] Diagnoses table + ICD-10 codes<br>- [x] Medicines table<br>- [x] Investigations table<br>- [x] Reports table<br>- [x] Attachments table | 16h | P0 |
| DB1.3 | Operational entities | - [x] ActivityLogs table<br>- [x] Notifications table<br>- [x] Sessions/RefreshTokens tables<br>- [x] AuditLogs table<br>- [x] Payments/Invoices tables | 16h | P0 |
| DB1.4 | Specialized entities | - [x] Feedback table<br>- [x] CarePlans table<br>- [x] PregnancyRecords/GrowthCharts tables<br>- [x] Vaccinations table<br>- [x] HospitalSettings table | 12h | P0 |

#### 1.4 Shared Packages & Infrastructure
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| SVC1.1 | Core packages | - [x] @haspataal/auth package<br>- [x] @haspataal/db package<br>- [x] @haspataal/ui package<br>- [x] @haspataal/queue package<br>- [x] @haspataal/cache package | 30h | P0 |
| SVC1.2 | Communication packages | - [x] @haspataal/notifications package<br>- [ ] Build @haspataal/email package<br>- [ ] Build @haspataal/sms package<br>- [ ] Build @haspataal/whatsapp package | 20h | P0 |
| SVC1.3 | Service & Util packages | - [ ] Build @haspataal/events (event bus singleton)<br>- [ ] Build @haspataal/scheduler package<br>- [ ] Build @haspataal/files package<br>- [ ] Build @haspataal/emr package<br>- [ ] Build @haspataal/appointments package | 24h | P0 |

---

### Phase 2: Authentication, Security & Patient/HMS Accounts (Weeks 4-5)

#### 2.1 Patient Authentication
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| PA1.1 | OTP authentication | - [x] Phone input validation<br>- [x] OTP request endpoint<br>- [x] OTP verification<br>- [x] Resend OTP logic<br>- [x] OTP expiry (5 min)<br>- [x] Rate limiting | 12h | P0 |
| PA1.2 | Patient registration | - [x] Registration form UI<br>- [x] Form validation (Zod)<br>- [x] Phone/email uniqueness check<br>- [x] Avatar upload flow<br>- [x] Success redirect<br>- [x] Session creation | 14h | P0 |
| PA1.3 | Session management | - [x] Auth context hook<br>- [x] Session persistence<br>- [x] Logout functionality<br>- [x] Session refresh<br>- [x] Expiry handling<br>- [x] Multi-tab sync | 10h | P0 |
| PA1.4 | Route protection | - [x] Protected route middleware<br>- [x] Auth state listener<br>- [x] Unauth redirect<br>- [x] Loading states<br>- [x] Session expiry redirect | 10h | P0 |

#### 2.2 Hospital Authentication
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| HA1.1 | Hospital login | - [x] Login form UI<br>- [x] Credential validation<br>- [x] Password hashing (bcrypt)<br>- [x] Session creation<br>- [x] Error handling<br>- [x] Remember me option | 12h | P0 |
| HA1.2 | Password recovery | - [x] Forgot password UI<br>- [x] Email verification<br>- [x] Reset token generation<br>- [x] Password reset endpoint<br>- [x] Token expiry (1h)<br>- [x] Success flow | 12h | P0 |

#### 2.3 Security Hardening & Session Logs
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| SEC1.1 | Headers & Protection | - [x] CSRF protection implementation<br>- [x] CSP headers configuration<br>- [x] Helmet security headers<br>- [x] SQL injection protection<br>- [x] XSS protection<br>- [x] Password policy enforcement | 12h | P0 |
| SEC1.2 | Session & Device Logs | - [x] Secure httpOnly cookies<br>- [x] Session expiry (24h)<br>- [ ] Log user session history (IP tracking, device info)<br>- [ ] Implement automatic password rotation prompt (90 days)<br>- [ ] Implement MFA (Google Authenticator / SMS TOTP) | 18h | P0 |
| SEC1.3 | API Key & Webhook Security | - [x] File type & size validation<br>- [x] Virus scanning integration (ClamAV)<br>- [ ] Implement API key management dashboard for hospitals<br>- [ ] Harden webhook validation (signature verification for payments/SMS) | 16h | P0 |

---

### Phase 2.5: Doctor Identity & Hospital Affiliation Module (Weeks 5-7)

#### 2.5.1 Doctor Platform Registration & Authentication
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| DID1.1 | Doctor Registration | - [ ] Mobile OTP verification<br>- [ ] Email + password setup<br>- [ ] Create DoctorAccount with DRAFT status<br>- [ ] Session creation with platform identity | 12h | P0 |
| DID1.2 | Personal Information | - [ ] First/Middle/Last name, Gender, DOB, Photo<br>- [ ] Languages, Biography, Current Designation<br>- [ ] Medical Council Registration (number, council, validity) | 10h | P0 |

#### 2.5.2 Education, Qualifications & Credentials
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| DID2.1 | Education Records | - [ ] Undergraduate (degree, college, university, country, year, reg number)<br>- [ ] Postgraduate (degree, specialty, college, university, year)<br>- [ ] Super-specialty (DM/MCh/DNB SS/FNB, institution, year)<br>- [ ] Diploma courses, Fellowships | 14h | P0 |
| DID2.2 | Certifications & Skills | - [ ] Certifications (course, authority, cert number, expiry)<br>- [ ] Skills (NICU, PICU, Ventilator, Bronchoscopy, Laparoscopy, Ultrasound, ECMO, etc.) | 10h | P0 |
| DID2.3 | Professional Memberships & Publications | - [ ] Memberships (IAP, IMA, NNF, FOGSI, API, RSSDI, etc.)<br>- [ ] Publications (journal, DOI, year)<br>- [ ] Awards (title, authority, year)<br>- [ ] Conferences (speaker/faculty/delegate)<br>- [ ] Licenses (state, NMC, international) | 12h | P0 |

#### 2.5.3 Professional Experience & Documents
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| DID3.1 | Experience Records | - [ ] Hospital, Designation, Department, Joining/Leaving dates, Currently working<br>- [ ] Responsibilities | 8h | P0 |
| DID3.2 | Document Upload | - [ ] MBBS Certificate, PG Certificate, SS Certificate<br>- [ ] Registration Certificate, Government ID, Experience Letters, Photo<br>- [ ] Secure upload with virus scanning, encryption | 12h | P0 |

#### 2.5.4 Verification & Profile Completion
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| DID4.1 | Verification Workflow | - [ ] Status transitions: DOCUMENT_PENDING → UNDER_VERIFICATION → VERIFIED/REJECTED<br>- [ ] Verification by Haspataal team<br>- [ ] Rejection reasons, resubmission flow | 10h | P0 |
| DID4.2 | Profile Completion Gates | - [ ] Mandatory: Personal, Medical Registration, MBBS, PG, Experience, Govt ID, Photo, ≥1 Skill, Designation<br>- [ ] System auto-check: 100% complete → ACTIVE, else INCOMPLETE<br>- [ ] Dashboard showing completion percentage | 12h | P0 |

#### 2.5.5 Hospital Affiliation Workflow
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| DID5.1 | Hospital Invitation | - [ ] Hospital searches doctor by name, registration, specialty<br>- [ ] Send invitation with hospital role, department, fee, timings<br>- [ ] Invitation status: INVITED → PENDING | 10h | P0 |
| DID5.2 | Doctor Acceptance | - [ ] Doctor receives invitation notification<br>- [ ] Accept/Reject with hospital-specific preferences<br>- [ ] Affiliation status: PENDING → ACCEPTED | 8h | P0 |
| DID5.3 | Hospital Confirmation | - [ ] Hospital admin confirms affiliation<br>- [ ] Affiliation status: ACCEPTED → ACTIVE<br>- [ ] Hospital-specific data: department, specialty, consultation fee, fee, duration, working days/hours, teleconsultation, leave calendar, room, token rules | 10h | P0 |

#### 2.5.6 Doctor Dashboard & Profiles
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| DID6.1 | Doctor Dashboard | - [ ] Profile completion, verification status<br>- [ ] Affiliations (current, past, pending)<br>- [ ] Appointments, patients, consultations<br>- [ ] Analytics, revenue, reviews<br>- [ ] Public profile, documents, certificates | 14h | P0 |
| DID6.2 | Public vs Private Profile | - [ ] Public: name, qualifications, specialties, experience, languages, affiliations, availability<br>- [ ] Private: govt ID, registration docs, employment history, internal notes, verification metadata | 8h | P0 |

#### 2.5.7 Credential Verification & Expiry Monitoring
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| DID7.1 | Verification Layer | - [ ] Status per credential: Self-declared → Uploaded → Verified by Haspataal → Verified with Authority → Expired<br>- [ ] Hospital filter by verification status | 12h | P1 |
| DID7.2 | Expiry Monitoring | - [ ] Auto-notify before: medical council registration expiry, fellowship expiry, certification renewal, mandatory training<br>- [ ] Alerts to doctor and affiliated hospitals | 10h | P1 |

#### 2.5.8 Database Schema, APIs & Security
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| DID8.1 | Database Schema | - [ ] Doctor, DoctorProfile, DoctorEducation, DoctorQualification, DoctorSkill, DoctorCertification, DoctorMembership, DoctorPublication, DoctorAward, DoctorConference, DoctorExperience, DoctorDocument, DoctorVerification, DoctorAffiliation, DoctorSchedule, DoctorDepartment, DoctorLeave, DoctorAnalytics, DoctorReview | 16h | P0 |
| DID8.2 | REST APIs | - [ ] POST /doctors/register, /profile, /education, /experience, /documents, /verify<br>- [ ] GET /doctors/search<br>- [ ] POST /doctors/invite, /accept-affiliation<br>- [ ] GET /doctors/dashboard | 14h | P0 |
| DID8.3 | Security Hardening | - [ ] Platform identity, multi-hospital support, audit logs<br>- [ ] Document encryption (AES-256), RBAC, MFA<br>- [ ] Digital signatures, RLS, consent tracking<br>- [ ] Immutable qualification records | 14h | P0 |

---

### Phase 3: Onboarding & Hospital Setup Wizard (Week 6)

#### 3.1 Setup Wizard Foundation, Multi-Tenant Core & Shared Packages (Weeks 1-3)
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| ONB1.1 | Wizard Foundation | - [x] Hospital profile setup UI<br>- [x] Contact/Registration details verification<br>- [x] Logo/Branding assets upload<br>- [x] Six granular wizard stage components (Identity, Doctor, Dept, WA, Billing, Result) | 12h | P0 |
| ONB1.2 | Master Configuration | - [x] Department configuration & speciality mapping<br>- [x] Roster imports & doctor onboarding<br>- [ ] Price Master: Consultation fee templates<br>- [ ] Price Master: Service/Ward/Diagnostics pricing catalogs<br>- [ ] Working hours configuration & holiday calendar setup | 16h | P0 |
| ONB1.3 | Setup Gates & Go-Live | - [x] Setup verification gate (password/OTP re-auth)<br>- [x] Walk-in visit registration setup<br>- [x] Go-live dashboard activation<br>- [ ] Notification templates mapping wizard<br>- [ ] Subscription plan activation gate | 14h | P0 |

---

### Phase 4: Appointment Engine & Scheduling Services (Weeks 8-9)

#### 4.1 Appointment Core & Double Booking Rules
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| APT1.1 | Booking Engine | - [x] Walk-in booking flow<br>- [x] Online booking flow<br>- [x] Emergency priority booking<br>- [ ] Double booking prevention engine<br>- [ ] VIP booking routing & alerts<br>- [ ] Expected waiting time estimation service | 16h | P0 |
| APT1.2 | Scheduling Constraints | - [x] Weekly schedule templates<br>- [x] Daily slot generation (15-min increments)<br>- [x] Slot blocking/unblocking<br>- [ ] Doctor leave handling (auto-reschedule/notify)<br>- [ ] Holiday slot overrides<br>- [ ] Appointment slot buffer time configurations | 14h | P0 |
| APT1.3 | Queue Optimization | - [x] Token generation system<br>- [x] Queue management UI<br>- [x] Waitlist management<br>- [ ] Token prediction engine (based on real-time consultation times)<br>- [ ] Live queue optimizer (smart routing for delayed doctors) | 14h | P1 |

#### 4.2 Search Services
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| SRCH1.1 | Global Search | - [ ] Global search service (multi-index: patient, doctor, hospital, prescription)<br>- [ ] Medicine autocomplete index (clinical names + brands)<br>- [ ] Investigation catalog index (lab and radiology tests) | 16h | P0 |

---

### Phase 5: Doctor Portal & Consultation Engine (Weeks 8-9)

#### 5.1 Doctor Portal Core
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| DOC1.1 | Doctor Dashboard | - [ ] Live dashboard: today's appointments summary<br>- [ ] Active Patient Queue dashboard (waiting, in-consultation, completed)<br>- [ ] Quick statistics (patient count, consultation duration, leave balance) | 16h | P0 |
| DOC1.2 | Consultation Screen | - [ ] Unified Consultation Screen with tabs/sections<br>- [ ] Chief complaints form (duration, severity)<br>- [ ] Vitals recording & history of present illness (HPI)<br>- [ ] Clinical notes, diagnosis capture, and follow-up scheduler | 20h | P0 |
| DOC1.3 | Prescription Writer | - [ ] Autocomplete-enabled prescription writer (drug, dosage, freq, duration)<br>- [ ] ICD-10 coding suggestion panel<br>- [ ] Patient drug allergies & pregnancy contraindication check alerts<br>- [ ] Digital Signature integration (e-sign verification for prescription prints) | 18h | P0 |
| DOC1.4 | Doctor Availability & Performance | - [ ] Doctor profile customization UI<br>- [ ] Availability rules & ad-hoc slots setup<br>- [ ] Leave management application flow<br>- [ ] Performance Dashboard (consultation duration, patient feedback, ratings) | 14h | P1 |

---

### Phase 6: EMR & Medical Records Management (Weeks 10-11)

#### 6.1 EMR Longitudinal Timeline
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| EMR2.1 | Longitudinal Patient Timeline | - [ ] Build interactive Patient Timeline showing all historical touches<br>- [ ] Visual journey: Registration → Appointment → Consultation → Prescription → Lab → Follow-up → Admission → Discharge | 14h | P0 |

#### 6.2 Medical Records & Attachments
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| REC1.1 | Medical Record Cabinet | - [x] Attachment upload and storage (Supabase S3/R2)<br>- [ ] In-app PDF and Image Viewer (DICOM compatibility)<br>- [ ] Document OCR service (extract vitals/details from uploaded physical scans)<br>- [ ] Folder-based medical record categorizations | 18h | P0 |
| REC1.2 | Sharing & Audits | - [ ] Secure document sharing (signed URLs with expiration)<br>- [ ] Print-ready PDF report compilation<br>- [ ] File version history tracking (auditable updates to metadata) | 12h | P1 |

### Phase 6.5: Patient Clinical Data Retrieval & Update Module (Weeks 10-12)

#### 6.5.1 Patient Registration & Lookup
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| CLD1.1 | Patient Registration | - [ ] Mobile OTP verification flow<br>- [ ] Demographics capture (name, DOB, gender, blood group, emergency contact, address)<br>- [ ] ABHA ID linking (optional)<br>- [ ] Avatar upload<br>- [ ] Consent record creation (clinical care, AI, sharing, research, notifications, emergency)<br>- [ ] Audit entry on registration | 16h | P0 |
| CLD1.2 | Multi-Method Patient Lookup | - [ ] Search by mobile number<br>- [ ] Search by Patient ID<br>- [ ] Search by QR Medical Card<br>- [ ] Search by ABHA ID (future)<br>- [ ] Search by Appointment Token<br>- [ ] Search by Hospital MRN<br>- [ ] Reception verification (mobile + DOB)<br>- [ ] Doctor verification (active appointment)<br>- [ ] Emergency override with audit | 14h | P0 |

#### 6.5.2 Privacy-Aware Patient Summary
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| CLD2.1 | Clinician Summary View | - [ ] Name, Age, Gender, Blood Group<br>- [ ] City, State<br>- [ ] Allergies, Chronic Diseases<br>- [ ] Pregnancy Status<br>- [ ] Current Medications<br>- [ ] Alerts<br>- [ ] Recent Visits<br>- [ ] Current Care Journey | 10h | P0 |
| CLD2.2 | PII Protection | - [ ] Hide full address by default<br>- [ ] Hide Aadhaar by default<br>- [ ] Hide payment information<br>- [ ] Hide family contacts<br>- [ ] Hide personal notes<br>- [ ] Role-based field visibility | 8h | P0 |

#### 6.5.3 Clinical Record Updates
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| CLD3.1 | Vitals Recording | - [ ] Temperature, Pulse, Respiratory Rate, BP, SpO2<br>- [ ] Height, Weight, BMI<br>- [ ] Pain Score<br>- [ ] Head Circumference (Pediatrics) | 10h | P0 |
| CLD3.2 | Chief Complaints | - [ ] Multiple complaints with duration, severity, priority<br>- [ ] History of Present Illness<br>- [ ] Past Medical History<br>- [ ] Family History<br>- [ ] Drug History<br>- [ ] Allergies<br>- [ ] Immunization History<br>- [ ] Social History | 14h | P0 |
| CLD3.3 | Examination | - [ ] General Examination<br>- [ ] Systemic Examination<br>- [ ] Pediatric Examination<br>- [ ] Obstetric Examination<br>- [ ] Neurological Examination | 12h | P0 |
| CLD3.4 | Diagnosis | - [ ] Primary/Secondary Diagnosis<br>- [ ] ICD-10 Code indexing<br>- [ ] Differential Diagnosis | 10h | P0 |
| CLD3.5 | Orders & Prescriptions | - [ ] Laboratory test orders<br>- [ ] Radiology orders<br>- [ ] Procedure orders<br>- [ ] Referrals<br>- [ ] Prescription: Drug, Dose, Route, Frequency, Duration, Instructions, PRN flag | 16h | P0 |
| CLD3.6 | Treatments & Follow-up | - [ ] IV Fluids, Nebulization, Vaccination, Injection, Procedure Notes<br>- [ ] Observation notes<br>- [ ] Follow-up scheduling with review date<br>- [ ] Care Journey assignment<br>- [ ] Escalation Risk & Retention Rules | 12h | P0 |

#### 6.5.4 Clinical Timeline & Event System
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| CLD4.1 | Auto Timeline Generation | - [ ] Timeline entries for: Appointment Booked, Vitals Recorded, Consultation Started, Prescription Added, Lab Ordered, Bill Generated, Follow-up Scheduled, Retention Reminder | 10h | P0 |
| CLD4.2 | Event-Driven Updates | - [ ] Publish: PatientRegistered, AppointmentBooked, VisitStarted, VitalsRecorded, PrescriptionCreated, InvestigationOrdered, VisitCompleted, FollowUpScheduled<br>- [ ] Outbox pattern for reliable delivery<br>- [ ] Integrate with Notification, Analytics, AI, Retention modules | 14h | P0 |

#### 6.5.5 Role-Based Access & Consent
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| CLD5.1 | RBAC for Clinical Data | - [ ] Patient: Own records only<br>- [ ] Reception: Demographics, Appointments, Registration<br>- [ ] Doctor: Clinical Records, Prescriptions, Investigations<br>- [ ] Nurse: Vitals, Nursing Notes, Medication Administration<br>- [ ] Lab Tech: Lab Orders, Lab Results<br>- [ ] Radio Tech: Imaging Orders, Reports<br>- [ ] Pharmacist: Medication, Dispensing<br>- [ ] Hospital Admin: Operational Reports<br>- [ ] Platform Admin: System Administration | 14h | P0 |
| CLD5.2 | Patient Consent Management | - [ ] Consent types: Clinical Care, AI Assistance, Record Sharing, Research, Notifications, Emergency Override<br>- [ ] Versioned, timestamped, revocable, audited<br>- [ ] Consent enforcement on data access | 12h | P0 |

#### 6.5.6 Clinical Decision Support (Deterministic)
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| CLD6.1 | Safety Checks Engine | - [ ] Drug-drug interaction detection<br>- [ ] Drug allergy alerts<br>- [ ] Pregnancy contraindication warnings<br>- [ ] Pediatric maximum dose validation<br>- [ ] Renal/hepatic dose adjustment checks<br>- [ ] Duplicate medication detection | 18h | P0 |

#### 6.5.7 Multi-Tenant Data Isolation
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| CLD7.1 | Platform vs Hospital Data Split | - [ ] Platform DB: Identity, Auth, Consent, Linked Hospitals<br>- [ ] Hospital DB: Encounters, EMR, Prescriptions, Investigations, Billing<br>- [ ] Cross-hospital sharing via explicit patient consent | 16h | P0 |

#### 6.5.8 API Layer & Security
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| CLD8.1 | REST API Endpoints | - [ ] POST /api/v1/patients/register<br>- [ ] POST /api/v1/patients/search<br>- [ ] GET /api/v1/patients/{id}/summary<br>- [ ] GET /api/v1/patients/{id}/timeline<br>- [ ] POST /api/v1/consultations<br>- [ ] POST /api/v1/vitals<br>- [ ] POST /api/v1/prescriptions<br>- [ ] POST /api/v1/investigations<br>- [ ] POST /api/v1/followups<br>- [ ] POST /api/v1/treatments<br>- [ ] GET /api/v1/audit | 16h | P0 |
| CLD8.2 | Security Hardening | - [ ] Multi-tenant RLS policies<br>- [ ] AES-256 encryption for sensitive data<br>- [ ] JWT with refresh tokens<br>- [ ] MFA enforcement<br>- [ ] Rate limiting (sliding window)<br>- [ ] CSRF protection<br>- [ ] CSP headers (Helmet)<br>- [ ] Secure httpOnly cookies<br>- [ ] Request ID correlation<br>- [ ] Virus scanning (ClamAV)<br>- [ ] Signed file URLs<br>- [ ] OWASP API Top 10 compliance | 20h | P0 |

---

### Phase 8: Unified Notification & Scheduler Service (Week 12)

#### 7.1 Unified Notification Hub
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| NTF2.1 | Multi-Channel Engine | - [x] SMS, Email, and WhatsApp provider integrations<br>- [x] Curfew handling (curfew queue for non-critical alerts)<br>- [x] Retry logic, dead-letter queue, and priority sorting | 14h | P0 |
| NTF2.2 | Scheduler (Cron Engines) | - [x] Cron worker for chronic care escalations<br>- [ ] Cron engine for pregnancy tracking reminders<br>- [ ] Cron engine for vaccination schedules & follow-ups<br>- [ ] Cron engine for daily appointment slot cleanup | 16h | P0 |

#### 7.2 Event Bus Engine
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| EVT1.1 | Event-Driven Architecture | - [x] Postgres/Redis Dual-Write EventLog<br>- [ ] Define core events schema: Appointment Created, Appointment Cancelled, Prescription Added, Payment Completed, Lab Uploaded, Notification Sent, Hospital Approved | 14h | P0 |

---

### Phase 9: Patient Portal & Family Accounts (Weeks 13-14)

#### 8.1 Enhanced Patient Features
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| PPT1.1 | Family Accounts | - [ ] Family profile management (dependent booking, linked records)<br>- [ ] Dependent authorization permissions | 14h | P1 |
| PPT1.2 | Patient Health Cabinet | - [x] Basic appointments and health records list<br>- [ ] Medical timeline view for patient logins<br>- [ ] Interactive prescriptions PDF download & sharing<br>- [ ] Emergency Medical Card download (offline QR Code)<br>- [ ] Saved/Favorite doctors and hospitals catalog | 18h | P1 |

#### 8.2 Bihar Pregnancy Tracker Integration
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| PREG2.1 | Strategic Maternity | - [x] ABDM-compliant ABHA ID linking & consent-driven records syncing<br>- [x] FHIR R4-compliant ANC resource export engine<br>- [x] Bilingual Patient Portal (Hindi/Bhojpuri) with TTS reader<br>- [x] MoHFW MCP Card digitization<br>- [x] Growth Charts (ICMR norms) & BP Trend tracking<br>- [x] Government Scheme tracker (JSY/PMMVY eligibility)<br>- [x] Partograph & referral slips<br>- [x] 108 ambulance & e-Raktkosh integrations | 24h | P0 |

---

### Phase 10: Billing, Reception & HMS Operational Modules (Weeks 15-16)

#### 9.1 Reception Desk Operations
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| RCP1.1 | Desk UI | - [x] Basic reception check-in list<br>- [ ] Returning patient registration and quick search<br>- [ ] Duplicate detection matching wizard (mobile, name, Aadhaar)<br>- [ ] Convert booked appointments to active check-ins<br>- [ ] Emergency check-in fast-track (bypass details to vitals directly) | 16h | P0 |

#### 9.2 Billing & Treasury
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| BIL1.1 | Invoice Management | - [x] Bill payments mapping<br>- [ ] Cost estimates calculator<br>- [ ] Invoice generation & sequencing<br>- [ ] Discounts & concessions tracker (requires admin approval)<br>- [ ] Refund workflows & credit notes | 16h | P0 |
| BIL1.2 | Advanced Payments | - [ ] Partial payments recording<br>- [ ] GST & HSN code calculations<br>- [ ] Digital receipt PDF generator & print module<br>- [ ] Outstanding balance tracking and statements<br>- [ ] Cash drawer reconciliation & payment audit trails | 16h | P0 |

#### 9.3 Ward & Room Operations
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| WRD1.1 | Room & Bed Management | - [x] Room and Bed inventory mapping<br>- [ ] Bed Allocation Wizard (linked to admission use-cases)<br>- [ ] OT Scheduling calendar<br>- [ ] ICU Admission & Vitals monitoring panel | 14h | P1 |

---

### Phase 11: Admin Panel, Analytics & Compliance (Week 17)

#### 10.1 Admin Console
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| ADM2.1 | Super Admin | - [x] Basic dashboard statistics<br>- [ ] Subscription plan creation and billing management<br>- [ ] Hospital verification pipeline (license audits)<br>- [ ] Doctor registration audit & verification checks<br>- [ ] Support ticket management dashboard | 14h | P1 |
| ADM2.2 | Platform & Content | - [ ] System-wide announcements & banners<br>- [ ] CMS panel for marketing and help documentation<br>- [ ] SEO metadata manager | 10h | P2 |

#### 10.2 Analytics Dashboards
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| ANA1.1 | Segmented Analytics | - [x] Basic charts UI<br>- [ ] Patient: personal metrics tracking, health scorecard<br>- [ ] Doctor: consultations volume, average wait time metrics<br>- [ ] Hospital: OPD/IPD occupancy, billing, no-show rates<br>- [ ] Admin: platform growth, active hospitals, active subscriptions | 18h | P0 |

#### 10.3 Compliance & Consents
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| CMP1.1 | Healthcare Consent | - [x] Consent records model<br>- [ ] Granular patient consent settings (clinical records sharing)<br>- [ ] Consent revocation logs<br>- [ ] Terms of Service & Privacy Policy acceptance tracking<br>- [ ] GDPR/DPDP compliance deletion utility (Right to be Forgotten) | 12h | P0 |

---

### Phase 12: Security Hardening & DevOps Infrastructure (Week 18)

#### 11.1 Infrastructure Security
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| INF1.1 | API Gateway & Rate Limits | - [x] Rate limiting middleware (sliding window ioredis)<br>- [x] Request ID correlation headers<br>- [x] Health checks (/health, /ready, /live)<br>- [ ] Webhook signature validators | 12h | P0 |

#### 11.2 DevOps Pipeline
| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| DVP1.1 | Continuous Delivery | - [x] Docker configuration for apps/packages<br>- [x] GitHub Actions CI/CD<br>- [ ] Blue-green deployment configuration scripts<br>- [ ] Automated database migration validation and rollback pipeline | 16h | P0 |
| DVP1.2 | Feature Flags & Monitoring | - [ ] Feature flags dashboard<br>- [ ] Performance testing setup (K6 load testing)<br>- [ ] Synthetic endpoint monitoring alerts configuration | 12h | P0 |

---

### Phase 13: Production Readiness Phase (Final Week)

| ID | Task | Subtasks | Est. Hours | Priority |
|----|------|----------|------------|----------|
| PRD1.1 | Master Data & Migration | - [ ] Final production database migration validation<br>- [ ] Seed master data (ICD-10 codes, specialties catalog, Indian medical departments)<br>- [ ] Backup and recovery restore validations | 10h | P0 |
| PRD1.2 | Security & Load Audits | - [ ] Run security penetration testing (OWASP Zap/Snyk)<br>- [ ] Load test the gateway and DB under 10k concurrent users scenario<br>- [ ] Verify monitoring alerts & Sentry exception notifications are active | 12h | P0 |
| PRD1.3 | Validation & Pilot | - [ ] Run API documentation validation & cleanups<br>- [ ] Pilot onboarding: set up first physical hospital/clinic staging account<br>- [ ] User acceptance testing (UAT) checks for patients, receptionists, and doctors<br>- [ ] Finalize go-live smoke testing and deployment rollback checklist | 14h | P0 |

---

## ✅ Quality Gates & Definition of Done (DoD)

Each task must satisfy the following checklist before it can be closed:

- [ ] **Functional Integrity:** All user flows and edge cases tested and working.
- [ ] **TypeScript Strictness:** Strict type checks pass; zero uses of `any`.
- [ ] **Testing Coverage:** Unit test coverage >80% and integration test suites passing.
- [ ] **Security Compliance:** RLS policies verified; RBAC enforced on endpoints.
- [ ] **Performance Standards:** API response times <2s and UI actions under <100ms.
- [ ] **Observability:** Health check logging, Sentry monitoring, and audit log events registered.
- [ ] **Documentation:** API specs and inline comments updated.
- [ ] **Rate Limiting:** Enforced at the boundary limit.