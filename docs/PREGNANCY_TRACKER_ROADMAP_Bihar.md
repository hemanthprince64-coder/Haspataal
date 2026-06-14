# Haspataal Pregnancy Tracker: Strategic Roadmap for Bihar
## From Basic Profile to Full-Maternity Ecosystem

---

## Executive Summary

The current `PregnancyProfile` model in Haspataal is a **minimal 8-field schema** with a basic patient-facing tracker page. It is, effectively, a digital diary -- not a clinical tool. In Bihar, where maternal mortality remains among India's highest and ANC dropout rates exceed 40% in rural districts, a diary is insufficient.

**Bihar Context at a Glance**:
| Indicator | Bihar | National Average |
|---|---|---|
| Maternal Mortality Ratio (MMR) | **165** per 1,00,000 | 97 |
| Institutional Delivery | **79%** | 88% |
| ANC Registration (>=1 visit) | **65%** | 82% |
| Full ANC (4+ visits) | **37%** | 58% |
| Smartphone Penetration (Rural) | **~35%** | ~55% |
| Feature Phone Dominance | **~60%** | ~35% |

This roadmap transforms Haspataal into a **comprehensive Ante-Natal Care (ANC) operating system** built for the resource-constrained realities of Bihar's PHCs, ASHA workers, and the women they serve.

---

## 1. Current State: What Exists vs. What's Needed

### 1.1 Existing Schema (`PregnancyProfile`)
```prisma
model PregnancyProfile {
  id             String    @id @default(uuid())
  patientId      String    @unique
  lmp            DateTime?
  edd            DateTime?
  gestationalAge Int?
  highRisk       Boolean   @default(false)
  ancVisits      Int?
  dangerSigns    String?
  deliveryPlan   String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

**Existing UI**: `apps/patient-portal/app/(patient)/tracker/page.js` -- a single-page form with static cards. No clinical workflow, no ASHA integration, no offline mode, no government scheme linkage.

### 1.2 The Gap
The desktop HTML roadmap envisions rich clinical features (MCP card, IFA/TT tracking, growth charts, JSY/PMMVY, ASHA management, partograph, AI risk scoring). **None of these exist in the codebase.**

---

## 2. Strategic Architecture: Three-Layer Bihar Maternity Model

```
LAYER 1: PATIENT (Smartphone / Shared Family Phone / Web Kiosk)
   - Maternal Health Portal (Hindi / Bhojpuri)
   - Baby-size widget, trimester tips, supplement reminders
   - Offline mode: view care plan, log symptoms, sync when online

LAYER 2: FRONTLINE (Feature Phone / Basic Android Tablet / USSD)
   ASHA Worker / ANM / Anganwadi
   - Interactive SMS: "Aapki agli chek-up 15 Jan. zaroor aana."
   - USSD visit logging when no data plan
   - WhatsApp voice notes for offline field reporting

LAYER 3: CLINICAL (Haspataal HMS + Bihar PHC)
   Doctor / Nurse / Hospital Admin / NHM Block Officer
   - ANC visit scheduler with auto-high-risk flagging
   - MCP card digitization & government scheme auto-enrollment
   - Lab integration, partograph, referral slip generation
   - ABDM/FHIR compliance, DHIS2 aggregate reporting
