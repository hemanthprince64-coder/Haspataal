# Haspataal Priority Summary

A structured blueprint defining Haspataal's core priorities, differentiating features, growth strategy, and operational launch readiness gates.

---

## 🔴 P0 - Launch Blockers (Must Have for Launch / MVP)

These modules are absolutely required before the platform can go live in any hospital.

### Platform Services Core
- **Identity Service:** Centralized auth token verification and session manager.
- **Tenant Service:** Dynamic workspace routing and database context isolates.
- **Workflow Service:** Reusable state transition engine for appointments, bills, and pregnancies.
- **Scheduler Service:** BullMQ cron queue runner for follow-ups and notifications.
- **Notification Service:** Multi-channel template rendering and gateway dispatcher.
- **Search Service:** Index coordinator for patients, doctors, and clinics.
- **Audit Service:** Log generator capturing all PHI and clinical modifications.
- **Storage Service:** Document storage manager with virus scanning filters.
- **Master Data Service:** Catalog server for drug, ICD-10, and procedure registries.
- **Configuration Service:** Runtime feature-toggle configurations per clinic/dept/doctor.
- **API Gateway (gateway.haspataal.com):** Gateway handling rate limits, trace correlation IDs, logging, and circuit breakers.

### Clinical Data Retrieval & Update Module (NEW - Core Clinical Layer)
- **Patient Registration:** OTP verification, demographics capture, ABHA ID linking, consent record creation, audit entry.
- **Patient Lookup:** Multi-method search (Mobile, ID, QR Card, ABHA ID, Token, MRN) with role-based verification.
- **Privacy-Aware Summary:** Clinician view (name, age, gender, blood group, allergies, chronic diseases, pregnancy, medications, alerts, visits, care journey) with PII hidden by default.
- **Clinical Record Updates:** Vitals, Chief Complaints, History (HPI, PMH, family, drug, allergy, immunization, social), Examination (general, systemic, pediatric, obstetric, neuro), Diagnosis (primary/secondary, ICD-10, differential), Orders (lab, radiology, procedures, referrals), Prescriptions (drug, dose, route, freq, duration, instructions, PRN), Treatments (IV, nebulization, vaccination, injection, procedures), Follow-up (review date, care journey, escalation risk, retention rules).
- **Clinical Timeline:** Auto-generated chronological timeline from all events (Appointment → Vitals → Consultation → Prescription → Lab → Billing → Follow-up → Retention).
- **Role-Based Access:** Patient (own), Reception (demographics/appointments), Doctor (clinical/prescriptions/investigations), Nurse (vitals/notes/meds), Lab Tech (orders/results), Radio Tech (orders/reports), Pharmacist (meds/dispensing), Hospital Admin (operational), Platform Admin (system).
- **Patient Consent:** Versioned, timestamped, revocable, audited consent types (Clinical Care, AI Assistance, Record Sharing, Research, Notifications, Emergency Override).
- **Notifications:** Appointment, Prescription Ready, Lab Report Ready, Follow-up, Pregnancy, Vaccination, Medicine, Retention Alert.
- **Audit Logging:** User, Role, Hospital, Patient, Action, IP, Device, Timestamp, Reason, Old Value, New Value.
- **AI Integration:** Patient AI (explainers), Doctor AI (SOAP, ICD, summary), Hospital AI (capacity, no-show, retention).
- **Database Schema:** Patient, PatientProfile, PatientConsent, Visit, Appointment, VitalSigns, ChiefComplaint, History, Examination, Diagnosis, Prescription, PrescriptionItem, Treatment, InvestigationOrder, LabResult, RadiologyOrder, ClinicalAttachment, CareJourney, TimelineEvent, Notification, AuditLog, EventLog, OutboxEvent.
- **Security:** Multi-tenant RLS, AES-256, JWT, Refresh Tokens, MFA, Rate Limiting, CSRF, CSP, Helmet, Secure Cookies, Request IDs, Virus Scanning, Signed URLs, OWASP API Top 10.

