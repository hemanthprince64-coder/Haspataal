# Muzaffarpur Pilot Go-Live Checklist

## 1. Setup & Branch Readiness
- [x] Create Muzaffarpur hospital branch in system.
- [x] Configure branch address, contact numbers, and basic SEO profile.
- [x] Ensure Hospital Admin role is active.
- [x] Setup UI wizard should show 100% completion (Branches, Departments, Services, Users).

## 2. Walk-in Registration (Reception)
- [x] Test new patient registration via fast-entry UI (`/hospital/dashboard/reception`).
- [x] Verify Auto-UHID generation works.
- [x] Test Emergency toggle skips non-essential fields.
- [x] Verify keyboard shortcut (Ctrl+S) works for rapid saving.

## 3. Consultation Workflow (Doctor)
- [x] Test queue loading (`/hospital/dashboard/consultation`).
- [x] Test clinical note-taking (Vitals, Diagnosis, Notes).
- [x] Test prescription UI and repeat-prescription feature.
- [x] Verify Esc cancels current selection and Ctrl+Enter saves consultation.
- [x] Ensure consultation completion writes to Patient EHR seamlessly.

## 4. Billing & Cash Flow
- [x] Verify Quick Bill workflow (`/hospital/dashboard/billing`).
- [x] Ensure services load correctly from Service Catalog.
- [x] Test Keyboard shortcuts (Ctrl+Enter to Collect).
- [x] Verify Shift/Cash Register closing workflow (denomination entry, discrepancy alerts).

## 5. UI/UX & Reliability
- [x] Unified print layouts tested (PrintButton usage for Invoices/Prescriptions).
- [x] Top navigation and bottom navigation (mobile) verified.
- [x] Tables have high density (`px-3 py-2`) and scroll horizontally on mobile.
- [x] Global error boundary intercepts module crashes (`error.tsx`).
- [x] Command Palette (Ctrl+K) allows rapid navigation across modules.

## 6. Pre-Launch Validation
- [x] All 17 phases of the Hospital Pilot Readiness MVP are marked complete.
- [x] TypeScript (`npm run type-check`) passing for UI components.
- [ ] Regression test suite runs clean (zero failures).
- [ ] No PHI, Authorization, or Platform boundary violations.

---

# Mandatory Launch Gates (Pre-Pilot Validation)
Before the Muzaffarpur hospital pilot can officially launch, these 8 objective launch gates must be verified with evidence:

## Gate 1 — Real Hospital Simulation (Mandatory)
Run an entire hospital day.
- [x] 300 OPD patients
- [x] 30 IPD admissions
- [x] 70 Lab orders
- [x] 25 Radiology orders
- [x] 180 Pharmacy dispenses
- [x] No manual database edits. Everything through UI/API.

## Gate 2 — Time Measurement
Automatically measure and verify workflows:
- [ ] Registration: <30 sec
- [ ] Consultation: <3 min
- [ ] Bill: <20 sec
- [ ] Dispense: <30 sec
- [ ] Lab Result: <2 min
- [ ] Search: <200 ms

## Gate 3 — Pilot User Testing
- [ ] Hand the system to Receptionist, Doctor, Nurse, Pharmacist, Lab tech without explanation.
- [ ] Validate they can navigate without asking "Where do I click?". Improve UI if needed.

## Gate 4 — Failure Recovery
Verify no data corruption under stress:
- [ ] Printer disconnected
- [ ] Internet down
- [ ] Browser refresh
- [ ] Duplicate click
- [ ] Power loss
- [ ] Session expiry

## Gate 5 — Security Review
- [ ] No IDOR
- [ ] No tenant leakage
- [ ] No PHI leak
- [ ] Authorization everywhere
- [ ] Audit trail complete

## Gate 6 — Backup & Restore
- [ ] Successfully restore yesterday's backup (not just generate one). Recovery must succeed.

## Gate 7 — Production Deployment
Verify production infrastructure:
- [ ] SSL & Reverse proxy
- [ ] Monitoring & Logging
- [ ] Automatic backups & Health checks

## Gate 8 — Pilot Acceptance
- [ ] Hospital owner signs: *"We can operate tomorrow."*

---

# Validation Sprint 1 Deliverables (Evidence Collection)
At the end of the simulation, the following five reports must be produced:

1. **Workflow Timing Report** (Registration median/P95, Consultation, Billing, Pharmacy dispense, Lab turnaround, Search latency)
2. **Defect Report** (P0-P3 classifications, root causes, resolutions)
3. **Operational Report** (Total patients, appointments, bills, prescriptions, prints, failures)
4. **User Observation Report** (Hesitations, questions asked, navigation mistakes, training gaps)
5. **Release Recommendation** (Ready, Ready with conditions, or Not ready)

---

# RC1 Exit Criteria (Production Promotion)
RC1 will only be promoted to production when **ALL** of the following are objectively true:

- [ ] Zero unresolved P0 issues
- [ ] Zero unresolved P1 issues
- [x] Successful full-day hospital simulation completed
- [ ] Backup restore tested successfully
- [ ] Security review completed
- [ ] Workflow timing targets met
- [ ] Hospital staff complete common tasks with minimal assistance
- [ ] Hospital administrator signs off

---

# Operational Monitoring (Post-Launch)
Before the pilot begins, the following monitoring thresholds must be actively tracked:

| Metric                | Target                          |
| --------------------- | ------------------------------- |
| API uptime            | ≥99% during pilot               |
| HTTP 5xx rate         | <0.1%                           |
| P95 API latency       | Within pilot target             |
| Database connections  | Stable, no exhaustion           |
| Disk usage            | Alert before critical threshold |
| Backup success        | 100%                            |
| Failed login attempts | Monitored                       |
| Application restarts  | Investigated if unexpected      |

---

# Go-Live Rehearsal
Perform this complete dress rehearsal prior to real patient data entry:

1. [ ] Deploy production build.
2. [ ] Register a patient.
3. [ ] Consult.
4. [ ] Bill.
5. [ ] Dispense medication.
6. [ ] Print documents.
7. [ ] Create a backup.
8. [ ] Restore to a test database.
9. [ ] Verify restored data.
10. [ ] Confirm monitoring and logs captured all steps.

---

# Pilot Success Criteria
Before considering the pilot "successful" and moving to MVP 1.2, these objective metrics must be achieved during the pilot period:

| Metric                     | Target                           |
| -------------------------- | -------------------------------- |
| Unplanned downtime         | 0 during pilot days              |
| Unresolved P0 defects      | 0                                |
| Unresolved P1 defects      | 0                                |
| Duplicate appointments     | 0                                |
| Data loss incidents        | 0                                |
| Successful nightly backups | 100%                             |
| Successful restore drill   | 100% (Tested offline)            |
| Staff requiring assistance | Trending downward over the pilot |

---

# First-Week Operating Practice
During the first week of live operations at Muzaffarpur hospital:

1. **End-of-day Review:** Hold a short review with the hospital team every day.
2. **Issue Triage:** Record every issue and classify it as P0–P3.
3. **Hotfixes:** Fix only P0/P1 issues immediately.
4. **Batching:** Batch P2/P3 improvements into scheduled maintenance windows.
5. **Deployment Logs:** Keep detailed deployment notes for every change made during the pilot.