```

---

## 3. Phased Roadmap

---

### Phase 0: ANC Module Foundation -- "The Digital MCP Card" (Weeks 1-4)

> **Goal**: Make Haspataal immediately usable for ANC registration and basic tracking in any Bihar hospital. Without Phase 0, the module is not clinically coherent for Indian use.

#### 3.0.1 Refactor Data Models (MotiWolff Foundation)

**Expand `PregnancyProfile`** from 8 fields to a comprehensive maternal record:

| New Field | Type | Purpose |
|-----------|------|---------|
| `gravida` | Int | Total pregnancies |
| `para` | Int | Viable births >=28 weeks |
| `abortions` | Int | Spontaneous/induced |
| `livingChildren` | Int | Living children |
| `bloodGroup` | String | A+/B+/O+/AB+ |
| `rhFactor` | String | Positive/Negative |
| `bmiPrePregnancy` | Float | Baseline BMI |
| `heightCm` | Int | For pelvic adequacy |
| `previousComplications` | String[] | PPH, pre-eclampsia, etc. |
| `conceptionMethod` | String | Natural/IVF/Others |
| `registeredAt` | DateTime | ANC registration timestamp |
| `mcpCardNumber` | String | MoHFW MCP Card ID |

**Add `AncVisit` model** (per-visit record):
| Field | Type | Notes |
|-------|------|-------|
| `visitNumber` | Int | 1st, 2nd, 3rd... visit |
| `gestationalAge` | Int | Weeks at time of visit |
| `bpSystolic` / `bpDiastolic` | Int | Auto-alert on >=140/90 |
| `weightKg` | Float | For weight-gain curve |
| `fundalHeightCm` | Float | SFH measurement |
| `fetalHeartRate` | Int | BPM |
| `edema` | String | None/Mild/Moderate/Severe |
| `presentation` | String | Cephalic/Breech/Transverse |
| `hemoglobin` | Float | g/dL; alert <11 |
| `urineAlbumin` | String | Neg/Trace/+/++/+++ |
| `bloodSugar` | Float | DIPSI result |
| `nextVisitDate` | DateTime | Auto-scheduled |
| `highRiskNotes` | String | Free-text risk notes |
| `conductedBy` | String | Doctor/ANM/ASHA |

**Add `ObstetricHistory` model** for previous pregnancies.

#### 3.0.2 Feature: Gestational Age & Trimester Engine
- Auto-calculate: LMP -> GA (weeks + days), EDD (Naegele's rule)
- Ultrasound correction: If USG EDD differs from LMP EDD by >7 days, prefer USG
- Trimester tagging: Auto-assign FIRST (0-12w), SECOND (13-27w), THIRD (28w+)
- Bihar nuance: Support JSY registration date as LMP fallback when exact LMP unknown
- Offline: Calculation runs client-side in PWA

#### 3.0.3 Feature: MCP Card Digitization (MoHFW Mandatory)
- Map all 24 fields of the Government of India Mother & Child Protection card
- Auto-generation: On first ANC visit, generate a digital MCP card with QR code
- Print output: @media print CSS for 80mm thermal receipt printer
- Bihar context: MCP card is the most recognized document for pregnant women in Bihar PHCs

#### 3.0.4 Feature: IFA & TT Compliance Tracker
- Iron-Folic Acid (IFA): 180-tablet target (1 tablet/day x 180 days, starting 2nd trimester)
  - Auto-alert at 30%, 60%, 90% completion
  - Missed-dose alert after 2 consecutive days
- TT Vaccination: TT1 (16-24 weeks), TT2 (24-36 weeks), Booster (if previous pregnancy >3 years ago)
- Bihar context: IFA compliance is a key NHM indicator
- SMS reminder: "Aapka IFA tablet khatam ho gaya? ASHA didi se lein. Next visit: 15 Jan."

#### 3.0.5 Feature: High-Risk Auto-Flagging (India Criteria)
Auto-tag `highRisk = true` if any of:
- Age <18 or >35
- Height <145 cm
- BMI <18.5 or >30
- Gravida >=4
- Previous C-section / PPH / eclampsia / stillbirth
- Twin / multiple pregnancy
- PIH / GDM / Anemia (Hb <11)
- Rh-negative with unprotected husband

Action Protocol:
1. Auto-generate referral slip
2. Alert assigned ASHA worker via SMS/WhatsApp
3. Schedule shortened visit interval (weekly instead of monthly)
4. Log in existing `EscalationAlert` table

#### 3.0.6 Feature: Baby Size by Week (JoyfulJourney Pillar)
- Fruit/object size comparison (e.g., "Week 12: Your baby is the size of a jamun")
- Weight & length percentile by gestational week
- Indian norms: Use ICMR fetal growth standards (NOT Western IOM)
- Localization: Hindi and BhojpuriLanguages

---

### Phase 0: ANC Module Foundation (contd)

#### 3.0.7 Feature: Patient Retention Engine -- ANC-Specific
*(Missing from original roadmap; critical for Bihar's 40% dropout rate)*

The existing `retention.service.ts` handles generic care pathways. We **extend it** with an ANC-specific retention funnel:

```
ANC RETENTION FUNNEL:
Registration (Week 0)
   | (Dropout risk: 15%)
1st Visit (<12 weeks) -- SMS + ASHA home visit on miss
   | (Dropout risk: 25%)