### Doctor Identity & Hospital Affiliation Module (NEW - Core Platform Layer)
- **Doctor Platform Registration:** Mobile OTP, email, password → DRAFT status.
- **Personal Information:** Name, gender, DOB, photo, languages, bio, designation, medical council registration (number, council, validity).
- **Education Records:** UG (MBBS), PG, Super-specialty (DM/MCh/DNB SS/FNB), Diplomas, Fellowships.
- **Certifications & Skills:** Certifications (course, authority, number, expiry), skills (NICU, PICU, Ventilator, Bronchoscopy, Laparoscopy, Ultrasound, ECMO).
- **Professional Memberships & Publications:** IAP, IMA, NNF, FOGSI, API, RSSDI; publications (journal, DOI), awards, conferences, licenses (state, NMC, international).
- **Professional Experience:** Hospital, designation, department, dates, responsibilities.
- **Document Upload:** MBBS, PG, SS, registration, govt ID, experience letters, photo → encrypted storage.
- **Verification Workflow:** Status transitions: DOCUMENT_PENDING → UNDER_VERIFICATION → VERIFIED/REJECTED.
- **Profile Completion Gates:** Mandatory fields (Personal, Medical Registration, MBBS, PG, Experience, Govt ID, Photo, ≥1 Skill, Designation) → 100% complete = ACTIVE.
- **Hospital Affiliation Workflow:** Hospital searches → invites → doctor accepts → hospital confirms → ACTIVE.
- **Hospital-Specific Data:** Department, specialty, consultation fee, duration, working days/hours, teleconsultation, leave calendar, room, token rules.
- **Doctor Dashboard:** Profile completion, verification, affiliations, appointments, patients, consultations, analytics, revenue, reviews, public profile, documents.
- **Public vs Private Profile:** Public (patient-facing): name, qualifications, specialties, experience, languages, affiliations, availability. Private (hospital/platform): govt ID, registration docs, employment history, internal notes, verification metadata.
- **Credential Verification Layer:** Self-declared → Uploaded → Verified by Haspataal → Verified with Authority → Expired.
- **Credential Expiry Monitoring:** Auto-notify before registration, fellowship, certification, training expiry.
- **Database Schema:** Doctor, DoctorProfile, DoctorEducation, DoctorQualification, DoctorSkill, DoctorCertification, DoctorMembership, DoctorPublication, DoctorAward, DoctorConference, DoctorExperience, DoctorDocument, DoctorVerification, DoctorAffiliation, DoctorSchedule, DoctorDepartment, DoctorLeave, DoctorAnalytics, DoctorReview (18 tables).
- **Doctor Status Flow:** DRAFT → PROFILE_INCOMPLETE → DOCUMENT_PENDING → UNDER_VERIFICATION → VERIFIED → ACTIVE → SUSPENDED → ARCHIVED.
- **Affiliation Status Flow:** INVITED → PENDING → ACCEPTED → ACTIVE → ON_LEAVE → TERMINATED.
- **Security:** Platform identity, multi-hospital support, audit logs, document encryption (AES-256), RBAC, MFA, digital signatures, RLS, consent tracking, immutable qualification records.
- **APIs:** POST /doctors/register, /profile, /education, /experience, /documents, /verify, /invite, /accept-affiliation; GET /doctors/search, /dashboard.

