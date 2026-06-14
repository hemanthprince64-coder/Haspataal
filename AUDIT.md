# Haspataal HMS — Comprehensive Functional Audit Report

> **Date**: 2026-06-04
> **Scope**: Full codebase audit across clinical workflows, compliance, billing, scalability, patient retention, follow-up, and AI features
> **Target Scales**: Single-doctor clinics, Multi-specialty hospitals, Super-specialty hospitals
> **Current State**: 14-step wizard functional, retention/follow-up engine partially built, AI pipeline in place, significant gaps remain

---

## 1. Executive Summary

### Current Platform Maturity: ~65-70%

Haspataal has made significant progress with a solid technical foundation (Next.js 16, Prisma, PostgreSQL, Redis, Turborepo) and several key modules built out:

- **Onboarding**: Multi-track setup wizard (9-14 stages) with clinic-type detection
- **Core HMS**: OPD queue, appointments, prescriptions, basic billing
- **Patient Portal**: Booking, health records, MedChat AI triage
- **Retention Engine**: Follow-up scheduling, chronic escalation alerts
- **Compliance**: DPDP consent framework, ABHA integration hooks
- **AI Pipeline**: Post-visit analysis, care journeys, recovery tracking

### Critical Gaps Identified

| Category | Current | Target | Gap |
|----------|---------|--------|-----|
| Clinical Workflow | 70% | 95% | Missing IPD ward mgmt, OT scheduling, discharge planning |
| Regulatory Compliance | 40% | 100% | DPDP partial, missing NABH, PNDT, MTP, MCI verification |
| Patient Retention | 50% | 90% | Basic follow-ups, missing automated campaigns, NPS |
| Billing/Insurance | 55% | 95% | GST basic, missing TPA integration, insurance claims |
| AI/Post-Visit | 35% | 85% | Visit analysis exists, missing predictive retention, smart follow-ups |
| Scalability | 60% | 90% | Basic multi-branch, missing franchise model, white-label |

---

## 2. Current Architecture Overview

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (Supabase), Prisma 5 ORM
- **Cache/Queue**: Redis (ioredis), BullMQ
- **Auth**: jose JWT, bcryptjs
- **Events**: Custom EventService (EventLog table + Redis Streams)
- **AI**: Gemini 2.5 (via FastAPI microservice), local triage engine

### Key Data Models (from schema analysis)
- **HospitalsMaster**: Core hospital entity with clinic tier, facility type, marketplace settings
- **DoctorMaster + DoctorHospitalAffiliation**: Doctor profiles with credentials, schedules, fees
- **Patient**: Full patient record with ABHA, insurance, family, vitals
- **Appointment + Visit**: Booking and visit tracking with care journeys
- **FollowUp + FollowUpPlan**: Follow-up scheduling and chronic disease tracking
- **EscalationAlert**: Chronic escalation alerts for missed follow-ups
- **Bill + Invoice**: Billing with line items and payments
- **RetentionRule**: Configurable retention rules per hospital
- **DiagnosticOrder + LabOrder**: Lab and diagnostics ordering
- **PharmacyDispense + DrugStock**: Pharmacy inventory and dispensing
- **Notification + NotificationTemplate**: Multi-channel communication
- **Consent**: DPDP-compliant consent management

---

## 3. Detailed Gap Analysis

### 3.1 Clinical Workflow Efficiency

#### What's Working
- **OPD Queue**: Token system, appointment scheduling, slot management
- **Doctor Profiles**: Registration, credentials, schedules, fees
早期的结果 impressive
- **Prescriptions**: Digital prescription pad with templates
- **Basic Diagnostics**: Test ordering, result entry
- **Pharmacy**: Stock tracking, dispensing, expiry alerts
- **IPD Admissions**: Bed allocation, basic admission tracking
- **Ward Management**: Department/unit/bed hierarchy

#### Critical Gaps

**IPD & Inpatient Care (High Priority)**
- Missing comprehensive IPD workflow: Admission orders, nursing notes, progress charts
- No discharge summary automation with AI assistance
- Missing bed turnover analytics and occupancy forecasting
- No ICU-specific monitoring (vitals tracking, nurse rounding)
- Missing OT scheduling and surgical workflow management

