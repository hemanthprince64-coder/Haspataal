# Haspataal QA Checklist (Complete Production Edition)

A comprehensive, production-grade Quality Assurance blueprint covering functional, security, performance, clinical, compliance, and disaster recovery validation.

---

## 🏗️ End-to-End Workflow Testing

These integration tests validate complete operational loops across patient, clinical, and administrative portals.

### 1. Patient OPD & Billing Loop
- [ ] **End-to-End Flow:** Patient registers → Searches doctor via Doctor Discovery Service → Books slot (AUTO_ACCEPT or MANUAL_CONFIRMATION) → Receives SMS/WhatsApp confirmation → Checks in at reception → Doctor opens consultation → Logs complaints/vitals/diagnosis → Generates prescription & lab orders → Cashier issues bill → Patient pays and receives print receipt → Follow-up reminder is scheduled.
- [ ] **Doctor Discovery Validation:** Patient Portal displays only indexed doctors (VERIFIED + profile 100% + affiliation ACTIVE + hospital ACTIVE). Verify hidden doctors are not searchable.
- [ ] **Public Profile Validation:** Doctor public card shows correct qualification, specialty, affiliation, consultation fee, availability status, verification badge. Sensitive data (govt ID, personal address, documents) is NOT exposed.
- [ ] **Smart Confirmation Validation:** AUTO_ACCEPT confirms immediately; MANUAL_ACCEPT shows countdown timer and alternatives; AUTO_ACCEPT_WITH_RESCHEDULE allows doctor to propose new time.
- [ ] **Timeline Verification:** Patient timeline is dynamically updated with a new entry after every single step in the journey.
- [ ] **Audit Trail:** Check that audit logs are correctly generated for every record read/write during the patient journey.

### 2. Doctor Consultation Workflow
- [ ] **Queue Interaction:** Patient check-in at reception instantly triggers queue addition on the doctor's dashboard.
- [ ] **Vitals & Notes:** Vitals logged by nurse pre-populate in the doctor's consultation view.
- [ ] **Clinical Writing:** Auto-suggest drug names, dosage templates, and ICD-10 diagnosis codes.
- [ ] **Safety Checks:** Trigger alert if prescribed drug conflicts with patient's allergy log or pregnancy status.
- [ ] **Digital Signatures:** Verify prescription PDF is generated with the doctor's digital signature key.

### 3. Doctor Discovery & Public Profile Testing
- [ ] **Search Accuracy:** Doctor search returns correct results for name, specialty, hospital, disease/symptoms, city, distance, language, gender, experience, rating, availability.
- [ ] **Filters Work:** Available Today/Tomorrow, Teleconsultation, In-person, Nearest, Highest Rated, Lowest Fee, Most Experienced filters work correctly.
- [ ] **Public Card Fields:** Photo, name, qualification, specialty, super-specialty, designation, years of experience, languages, masked registration number, verification badge, rating, review count, consultation fee, available today, next available slot, book appointment button all display correctly.
- [ ] **PII Protection:** Government ID, personal address, documents, personal mobile, email, employment contracts, internal notes are NOT visible on public profile.
- [ ] **Hospital Affiliations:** Hospital name, logo, department, designation, fee, city, state, distance, Google Maps button, hospital verification badge display correctly.
- [ ] **Google Maps Integration:** Clicking Maps button opens correct location; latitude, longitude, address, place ID stored correctly.
- [ ] **Availability Status:** Available, Limited Slots, Fully Booked, On Leave, Offline, Emergency Only auto-calculated correctly from schedule, leave, appointments, slots.
- [ ] **Leave Management:** When doctor on leave → slots hidden, bookings stopped, "Doctor is on Leave" shown, alternative doctors recommended.
- [ ] **Alternative Suggestions:** When doctor unavailable → same department, same hospital first, then nearby hospitals, preserve specialty and mode.
- [ ] **Search Index Updates:** Denormalized search index updates when profile, qualification, affiliation, schedule, leave, or hospital changes.
- [ ] **Discovery Service Isolation:** Patient Portal reads ONLY from Doctor Discovery Service, never directly from hospital doctor tables.