2nd Visit (20-24 weeks) -- Growth chart milestone, baby-size notification
   | (Dropout risk: 30%)
3rd Visit (28-32 weeks) -- TT2 reminder, high-risk re-flagging
   | (Dropout risk: 35%)
4th Visit (36-40 weeks) -- Delivery preparedness, birth plan review
   |
Delivery & Post-Natal (Day 1/3/7/42)
```

**Retention Interventions**:
| Trigger | Channel | Message (Hindi example) |
|---------|---------|------------------------|
| Missed 1st visit | SMS to patient + ASHA | "Aapki pehli chek-up miss ho gayi. ASHA didi aapke ghar aayengi." |
| Missed 2nd visit | WhatsApp + call from ANM | "Baby ka growth check zaroori hai. Block hospital ka slot book karein." |
| Missed 3rd visit | SMS + JSY warning | "PMMVY 2nd installment ke liye 3rd visit zaroori hai." |
| Missed 4th visit | ASHA + auto-referral | High-risk alert to CHC for institutional delivery prep |

#### 3.0.8 Feature: Follow-Up Setup Wizard
*(Missing from original roadmap; critical for care continuity)*

A dedicated wizard (extending the existing 12-step hospital setup wizard in `lib/setup/completion-engine.ts`) for **configuring ANC follow-up protocols per hospital**:

**Wizard Steps**:
1. **ANC Protocol Selection**: Standard WHO (4 visits) vs. Extended (8 visits for high-risk) vs. Custom
2. **Visit Schedule**: Auto-populate visit dates based on LMP/EDD
3. **Supplement Protocol**: IFA start date, calcium start, TT schedule
4. **Lab Schedule**: Which tests at which visit (Hb at every visit? VDRL once?)
5. **High-Risk Rules**: Which criteria trigger alerts (hospital-configurable)
6. **ASHA Assignment**: Link ASHA workers to patients by village/pincode
7. **Scheme Enrollment**: Auto-check JSY/PMMVY eligibility on registration
8. **Notification Templates**: Customize SMS/WhatsApp reminder content per visit
9. **Print Templates**: MCP card print format, referral slip format
10. **Activate**: Generate patient care plan with all visit dates locked in

**Output**: A `CarePlan` record linked to the pregnancy, with scheduled `NudgeSchedule` entries for each milestone.

#### Phase 0 Deliverables
- [ ] Refactored `PregnancyProfile` + new `AncVisit`, `ObstetricHistory` models
- [ ] Patient tracker page: baby-size widget, trimester indicator, MCP card QR, supplement tracker
- [ ] Hospital admin: ANC registration list, high-risk filter, visit completion dashboard
- [ ] IFA/TT tracking with SMS reminder pipeline
- [ ] High-risk auto-flagging with referral-trigger logic
- [ ] **ANC Follow-Up Setup Wizard** (10-step care plan configuration)
- [ ] **ANC Retention Engine** (dropout prediction + intervention triggers)
- [ ] Digital MCP card generation + thermal print output

---

### Phase 1: Clinical Depth -- "The Doctor's & ASHA's Toolkit" (Weeks 5-8)

#### 3.1.1 Lab Investigation Tracker
Track the standard ANC panel across visits:

| Investigation | Timing | Alert Threshold | Bihar Note |
|---------------|--------|-----------------|------------|
| Hemoglobin | Every visit | <11 g/dL | Anemia is hyper-endemic |
| Blood Group + Rh | 1st visit | Rh-negative -> anti-D alert | Rh incompatibility |
| VDRL | 1st visit | Reactive -> treatment | Syphilis screening mandatory |
| HIV | 1st visit | Reactive -> PPTCT referral | PPTCT program |
| HBsAg | 1st visit | Reactive -> hepatologist | HBV risk |
| TSH | 1st visit | >4.0 mIU/L | Hypothyroidism common |
| Urine R/M | Every visit | Albumin +1 or more | Early PIH indicator |
| Blood Sugar (DIPSI) | 24-28 weeks | >=140 mg/dL | GDM screening |
| Sickle Cell | 1st visit (tribal) | Positive -> counseling | High prevalence in tribal belt |
| Urine Culture | 12-16 weeks (symptomatic) | >10^5 CFU | UTI common in pregnancy |

Integration: Reuses existing `DiagnosticOrder` + `DiagnosticResult` models.

#### 3.1.2 Growth Charts (Indian ICMR Norms)
1. **Maternal Weight Gain Curve**: Plot weight against ICMR ranges by pre-pregnancy BMI
2. **Symphysiofundal Height (SFH) Chart**: Alert on lagging growth (IUGR suspicion)
3. **Cardiff Fetal Kick Chart**: From 28 weeks, alert if <10 kicks in 12 hours

#### 3.1.3 BP Trend + PIH Early Detection
- Visual BP chart: Systolic and diastolic plotted against gestational age
- Auto-alert triggers: BP >=140/90 (twice, 4h apart), proteinuria >=1+, headache + visual disturbances
- Auto-action: Generate PIH protocol reminder, schedule weekly visits, auto-generate referral slip to higher center

#### 3.1.4 JSY / PMMVY Scheme Eligibility & Tracking
- Auto-check on ANC registration: BPL status, Aadhaar, bank account
- Track installments:
  - JSY Instalment 1: Registration + 1st ANC visit
  - JSY Instalment 2: Institutional delivery
  - JSY Instalment 3: Postnatal check-up (Day 42)
  - PMMVY Instalment 1: Early registration (<150 days)
  - PMMVY Instalment 2: 1st ANC
  - PMMVY Instalment 3: Childbirth + institutional delivery
- Auto-alert if missing prerequisite documents

#### 3.1.5 ASHA / ANM Assignment & Visit Logging
- ASHA Worker Profile: Name, mobile, village, block, panchayat, assigned patients
- Home Visit Log: Date, vitals, symptoms, IFA distributed, TT given
- Digital MCP Card Update: ASHA updates patient MCP card status via simple mobile interface
- Bihar context: Basic SMS-based visit logging ("Type VISIT <patient_id> <date>") dramatically improves ANC data quality

#### 3.1.6 Calcium, Folic Acid & Micronutrient Tracker
- Folic acid: 5 mg/day from pre-conception to 12 weeks
- IFA: As in Phase 0
- Calcium: 1 g/day from 14 weeks till delivery
- Patient view: Simple "taken / not taken / forgot" daily check-in
- Compliance score: Percentage displayed for doctor and patient
- SMS nudge: "Aaj calcium tablet le lo -- baby ki haddiyan majboot bana rahi ho."

#### 3.1.7 Retention Strategy: Deepening the Funnel
Predictive dropout risk scoring:

| Risk Factor | Weight | Example |
|-------------|--------|---------|
| Distance from facility >10km | +30 | Remote panchayat |
| No previous institutional delivery | +25 | First-time mother |
| No phone in household | +20 | Cannot receive SMS |
| Young primigravida (<20 years) | +15 | Social constraints |
| High-risk flagged | +10 | Fear-driven dropout |
| Missed previous visit | +15 | Strong dropout predictor |

Intervention matrix:
- Score 0-30: Standard SMS reminders
- Score 31-60: ASHA home visit + ANM call
- Score 61-80: Escort arrangement (ASHA accompanies to hospital)
- Score 81-100: Block-level NHM transport voucher

#### Phase 1 Deliverables
- [ ] Lab tracker with ANC-specific alert thresholds
- [ ] Weight gain, SFH, and kick-count charts (Indian norms)
- [ ] BP trend chart with PIH auto-alert and protocol trigger
- [ ] JSY/PMMVY eligibility checker and disbursement tracker
- [ ] ASHA worker module (profile, assignment, visit logging)
- [ ] Supplement tracker with daily compliance scoring
- [ ] Predictive dropout risk scoring matrix

---

### Phase 2: Digital Health Integration -- "ABDM & The Patient Portal" (Weeks 9-14)

#### 3.2.1 ABHA ID Linking for Pregnant Mothers
- Auto-create ABHA on ANC registration if no ABHA exists
- Consent flow for ANC records linked to ABHA
- Family ABHA: Link husband/family member as "caregiver"
- Bihar context: PHC registration desk is the ideal touchpoint for ABHA creation

#### 3.2.2 FHIR-Compliant ANC Summary Export
Map Haspataal models to HL7 FHIR R4:

| Haspataal Model | FHIR Resource | Notes |
|-----------------|---------------|-------|
| `PregnancyProfile` | `Patient` (extension) | Maternal details |
| `AncVisit` | `Encounter` + `Observation` | Each visit = one Encounter |
| Lab results | `Observation` | Hb, BP, urine albumin, sugar |
| `PrescriptionItem` | `MedicationRequest` | IFA, calcium |
| `DiagnosticResult` | `DiagnosticReport` | Lab reports |
| High-risk alerts | `CarePlan` + `RiskAssessment` | Risk flags |

ABDM Integration:
- Push ANC Encounter summaries to ABDM HIP gateway
- Enable cross-facility care context sharing
- Support ABDM "Share Your Health Records"

#### 3.2.3 Newborn Record Auto-Creation
- Trigger: On delivery entry, auto-create:
  - Baby `Patient` record (linked to mother's `Patient`)
  - Baby ABHA (if ABDM supports)
  - Pediatric `CarePlan` (immunization schedule, growth tracking)
- Bihar context: Simplifies civil registration for births

#### 3.2.4 Regional Language Patient Portal
- Languages: Hindi (hi) and Bhojpuri (bho)
- Content: Trimester-specific education, baby-size widget, Indian dietary advice
- Low-bandwidth: RSC-first rendering, minimal JS, disabled analytics on 2G
- Voice support: TTS (Text-to-Speech) for prescription readback in Hindi

#### Phase 2 Deliverables
- [ ] ABHA creation and linkage for ANC patients
- [ ] FHIR ANC summary export (Encounter + Observation bundles)
- [ ] Newborn auto-record creation with pediatric CarePlan
- [ ] Hindi + Bhojpuri patient portal with diet education
- [ ] TTS prescription readback for low-literacy patients

---

### Phase 3: The Moat -- "Analytics, Referral & AI" (Weeks 15+)

#### 3.3.1 Maternal Health Analytics Dashboard
For hospital admins and NHM block officers:

| KPI | Definition | Bihar Relevance |
|-----|-----------|-----------------|
| ANC Registration Rate | % pregnant women registered | NHM mandate: >90% |
| ANC 4+ Visit Completion | % completing all 4 visits | Key JSY/PMMVY criterion |
| Institutional Delivery Rate | % deliveries in facility | MMR reduction driver |
| Anemia Prevalence | % with Hb <11 g/dL | Hyper-endemic in Bihar |
| GDM Detection Rate | % with DIPSI >=140 | Rising concern |
| High-Risk Identification | % flagged as high-risk | Early intervention metric |
| Dropout Rate by Trimester | % lost to follow-up | Retention engine effectiveness |
| C-Section Rate | % LSCS | Quality indicator |
| JSY/PMMVY Disbursement | Rupee benefits transferred | Financial inclusion |

Features:
- Drill-down by district -> block -> panchayat -> village
- Heat map of high-risk pregnancies by geography
- ASHA performance dashboard (visits logged, patients retained)

#### 3.3.2 Referral Slip Generator
- Auto-generate for high-risk pregnancies: patient details, gestational age, risk factors
- Print: 80mm thermal receipt + A4 for file
- SMS to patient: "Dr. Sharma ne aapko Patna PMCH refer kiya hai. Ambulance aa rahi hai."

#### 3.3.3 Partograph Integration
- WHO Partograph for active labour monitoring
- Alert on: Prolonged labour (>12h primigravida, >8h multigravida), fetal distress (FHR <110 or >160)
- Bihar context: Currently paper-based in most PHCs; digitization reduces errors

#### 3.3.4 Emergency Integrations
- 108 Ambulance: One-click request from high-risk alert screen (EMRI 108 API)
- Blood Bank Locator: Nearest blood bank by pincode (e-Raktkosh API)
- Emergency Contact: Auto-dial CHC/Medical College for severe pre-eclampsia, hemorrhage

#### 3.3.5 AI Risk Prediction
- Input: Pregnancy vitals trend (BP, weight, Hb, urine albumin, blood sugar)
- Output: Risk scores for pre-term delivery, pre-eclampsia, GDM complications, IUGR
- Model approach:
  - Phase 1: Rule-based scoring (deterministic)
  - Phase 2: Claude API for risk narrative generation
  - Phase 3: Local model (WebLLM/Ollama) for offline clinics
- Bihar context: AI acts as "digital specialist" when gynecologist unavailable at PHC

#### 3.3.6 Maternal Near-Miss Tracking
- WHO Near-Miss Criteria: Track cases that nearly resulted in maternal death
- Quality audit trail: What intervention prevented death? Time to care, blood availability, referral speed
- Bihar context: Near-miss tracking is a relatively new NHM requirement

#### Phase 3 Deliverables
- [ ] Maternal health analytics dashboard with Bihar NHM KPIs
- [ ] Referral slip generator (print + SMS)
- [ ] WHO Partograph digital interface
- [ ] 108 ambulance + blood bank locator integration
- [ ] AI risk prediction (rule-based + Claude API)
- [ ] Near-miss tracking and quality audit module

---

## 4. Cross-Cutting Concerns: Bihar-First Adaptations

### 4.1 Offline-First Pregnancy Tracker
Following the resource-constrained roadmap (Phase 2), the pregnancy module must work offline:
- **IndexedDB caching**: Care plan, next visit date, supplement schedule, baby-size widget cached locally
- **Offline form entry**: ASHA can log home visits offline; syncs when clinic WiFi available
- **Symptom diary**: Patient logs symptoms offline; alerts trigger on sync

### 4.2 Feature Phone Accessibility
Given Bihar's ~60% feature-phone penetration:
- **Two-way SMS**: Reminders, danger-sign education, simple status replies
- **Missed-call alert**: Patient calls toll-free number; system calls back with Hindi voice message
- **USSD**: *1# for next visit date, *2# for IFA stock status

### 4.3 ASHA Worker Enablement
- **WhatsApp Chatbot**: "Record visit for patient XYZ" (if smartphone available)
- **SMS-based logging** (fallback): `VISIT <patient_id> <date> <bp> <weight>`
- **Simple Tablet App**: Large buttons, Hindi voice prompts, offline-first

### 4.4 Integration with Existing Haspataal Modules
The pregnancy tracker should integrate with:
- **Billing**: JSY/PMMVY disbursement records linked to invoices
- **Diagnostics**: ANC lab orders flow through existing `DiagnosticOrder` model
- **Pharmacy**: IFA/calcium prescriptions generate `PharmacyDispense` records
- **Notifications**: ANC reminders use existing `NotificationTemplate` + `NotificationEventMapping`
- **Retention Engine**: ANC patients enter the existing retention funnel
- **Escalation Alerts**: High-risk pregnancies feed into existing `EscalationAlert` system

---

## 5. Summary: Roadmap at a Glance

| Phase | Theme | Key New Features | Bihar Impact |
|-------|-------|-----------------|--------------|
| **Phase 0** (Wk 1-4) | ANC Foundation | Refactored models, MCP card, IFA/TT tracker, high-risk auto-flag, **follow-up wizard**, **retention engine** | Systematic ANC registration; no woman slips through cracks |
| **Phase 1** (Wk 5-8) | Clinical Depth | Lab tracker, growth charts, BP/PIH alerts, ASHA module, JSY/PMMVY tracker, supplement log, predictive dropout scoring | Doctors get urban-grade tools; ASHAs get digital voice |
| **Phase 2** (Wk 9-14) | Digital Health | ABHA linkage, FHIR export, newborn auto-record, Hindi/Bhojpuri portal, TTS | Interoperability with India's national health stack |
| **Phase 3** (Wk 15+) | The Moat | Analytics dashboard, referral slips, partograph, 108 integration, AI risk scoring, near-miss tracking | PM-level analytics; AI augments doctor availability |

---

## 6. Conclusion

This roadmap transforms Haspataal's current **pregnancy diary** into a **Bihar-grade maternity operating system**. It does not merely add features -- it rethinks every interaction through the lens of Bihar's realities: low connectivity, feature phones, ASHA-driven care, and high maternal risk.

By weaving together clinical depth (PIH detection, growth charts), government compliance (MCP card, JSY/PMMVY, ABDM), frontline worker tools (ASHA module, SMS/USSD), and patient engagement (retention engine, follow-up wizard, regional language portal), Haspataal becomes the first Indian HMS to treat maternity care not as a module, but as a **mission-critical ecosystem**.

**Immediate next step**: Begin Phase 0 with the `PregnancyProfile` schema refactor and the Follow-Up Setup Wizard, as these provide the foundation for everything that follows.