**OPD Workflow Refinements (Medium Priority)**
- No pre-consultation vital capture (weight, BP, temperature, SpO2)
- Missing structured chief complaint and history of present illness (HPI)
- No differential diagnosis assistance or decision support
- Missing referral letter generation and tracking
- No e-prescription with drug-drug interaction checking

**Care Coordination (High Priority)**
- Internal referrals exist but without workflow tracking
- No care team messaging or collaboration tools
- Missing handoff protocols between departments
- No care plan sharing with external providers

### 3.2 Regulatory Compliance (India-Specific)

#### What's Working
- **DPDP 2023**: Consent recording and withdrawal, data deletion
- **ABHA**: Basic ABHA address storage, integration hooks
- **GST**: GST number collection, basic HSN code support

#### Critical Gaps

**DPDP 2023 Compliance (High)**
- Consent recording exists but no granular purpose-based consent
- Missing Data Protection Officer (DPO) designation workflow
- No data processing agreement (DPA) templates
- Missing patient rights portal (access, correction, portability, erasure)
- No data breach notification protocol (72-hour reporting to DPB)
- Missing consent audit trail with timestamps and purposes

**Medical Council & Registration (Critical)**
- Doctor registration numbers stored but not verified against MCI/NMC
- No automated verification of medical degrees or council registrations
- Missing license expiry tracking and renewal reminders
- No facility registration verification (state medical services)

**NABH Accreditation (High)**
- `nabhAccredited` boolean field exists but no checklist or gap analysis
- Missing NABH-required forms and documentation
- No quality indicator tracking (infection rates, readmission rates)
- Missing incident reporting and RCA (Root Cause Analysis) workflows

**PNDT Act Compliance (Critical for OB如下)**
- No PNDT compliance tracking for ultrasound facilities
- Missing mandatory declaration forms
- No equipment registration tracking

**MTP Act & Other Regulations**
- Missing MTP (Medical Termination of Pregnancy) Act compliance logging
- No surrogacy regulation compliance (when applicable)
- Missing clinical trial patient consent (if applicable)

**CDSCO & Drug Regulations**
- Drug stock tracking exists but no DARA/PARA schedule enforcement
- Missing narcotic drug register (Schedule H, H1)
- No batch recall tracking and notification

### 3.3 Patient Management

#### What's Working
- Patient registration with demographics and contact details
- Family member management
- Medical history, medication, allergy tracking
- Vital records (BP, weight, etc.)
- Vaccination records
- Pregnancy profiles
- Insurance detail storage
- ABHA address linking

#### Critical Gaps

**Patient Engagement (High)**
- No patient education content library (disease-wise, language-specific)
- Missing symptom checker or pre-visit questionnaires
- No patient-reported outcomes (PRO) collection
- Missing health goal tracking and achievement

**Communication (High)**
- WhatsApp/SMS templates exist but no campaign management
- Missing automated appointment reminders (Email, SMS, WhatsApp)
- No post-visit satisfaction surveys (NPS/CSAT)
- Missing health tips and preventive care alerts