### 4. Smart Confirmation Engine Testing
- [ ] **AUTO_ACCEPT Mode:** Appointment confirms immediately, doctor notified after booking.
- [ ] **MANUAL_ACCEPT Mode:** Status shows PENDING_CONFIRMATION, 60-min countdown works, doctor receives notification, accept/reject/reschedule/forward actions work correctly.
- [ ] **Timeout Handling:** After 60 min → status EXPIRED, slot released, patient notified, alternative doctors suggested.
- [ ] **AUTO_ACCEPT_WITH_RESCHEDULE Mode:** Auto-confirms, doctor may request new time, patient approves revised slot.
- [ ] **Notification Timeline:** 0min booking, 15min reminder, 45min urgent, 55min final, 60min auto-expiry all trigger correctly.
- [ ] **Patient Screen:** Countdown timer, doctor name, hospital, expected confirmation time, cancel option, suggested alternatives display correctly.
- [ ] **Doctor Dashboard:** Pending requests with countdown, accept/reject/reschedule/forward buttons, priority indicator work correctly.
- [ ] **Hospital Dashboard:** Pending confirmations, acceptance SLA, average response time, expired requests, doctor response rate tracked correctly.
- [ ] **Department-Level Routing:** When doctor unavailable in department → next available doctor in same department offered.
- [ ] **Smart Escalation:** 30min → doctor notified again, 45min → dept coordinator notified, 55min → hospital admin notified, then expire + recommend.
- [ ] **Live Queue Integration:** After confirmation → queue generated, estimated waiting time, live queue position displayed.
- [ ] **AI Recommendations:** On expiry → same specialty, same hospital, nearest affiliated hospital, earliest slot, highest-rated doctor suggested.
- [ ] **Configuration:** Hospital-level mode, doctor-level override, consultation type override, emergency bypass, max pending requests, auto expiry duration all configurable.
- [ ] **Security:** Only assigned doctor may confirm, hospital admins may override, all actions audited, status transitions immutable.

### 5. Reception Desk Operations
- [ ] **Fuzzy Search:** Patient search correctly identifies patients despite typos or phonetic variations.
- [ ] **Duplicate Guard:** System flags potential duplicate registrations based on mobile number or name + DOB.
- [ ] **Walk-in Flow:** Convert a walk-in patient registration directly to a queued appointment slot.
- [ ] **Check-in to Active:** Verify check-in updates appointment status to `CHECKED_IN` and generates a sequential queue token.

### 6. Admin Management Flow
- [ ] **Verification Pipeline:** Super Admin registers a hospital → Audits license documents → Approves hospital → Hospital Admin receives welcome notification and setup wizard unlock.
- [ ] **Subscription Gate:** Expire subscription → Verify HMS dashboard access is blocked with upgrade CTA → Upgrade plan → Verify features unlock instantly.

---

## 🌐 Platform Infrastructure Testing

### 1. Multi-Browser & Client Matrix
Validate layout, functional actions, and cookies across standard configurations:
- [ ] **Desktop:** Chrome (latest), Microsoft Edge (latest), Firefox (latest), Safari (latest).
- [ ] **Mobile:** Android Chrome (responsive layouts), iPhone Safari, iPad Safari (tablet viewport).

### 2. Viewport & Responsive Testing
- [ ] **Device Viewports:** Desktop (1440p, 1080p), Tablet (portrait & landscape), Mobile (portrait), Foldables (dual viewports).
- [ ] **Inputs & Modals:** Ensure modals, datepickers, and dropdowns remain within viewport bounds and are clickable on touch viewports.

### 3. Offline-First & Resiliency
- [ ] **Disconnect Simulation:** Disconnect network in the middle of writing a consultation note → Verify draft is preserved in local state cache.
- [ ] **Reconnect Sync:** Restore connection → Verify drafts are synced and uploaded successfully to the database without duplicates.
- [ ] **Background Uploads:** Verify document upload retries automatically on network recovery.

### 4. Network Simulation
- [ ] **Latency View:** Test under simulated 2G/3G connections → Verify loading skeletons prevent double clicks.
- [ ] **Packet Loss & Latency:** Simulate 10% packet loss and 2000ms latency → Verify request timeouts fail gracefully with clear retry banners.

---