### Doctor Discovery, Public Profile & Availability Module (NEW - Core Platform Layer)
- **Doctor Discovery Service:** Aggregates verified doctor profiles and active hospital affiliations. Patient Portal reads ONLY from this service (never directly queries hospital doctor records).
- **Automatic Indexing:** IF doctor VERIFIED AND profile 100% complete AND affiliation ACTIVE AND hospital ACTIVE → publish to Patient Portal. If verification expires → hide automatically.
- **Public Doctor Card:** Photo, full name, qualification, specialty, super-specialty, designation, years of experience, languages, masked registration number, verification badge, rating, review count, consultation fee, available today, next available slot, book appointment button.
- **Hospital Affiliations Display:** Hospital name, logo, department, designation, fee, city, state, distance, Google Maps button, hospital verification badge.
- **Google Maps Integration:** Store latitude, longitude, full address, city, state, place ID; generate maps URL dynamically.
- **Doctor Availability Service:** Compute from weekly OPD schedule, holiday calendar, active leave, existing appointments, slot capacity (avoid stale data).
- **Doctor Controls:** Working days, morning/evening sessions, slot duration, max patients, break times, teleconsultation, walk-in allowed.
- **Leave Management:** Create leave (type, start/end date, reason, visibility, recurring, approval) → hide slots, stop bookings, show "Doctor is on Leave", recommend alternatives.
- **OPD Schedule:** Weekly schedule with morning/evening sessions, holiday overrides (festival, emergency closure, conference, vacation).
- **Availability Status:** Available, Limited Slots, Fully Booked, On Leave, Offline, Emergency Only (auto-calculated).
- **Patient Search:** By doctor name, specialty, hospital, disease/symptoms, city, distance, language, gender, experience, rating, availability.
- **Search Filters:** Available Today/Tomorrow, Teleconsultation, In-person, Nearest, Highest Rated, Lowest Fee, Most Experienced.
- **Unified Doctor Search Index:** Denormalized index updated on profile/qualification/affiliation/schedule/leave/hospital changes.
- **Alternative Doctor Suggestions:** Same department, same hospital first, then nearby affiliated hospitals, preserve specialty and mode.
- **Doctor Dashboard:** Manage profile, qualifications, experience, skills, affiliations, schedules, leaves, fees, availability, documents, analytics, reviews.
- **Database Schema:** Doctor, DoctorProfile, DoctorQualification, DoctorExperience, DoctorSkill, DoctorCertification, DoctorAffiliation, Hospital, HospitalLocation, DoctorSchedule, DoctorLeave, DoctorAvailability, DoctorHoliday, DoctorAnalytics, DoctorReview, DoctorSearchIndex, DoctorPublicProfile.
- **Security:** Only public info exposed (hide govt ID, personal address, documents, personal mobile, email, employment contracts, internal notes); audit logs; authorized users only access private data.
- **APIs:** GET /doctors, /doctors/search, /doctors/{doctorId}, /doctors/{doctorId}/availability, /doctors/{doctorId}/affiliations, /hospitals/{hospitalId}/doctors; POST /doctors/schedule, /doctors/leave; PATCH /doctors/availability.

### Smart Confirmation Engine (NEW - Core Platform Layer)
- **Confirmation Modes:** AUTO_ACCEPT (default for hospital OPDs), MANUAL_ACCEPT (private/visiting/super specialists, teleconsultation), AUTO_ACCEPT_WITH_RESCHEDULE (hospitals where doctor may reschedule).
- **Appointment States:** AVAILABLE → BOOKED → PENDING_CONFIRMATION → CONFIRMED → CHECKED_IN → IN_CONSULTATION → COMPLETED → FOLLOW_UP (+ REJECTED, EXPIRED, CANCELLED, NO_SHOW, RESCHEDULE_REQUESTED, RESCHEDULE_ACCEPTED, RESCHEDULE_DECLINED).
- **Manual Confirmation Workflow:** Patient books → PENDING_CONFIRMATION → notification (Doctor App, HMS, WhatsApp, Email) → 60-min timer → accept/reject/reschedule/forward → patient notified. On timeout → EXPIRED → slot released → alternative doctors suggested.
- **Doctor Actions:** Accept, Reject, Reschedule, Forward to colleague, Mark unavailable.
- **Notification Timeline:** 0min booking, 15min reminder, 45min urgent, 55min final, 60min auto-expiry.
- **Patient Screen:** Pending confirmation, countdown timer, doctor name, hospital, expected confirmation time, cancel option, suggested alternatives.
- **Doctor Dashboard:** Pending requests with countdown, accept/reject/reschedule/forward buttons, priority indicator.
- **Hospital Dashboard:** Pending confirmations, acceptance SLA, average response time, expired requests, doctor response rate.
- **Configuration:** Hospital-level mode, doctor-level override, consultation type override, emergency bypass, max pending requests, auto expiry duration.
- **Department-Level Routing:** Patient chooses department → if doctor unavailable → offer next available doctor in same department.
- **Smart Escalation:** 30min → notify doctor again, 45min → notify dept coordinator, 55min → notify hospital admin → expire + recommend another doctor.
- **Live Queue Integration:** Once accepted → queue generated → estimated waiting time → live queue position.
- **AI-Based Recommendations:** On expiry → suggest same specialty, same hospital, nearest affiliated hospital, earliest available slot, highest-rated available doctor.
- **Database Schema:** Appointment, AppointmentConfirmation, AppointmentStatusHistory, ConfirmationTimer, DoctorAvailability, RescheduleRequest, NotificationLog.
- **Domain Events:** AppointmentRequested, ConfirmationRequested, ReminderSent, AppointmentConfirmed, AppointmentRejected, AppointmentExpired, AppointmentRescheduled, AppointmentForwarded.
- **Security:** Only assigned doctor may confirm, hospital admins may override, all actions audited, all status transitions immutable.
- **KPIs:** Average confirmation time, acceptance rate, expiry rate, reschedule rate, doctor response SLA, patient cancellation rate.