**Access & Convenience (Medium)**
- Basic online booking exists but no express check-in
- Missing digital health card/ID generation
- No health milestone celebrations (e.g., "Congrats on 1 year diabetes-free")
- Missing family health dashboard (view all family members' health)

### 3.4 Billing, Insurance & Payment Integration

#### What's Working
- Basic billing with line items, GST calculation, invoice generation
- Hospital billing profile (bank details, GST, TDS)
- Wallet system for patient payments
- Service catalog with base prices
- Invoice sequencing and prefix configuration

#### Critical Gaps

**Insurance & TPA (High Priority)**
- Insurance detail storage exists but no cashless claim processing
- Missing TPA (Third Party Administrator) integration (Max Bupa, Star Health, etc.)
- No pre-authorization request/approval workflow
- Missing insurance eligibility verification
- No claim tracking and reconciliation

**Advanced Billing (High Priority)**
- Missing package/bundle billing (surgery packages, health checks)
- No deposit/advance collection and utilization tracking
- Missing consultant payout calculation with revenue share
- No TDS (Tax Deducted at Source) calculation and certificates
- Missing credit limit and patient account balance management

**Payment Gateway Integration (Medium)**
- No Razorpay/Stripe/Paytm integration for online payments
- Missing UPI QR code generation for in-clinic payments
- No partial payment or installment plan support
- Missing payment reconciliation with bank statements

**Financial Reporting (High Priority)**
- Basic revenue metrics exist but no comprehensive financial reports
- Missing Tally/QuickBooks/Zoho Books integration
- No GST return filing export (GSTR-1, GSTR-3B)
- Missing doctor-wise revenue and payout reports
- No expense tracking or P&L dashboard

### 3.5 Scalability

#### What's Working
- Multi-tenant architecture with hospital_id isolation
- Basic multi-branch support (branches table, branch scoping)
- Role-based access control (RBAC) with hospital-specific roles
- Marketplace listing for hospitals

#### Critical Gaps

**Franchise / Chain Hospital Model (High)**
- No franchisee management (franchisor vs franchisee billing, royalty)
- Missing centralized procurement across branches
- No inter-branch patient transfer workflow
- Missing cross-branch doctor availability and scheduling

**White-Label / SaaS Model (Medium)**
- No white-label customization (branding, domain, email)
- Missing tenant-level configuration isolation
- No custom feature toggle per tenant

**Performance (Medium)**
- Database queries not fully optimized (some N+1 patterns)
- Missing read replicas for analytics queries
- No CDN for static assets and media
- Missing database partitioning for large tables (visits, appointments)

### 3.6 Patient Retention & Follow-Up (Main Focus)

#### What's Working
- **Follow-up scheduling**: Schedule follow-ups with specific dates and care pathways
- **Nightly worker**: Automated scan for due/missed follow-ups
- **Chronic escalation**: 2+ missed chronic follow-ups trigger escalation alerts
- **Escalation worker**: Alerts doctors via WhatsApp/SMS for missed chronic follow-ups
- **Care journeys**: AI-generated recovery plans after visits
- **Retention rules**: Configurable retention rules per hospital

#### Critical Gaps

**Automated Retention Campaigns (High Priority)**
- No automated patient re-engagement campaigns (e.g., "We miss you" after 90 days)
- Missing birthday/anniversary health check offers
- No seasonal campaign management (flu shots, diabetes day)
- Missing referral program ("Refer a friend, get discount")

**Smart Follow-Up Intelligence (High Priority)**
- Follow-ups are manually scheduled only — no AI-driven follow-up recommendations
- Missing predictive follow-up scheduling (e.g., "Schedule follow-up for diabetes patient in 3 months")
- No automated follow-up reminders with personalized messaging
- Missing care gap analysis ("Patient with diabetes hasn't visited in 6 months")

**Patient Feedback & NPS (High Priority)**
- No post-visit satisfaction survey (NPS/CSAT)
- Missing review collection and management
- No sentiment analysis of patient feedback
- Missing complaint tracking and resolution workflow

**Loyalty & Rewards (Medium Priority)**
- No loyalty points program for frequent patients
- Missing membership programs (annual health check packages)
- No VIP patient management (priority booking, dedicated coordinator)

**Community & Engagement (Medium Priority)**
- No patient community features (support groups, health challenges)
- Missing health tip campaigns via WhatsApp
- No gamification (health streaks, achievement badges)

### 3.7 Post-Visit AI Features

#### What's Working
- **Post-Visit AI Pipeline**: `services.ai.processVisit()` generates care journeys
- **Care Journey Analysis**: Recovery state tracking, drift analysis
- **MedChat AI Triage**: Symptom checker with triage recommendations
- **AI Document Service**: FastAPI microservice for OPD notes, discharge summaries
- **Visit Notes**: AI-generated visit summaries

#### Critical Gaps

**Predictive Analytics (High Priority)**
- No readmission risk prediction before discharge
- Missing no-show prediction for appointments
- No patient churn prediction (who will stop coming)
- Missing revenue forecasting based on appointment pipeline

**AI-Powered Personalization (High Priority)**
- No personalized health content recommendations per patient
- Missing AI-driven appointment scheduling (optimal slot prediction)
- No automated care plan adjustments based on recovery data
- Missing drug-drug interaction AI alerts at prescription time

**Voice & NLP (Medium Priority)**
- No voice-based prescription entry for doctors
- Missing NLP for medical note summarization
- No AI scribe for doctor-patient conversations
- Missing multilingual support for AI (Hindi, Marathi, Tamil, etc.)

**Image & Report Analysis (Medium Priority)**
- No AI-based X-ray/CT/MRI preliminary analysis
- Missing lab report anomaly flagging
- No retinal scan analysis for diabetic retinopathy
- Missing skin lesion analysis for dermatology

---

## 4. Scale-Specific Analysis

### 4.1 Single-Doctor Private Clinics (Tier-2/3 Cities)

**Typical Profile**: 1 doctor, 1-2 staff, 20-50 patients/day, OPD only, minimal inventory

#### Current Fit: Moderate (65%)

**Strengths**:
- Simple OPD workflow and token system work well
- Discovery wizard correctly simplifies to 9 stages
- Doctor profile and schedule setup is comprehensive
- Basic billing and GST support

**Critical Gaps**:
- **No quick OPD mode**: Need 1-tap visit start, auto-fill common complaints, fast prescription
- **Missing personal branding**: Solo doctors need their name/logo prominently, not just hospital
- **No housekeeping income tracking**: Need expense tracking for clinic rent, utilities, staff salaries
- **WhatsApp Business API integration**: Solo doctors rely heavily on WhatsApp for everything
- **No home visit management**: Need to track house calls, route optimization
- **Missing sample medicine tracking**: Need to track pharma samples given to patients

#### Recommended Priority Features
1. **Quick OPD Module**: 1-tap visit, auto-fill chief complaints, voice-to-prescription
2. **Personal Branding**: Solo clinic branding, doctor-specific online profile
3. **WhatsApp First**: All communication, booking, prescription delivery via WhatsApp
4. **Simple Accounting**: Income/expense tracking, tax-ready reports (no complex accounting)
5. **Sample Medicine Tracker**: Pharma sample dispensing and reporting

### 4.2 Multi-Specialty Hospitals (50-200 Beds)

**Typical Profile**: 5-20 specialists, 50-200 beds, OPD + IPD, lab, pharmacy, imaging

#### Current Fit: Moderate (60%)

**Strengths**:
- Department and ward management with bed allocation
- Multi-doctor scheduling and consultation fees
- Basic IPD admissions and discharge
- Pharmacy and lab modules present

**Critical Gaps**:
- **OT & Surgery Management**: Missing OT scheduling, surgery checklist, implant tracking
- **ICU/NICU Monitoring**: No high-acuity care workflows, ventilator tracking
- **Blood Bank Integration**: No blood stock, cross-matching, transfusion records
- **Diet & Nutrition**: Missing diet orders and nutritionist workflow
- **Physiotherapy & Rehab**: No therapy session tracking
- **Referral Commission Tracking**: Commission to referring doctors/clinics
- **Corporate Health Checkups**: Package management for corporate clients

#### Recommended Priority Features
1. **OT Management**: Surgery scheduling, checklists, implant tracking, surgical notes
2. **ICU/NICU Workflow**: High-acuity monitoring, nurse rounding, critical value alerts
3. **Blood Bank**: Stock, cross-matching, transfusion records
4. **Diet & Nutrition**: Diet orders, kitchen management, patient meal tracking
5. **Physiotherapy**: Session scheduling, exercise tracking, progress notes
6. **Corporate Health**: Package management, bulk reporting, corporate billing

### 4.3 Super-Specialty Hospitals (200+ Beds)

**Typical Profile**: Super-specialists, advanced diagnostics, research, teaching, franchise model

#### Current Fit: Low (45%)

**Strengths**:
- Basic multi-branch support exists
- Analytics and reporting foundation present
- Care pathway tracking (chronic disease)

**Critical Gaps**:
- **Sub-specialty Workflows**: Cardiology (ECG, echo, cath lab), Nephrology (dialysis), Oncology (chemo protocols)
- **Clinical Research**: Patient consent for trials, data de-identification, trial management
- **Medical Education**: Resident doctor scheduling, case presentations, skill tracking
- **Quality Assurance**: NABH/NABL full compliance, mortality/morbidity reviews
- **Centralized Procurement**: Inventory across branches, vendor management
- **Franchise Management**: Royalty calculation, brand compliance, shared services billing
- **Telemedicine**: Video consultation, e-prescription across state lines
- **International Patient Services**: Medical tourism, currency, visa assistance

#### Recommended Priority Features
1. **Sub-Specialty Modules**: Cardiology (cath lab), Nephrology (dialysis), Oncology (chemo)
2. **Clinical Research**: Trial management, consent, data export
3. **Medical Education**: Resident management, CME tracking
4. **NABH/NABL Compliance**: Full checklist, quality indicators, incident reporting
5. **Telemedicine**: Video consult, interstate e-prescription
6. **Franchise Management**: Multi-tier billing, royalty, shared services

---

## 5. Appendix: Complete Feature Matrix

| Feature | Single Doctor | Multi-Specialty | Super-Specialty | Status |
|---------|---------------|-----------------|-----------------|--------|
| OPD Queue & Token | ✅ | ✅ | ✅ | Built |
| Appointment Booking | ✅ | ✅ | ✅ | Built |
| Doctor Scheduling | ✅ | ✅ | ✅ | Built |
| Digital Prescriptions | ✅ | ✅ | ✅ | Built |
| Lab Ordering | ✅ | ✅ | ✅ | Built |
| Pharmacy Dispensing | ✅ | ✅ | ✅ | Built |
| IPD Admissions | ❌ | ✅ | ✅ | Basic |
| Ward/Bed Management | ❌ | ✅ | ✅ | Basic |
| OT Scheduling | ❌ | ❌ | ✅ | Missing |
| ICU Monitoring | ❌ | ❌ | ✅ | Missing |
| Blood Bank | ❌ | ❌ | ✅ | Missing |
| Diet & Nutrition | ❌ | ❌ | ✅ | Missing |
| Physiotherapy | ❌ | ❌ | ✅ | Missing |
| Billing & Invoicing | ✅ | ✅ | ✅ | Basic |
| GST Compliance | ✅ | ✅ | ✅ | Built |
| Insurance/TPA | ❌ | ❌ | ✅ | Missing |
| Payment Gateway | ❌ | ❌ | ✅ | Missing |
| Follow-up Scheduling | ✅ | ✅ | ✅ | Built |
| Chronic Escalation | ✅ | ✅ | ✅ | Built |
| Automated Campaigns | ❌ | ❌ | ❌ | Missing |
| NPS/Feedback | ❌ | ❌ | ❌ | Missing |
| Loyalty Program | ❌ | ❌ | ❌ | Missing |
| AI Triage | ✅ | ✅ | ✅ | Built |
| Post-Visit AI | ✅ | ✅ | ✅ | Basic |
| Predictive Analytics | ❌ | ❌ | ❌ | Missing |
| DPDP Consent | ✅ | ✅ | ✅ | Basic |
| ABHA Integration | ❌ | ❌ | ❌ | Partial |
| NABH Compliance | ❌ | ❌ | ❌ | Missing |
| Telemedicine | ❌ | ❌ | ❌ | Missing |
| Multi-Branch | ❌ | ✅ | ✅ | Basic |
| Franchise Model | ❌ | ❌ | ❌ | Missing |
| Corporate Health | ❌ | ❌ | ❌ | Missing |
| Clinical Research | ❌ | ❌ | ❌ | Missing |
| Medical Education | ❌ | ❌ | ❌ | Missing |