## 🗄️ Database, Queue & Event Testing

### 1. Database Integrity & Rollbacks
- [ ] **Transaction Safety:** Fail a write in a multi-table query (e.g., appointment billing) → Verify the database rolls back to the clean initial state.
- [ ] **Deadlock Resistance:** Simulate high concurrent booking writes on identical slots → Verify database handles locks without crashing.
- [ ] **Orphan Audits:** Check database for orphaned rows (e.g., visits without active patients) after deletion simulations.

### 2. Queue Operations & Resilience (BullMQ)
- [ ] **Duplicate Prevention:** Verify identical scheduled cron alerts are not queued twice.
- [ ] **Dead Letter Queue (DLQ):** Failed notification dispatches are moved to the DLQ after maximum retries.
- [ ] **Queue Crash Recovery:** Kill Redis during active queue execution → Restart Redis → Verify jobs resume from their last checkpoints without data loss.

### 3. Event Bus Decoupling
- [ ] **Domain Event Dispatch:** Verify publishing `AppointmentBooked` triggers notification, analytics updates, and doctor queue additions concurrently.
- [ ] **Schema Conformance:** Validate event payloads match the expected strict schema structure.

---

## 🧠 AI Platform Safety & Accuracy

### 1. Doctor & Patient AI Modules
- [ ] **Prescription Explainer:** Verify patient AI generates explanations using layman terminology and includes a prominent medical disclaimer.
- [ ] **SOAP Drafting:** Verify doctor AI extracts vitals and chief complaints correctly from raw clinical audio/notes.
- [ ] **ICD-10 Suggestions:** Verify accuracy of suggested ICD-10 codes against seeded classifications.

### 2. Safety Guards
- [ ] **Hallucination & Bias Audit:** Audit AI outputs against a validated clinical test dataset.
- [ ] **Prompt Injection & Jailbreak:** Verify the AI refuses to answer non-medical queries or execute arbitrary system prompts.
- [ ] **PIH/Allergy Fallback:** Ensure AI recommendations do not suggest drugs marked as contraindicated in the patient's record.

---

## 🔒 Security Hardening (OWASP API Top 10)

- [ ] **Broken Object Level Authorization (BOLA/IDOR):** Verify modifying the patient ID or hospital ID parameter in API requests returns a `403 Forbidden` response.
- [ ] **Broken User Authentication:** Test session hijacking, session fixation, JWT manipulation, and refresh token theft scenarios.
- [ ] **Excessive Data Exposure:** Verify API responses do not expose sensitive internal columns (e.g., raw password hashes, internal staff logs).
- [ ] **Rate Limiting:** Verify brute-force attempts on login/OTP endpoints trigger a `429 Too Many Requests` block.
- [ ] **XSS & Injection:** Test script injections in forms and verify files uploaded are scanned for viruses and have secure, sandboxed URLs.

---

## 🛠️ Disaster Recovery & Monitoring

### 1. Resiliency Drills
- [ ] **Database Failover:** Simulate a primary database crash → Verify secondary replica takes over within target SLA.
- [ ] **Provider Outages:** Simulate WhatsApp gateway downtime → Verify automatic fallback to SMS sends critical transaction notifications.
- [ ] **Restoration Validation:** Perform a complete restore from a production backup dump → Verify data integrity and target recovery time (<30 mins).

### 2. Monitoring & Alerts (Sentry / Prometheus)
- [ ] **Alert Thresholds:** Verify CPU/Memory spikes (>85%) or connection pool exhaustion triggers immediate PagerDuty alerts.
- [ ] **Slow Query Tracking:** Verify queries taking >500ms are logged to slow query logs.
- [ ] **Sentry Audits:** Verify all server exceptions are logged to Sentry with scrubbed PII.

---

## ♿ Accessibility & Usability (A11y)

- [ ] **Keyboard Navigation:** Verify all interactive fields, setup wizards, and dropdowns can be navigated using Tab, Enter, and Arrow keys.
- [ ] **Screen Readers:** Verify ARIA labels, alt text, and semantic HTML structure pass screen reader audits (JAWS/NVDA).
- [ ] **Contrast & Font Scaling:** Verify color contrast meets WCAG AA standards. Ensure pages remain readable when zoomed to 200%.