### Doctor Workspace (Portal)
- **Today's Queue:** Real-time queue toggles (waiting, in-consultation, completed).
- **My Schedule:** Roster configurations, working days settings, and holiday calendar overrides.
- **Consultation Workspace:** Unified clinical window for chief complaints, systemic examinations, and vitals history logs.
- **Patient Timeline:** Interactive longitudinal view merging patient visits, EMR records, and lab files.
- **Prescription Builder:** Autocomplete medication form with dosage templates and digital signature e-signing.
- **Investigation Orders:** Laboratory and radiology ordering panel.
- **Follow-up & Task Queue:** Missed follow-ups alerts and Care Journey task assignments.
- **Performance & Leave:** Dashboard for average consult duration, rating analytics, and leave applications.

### Patient Portal
- **Registration & Login:** Mobile OTP authentication and linked family accounts.
- **Search & Discovery:** Location/specialty search for clinics and clinicians.
- **Smart Booking Engine:** Real-time slot reservation, waitlist queuing, and booking.
- **Patient Dashboard:** Timeline visualization, diagnostic reports download cabinet, and medical QR card.

### Core HMS (Operations)
- **Reception Desk:** Fuzzy search, duplicate patient check, walk-in register, and token print.
- **Nurse Stations:** Patient intake vitals logging and triage assessments.
- **Billing & Cashier:** HSN/GST billing calculations, discounts audits, partial payments, and cashier drawer audits.
- **Staff Directory:** Roster lists, shift assignments, and invitation queues.

### Security & Observability
- **Web Security:** CSRF blocks, CSP headers (Helmet integration), rate limit configurations, and MFA for admins.
- **Data Security:** Signed URLs, ClamAV upload scans, and AES-256 integrations key encryption.
- **Observability:** Distributed tracing (OpenTelemetry span IDs), centralized log aggregators (Pino), database slow query alerts, queue alerts, and Sentry exceptions logging.

### Master Data Governance
- **Versioning Control:** `MasterVersion` table mapping imports, activations, and rollbacks.
- **Record Preservation:** Deprecated records remain readable in historical database entries.

### Compliance
- **DPDP Act (India):** Granular consent logging, patient data portability exports, and erasure workflows.
- **ABDM Readiness:** FHIR R4 schema structures for eventual health locker integrations.

---

## 🟠 P1 - Launch Differentiators (Haspataal Unique Moats)

These features distinguish Haspataal from legacy systems and should be included in the launch if resources allow.

### Clinical Decision Support (CDS) Engine
- A deterministic rules engine running locally and independently of AI models:
  - **Safety Check:** Drug-allergy, drug-drug interaction, and duplicate therapy alerts.
  - **Dose Guard:** Maximum dose warning limits, pediatric weight-based calculations, and renal/hepatic dose adjustment templates.
  - **Contraindications:** Pregnancy, age, and vaccine-specific contraindication warning popups.

### Patient Clinical Data Module - Differentiators
- **Patient Timeline (Flagship Feature):** Unified chronological timeline including Registrations, OPD visits, IPD admissions, Prescriptions, Lab reports, Radiology, Pregnancy milestones, Vaccinations, Billing events, Follow-ups, Care journey milestones. Patient-owned lifelong health record view with offline QR Medical Card.
- **Clinical Decision Support (Deterministic Safety Layer):** Drug-drug interaction detection, drug allergy alerts, pregnancy contraindication warnings, pediatric maximum dose validation, renal/hepatic dose adjustment checks, duplicate medication detection - independent of AI, predictable and explainable.
- **Multi-Tenant Data Isolation:** Platform-level identity/auth/consent/linked hospitals; hospital-scoped clinical records (encounters, EMR, prescriptions, investigations, billing); cross-hospital sharing via explicit patient consent.
- **Event-Driven Architecture:** Domain events (PatientRegistered, AppointmentBooked, VisitStarted, VitalsRecorded, PrescriptionCreated, InvestigationOrdered, VisitCompleted, FollowUpScheduled) with outbox pattern for reliable delivery, enabling notifications, analytics, AI, and retention modules to react without tight coupling.

### Pregnancy Module (MCH Ecosystem)
- **ANC Clinical Workflow:** Multi-trimester checks, digital MoHFW MCP Card generation, high-risk auto-flagging, ICMR growth charts, BP trend trackers, and postnatal baby records.

### Care Journey & Chronic Pathways
- **Clinical Pathways:** Chronic disease follow-ups, care check-ins, and recall rules for Diabetes, Hypertension, CKD, Asthma, COPD, and Thyroid diseases.

### Retention Engine
- **Engagement Loop:** Automatic missed follow-up detection, no-show predictors, recall templates, and treating doctor escalations (2x missed visits).

### AI Safety & Guardrails Layer
- **Patient AI:** Educational responses only; disclaimers on all views; blocks diagnostic/prescription drafts; escalates emergencies.
- **Doctor AI:** Suggestions only; requires explicit clinician verification and signature sign-off.
- **Hospital/Admin AI:** No PII/PHI leakage; strict tenant-scoped boundaries checks.

### Platform Analytics
- **Analytics Dashboards:** OPD/IPD counts, revenue tracking, no-shows, follow-up compliance, and growth metrics.

---

## 🟢 P2 - Growth & Enterprise (Post-Launch Expansion)

These features can follow after launch once the platform is stabilized.

### Clinical Workflows
- **Pharmacy Loop:** Prescription verification → stock allocation → checkout payment → dispensation.
- **Laboratory Loop:** Lab order → sample barcode collection → processing → validation → approved report.
- **Radiology Loop:** Radiology order → slot booking → DICOM scan upload → radiologist review.
- **Admission (IPD) Loop:** Recommendation → bed allocation → ward transfer logs → discharge summary → billing.

### Integrations & Enterprise
- **ABDM Sandboxing:** Health locker syncs and doctor registry linking.
- **LIS/RIS PACS APIs:** Lab LIS and radiology PACS imaging integrations.
- **Multi-Branch Operations:** Enterprise dashboards for multi-campus clinics and white-label deployments.

---

## 🚀 Operational Readiness Checklist

Before public launch, the Haspataal business must verify:

- [ ] **Billing & Plans:** Pricing configurations and SaaS tier subscription limits finalized.
- [ ] **Integrations Funding:** SMS and WhatsApp business API credits funded.
- [ ] **Keys Configurations:** Payment gateway production keys and email servers verified.
- [ ] **Support Infrastructure:** Helpdesk ticket routing established and support contacts list published.
- [ ] **Training Materials:** Video walkthroughs and quick-start manuals prepared for clinic staff.

---

## 🚦 Definition of Launch (Go-Live Gates)

Before go-live, the Haspataal platform must satisfy:

- [ ] **Active Pilot:** 1 physical hospital/clinic fully executing queue workflows.
- [ ] **Staff Volume:** At least 10 doctors, 100 patient profiles, and 1,000 appointment tokens processed.
- [ ] **UAT Pass:** Written sign-offs from doctor, nurse, receptionist, and patient actors.
- [ ] **Compliance & Security:** Completed pen-testing, RLS validation, and DPDP consent logs active.
- [ ] **Operations:** Support desk ticketing system configured and backup recovery SLAs (<30 mins) verified.