---

## 🏢 SaaS Tenant Validation

- [ ] **Suspension Gates:** Suspend a hospital account → Verify all active staff sessions are terminated and subsequent login requests are blocked.
- [ ] **Plan Gates:** Verify a hospital on a Basic Plan is blocked from using Advanced Analytics or AI modules.
- [ ] **Isolation Audits:** Verify that raw database connections using tenant configurations are strictly bounded by RLS boundaries.

---

## 🎯 Clinical Validation (Pediatric & Maternity Signature)

- [ ] **Growth Charts:** Verify plotted centiles match WHO growth criteria based on patient weight/height/age.
- [ ] **Vaccination Schedule:** Ensure calculated schedules dynamically align with IAP vaccination guidelines.
- [ ] **Clinician Dose Calculator:** Verify dose calculator calculations against standard pediatric reference formula outputs.

---

## 📊 Performance Testing SLA Limits

Under load, verify that the platform maintains the following target metrics:

| Scenario / Metric | Target Target | Status |
|---|---|---|
| **100 Active Hospitals** | Stable (CPU < 50%, Memory < 70%) | ☐ |
| **1,000 Active Doctors** | Stable | ☐ |
| **100,000 Patient Records** | Stable (search indexing <500ms) | ☐ |
| **500 Concurrent Bookings** | Stable (zero transaction failures) | ☐ |
| **100 Concurrent Consultations** | Stable | ☐ |
| **Queue Latency** | < 100 milliseconds | ☐ |
| **Database Connections** | Kept within active pool limits | ☐ |

---

## 🚦 Production Smoke Tests (Post-Deployment validation)

Run these checks on every production deployment:
- [ ] Hospital onboarding setup wizard completes.
- [ ] Patient login and OTP verification succeeds.
- [ ] Slot booking and token generation flows complete.
- [ ] Doctor queue dashboard updates and consultation note saves.
- [ ] Billing invoice generates and updates status to paid.
- [ ] WhatsApp/SMS receipt notification is received.
- [ ] Structured `/api/health` returns all green statuses.

---

## 👥 User Acceptance Testing (UAT Role Checklists)

### 1. Receptionist Checklist
- [ ] Can register a new patient in <60 seconds.
- [ ] Can search and locate a returning patient by mobile number.
- [ ] Can print a physical token receipt with the correct layout.
- [ ] Can collect payments and issue bill receipts.

### 2. Clinician (Doctor) Checklist
- [ ] Can view the correct patient queue order on login.
- [ ] Can review patient history and timeline files.
- [ ] Can write and sign a prescription in <30 seconds mouse-free.
- [ ] Can order tests and view lab files easily.

### 3. Hospital Admin Checklist
- [ ] Can manage hospital branding settings (logo, primary color).
- [ ] Can view billing totals and export billing invoices.
- [ ] Can edit doctor shift schedules and manage staff profiles.

---

## 🎯 Real Hospital Pilot Testing (Hard Launch Gate)

Before the platform is launched publicly, execute a simulated or live pilot with:
- **Participants:** 2 Doctors, 2 Receptionists, 1 Hospital Admin, 1 Nurse, 20–50 Patients (or test accounts).

### Metrics to Measure & Document:
- [ ] Patient registration completion time (Target: <1 minute).
- [ ] Doctor consultation completion time (Target: <2 minutes per patient).
- [ ] Billing and receipt printing completion time (Target: <30 seconds).
- [ ] System stability (Zero unhandled exceptions or crashes).
- [ ] User satisfaction rating (Target: >4.5/5 from staff).

---

## 🚀 Go-Live Gate Checklist (Final Sign-off)

- [ ] **Infrastructure:** Production domain configured, SSL certificate valid, backups verified, monitoring alerts active.
- [ ] **Security:** Penetration testing passed, RLS database validation complete, MFA active, audit log viewer active.
- [ ] **Clinical:** UAT sign-offs completed for patients, doctors, and nurses.
- [ ] **Business:** SaaS billing active, payment gateway live, SMS/WhatsApp APIs validated and approved.
- [ ] **Support:** Operational runbooks complete, support ticket desk active with escalation contact lists.