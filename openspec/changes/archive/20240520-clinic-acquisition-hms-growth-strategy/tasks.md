## 1. Database, Schema & Migrations

- [ ] 1.1 Add `ClinicProfile`, `ClinicTier`, `PatientAcquisition`, `AIDocument` models to `packages/db/prisma/schema.prisma`
- [ ] 1.2 Add `facilityType` enum (`HOSPITAL`, `CLINIC`) to `HospitalsMaster`
- [ ] 1.3 Add `gstExempt` boolean and `operatingHours` JSON fields to `HospitalsMaster`
- [ ] 1.4 Add `notificationSchedule` relationship to `HospitalsMaster` for per-clinic curfews
- [ ] 1.5 Add `doctorReferral`, `patientReferral`, and `referralTracking` tables
- [ ] 1.6 Generate and apply Prisma migration: `npx prisma migrate dev --name add-clinic-tier`
- [ ] 1.7 Create `lib/seeds/clinic-demo-seed.ts` with sample clinic data for local dev

## 2. AI Documentation Microservice

- [ ] 2.1 Create `services/ai-docs/` directory with FastAPI/Node scaffolding, `Dockerfile`, and health check endpoint `GET /api/health`
- [ ] 2.2 Implement `POST /v1/generate-opd-note` — accepts transcript/text + patient context, returns structured OPD note with Zod validation
- [ ] 2.3 Implement `POST /v1/generate-discharge-summary` — accepts clinical notes + EMR summary, returns structured discharge summary
- [ ] 2.4 Implement `POST /v1/generate-prescription` — accepts diagnosis + patient allergies, returns drug/dose/freq/duration with contraindication guardrails
- [ ] 2.5 Add retry logic (3 retries, exponential backoff) and fallback for AI service timeout > 5s
- [ ] 2.6 Add `ai_request_duration_seconds` Prometheus histogram and `ai_requests_total` counter
- [ ] 2.7 Add `ai-docs` service to `docker-compose.yml` on port 4003, add Nginx upstream block
- [ ] 2.8 Add Sentry integration for the service

## 3. Clinic Tier Backend & API

- [ ] 3.1 Update `lib/session.ts` to add `isClinicMode()` helper
- [ ] 3.2 Update `middleware.ts` at gateway level to gate hospital-only routes for clinic users
- [ ] 3.3 Create `GET /v1/clinics/:id/profile` — returns clinic profile with RLS via `pg` transaction
- [ ] 3.4 Create `PATCH /v1/clinics/:id/profile` — update clinic profile, validated with Zod
- [ ] 3.5 Create `GET /v1/clinics/:id/referrals` — list referral analytics for clinic
- [ ] 3.6 Create `POST /v1/clinics/:id/referrals` — log a referral event
- [ ] 3.7 Add `opsField` Zod schema for clinic billing (simplified vs hospital)
- [ ] 3.8 Ensure all new endpoints use `X-Request-ID` correlation header

## 4. Patient Acquisition & Growth

- [ ] 4.1 Create `packages/core/domain/use-cases/TrackReferral.ts` — pure logic class for referral tracking
- [ ] 4.2 Create `packages/infrastructure/prisma/repositories/PrismaReferralRepository.ts` — implements `IReferralRepository`
- [ ] 4.3 Create `GET /v1/analytics/acquisition` — returns patient acquisition metrics (new patients, source attribution, conversion rate, revenue per patient)
- [ ] 4.4 Create `GET /v1/analytics/referrals` — returns referral source breakdown, top referrers, conversion rate per source
- [ ] 4.5 Add `AcquisitionDashboard` React server component in `apps/patient-portal/app/clinic/analytics/page.tsx`
- [ ] 4.6 Add Redis caching for acquisition analytics (1-hour TTL)
- [ ] 4.7 Implement `acquisition.report.worker.js` — generates weekly acquisition report PDF and emails to clinic owner

## 5. Clinic Workflow Optimizer

- [ ] 5.1 Create `apps/patient-portal/components/clinic/TokenQueue.tsx` — real-time token queue with WebSocket or SSE
- [ ] 5.2 Create `apps/patient-portal/components/clinic/QuickPrescriptionTemplate.tsx` — quick template selector with one-click apply
- [ ] 5.3 Add token management API: `POST /v1/clinics/:id/queue/advance`, `GET /v1/clinics/:id/queue/current`
- [ ] 5.4 Add quick prescription template storage (CRUD): `GET/POST /v1/clinics/:id/templates`
- [ ] 5.5 Ensure token queue UI respects `operatingHours` and shows "Clinic closed" outside hours
- [ ] 5.6 Test: queue must handle 100+ tokens without performance degradation

## 6. Patient Retention (Clinic Edition)

- [ ] 6.1 Create `workers/clinic-retention.worker.js` — BullMQ worker with clinic-interval defaults (3, 7, 14 days for acute)
- [ ] 6.2 Add `ClinicFollowUpConfig` model for per-clinic interval customization
- [ ] 6.3 Integrate clinic retention worker with existing `NotificationEngine` (WhatsApp → SMS fallback)
- [ ] 6.4 Add vaccination reminder logic: check `Patient.dateOfBirth` against WHO vaccination schedule, send timed reminders
- [ ] 6.5 Add missed appointment recovery: if patient misses clinic appt and no rebook in 48h, send WhatsApp recovery message with direct link
- [ ] 6.6 Ensure retention notifications respect `operatingHours` curfew for clinic (not global 10 PM)
- [ ] 6.7 Add chronic disease monitoring: diabetes, hypertension, asthma — annual check reminders per `CarePathway`

## 7. Multi-Speciality Infrastructure

- [ ] 7.1 Update `Doctors` model to support `clinicId` (for visiting doctors in multi-doctor clinics)
- [ ] 7.2 Add `GET /v1/clinics/:id/doctors` — list all doctors at a clinic, including visiting doctors
- [ ] 7.3 Add `GET /v1/clinics/:id/doctors/:doctorId/schedule` — get availability for a specific doctor
- [ ] 7.4 Add `POST /v1/clinics/:id/referrals/internal` — create internal referral between doctors in same clinic
- [ ] 7.5 Add cross-speciality EMR sharing: when Doctor B is referred, auto-share `Patient` record sections with `PHI_ACCESS_AUDIT` trail
- [ ] 7.6 Create `RevenueAnalytics.tsx` dashboard component with per-doctor and per-service revenue breakdown

## 8. Clinic Onboarding Simplification

- [ ] 8.1 Add "Clinic Mode" toggle to onboarding wizard (radio: "Hospital" vs "Clinic")
- [ ] 8.2 Hide 8 steps (IPD, Wards, Pharmacy, Diagnostics, Retention, Marketplace, Activation, Billing-complex) when Clinic is selected
- [ ] 8.3 Auto-activate clinic account on completion (skip Activation gate)
- [ ] 8.4 Add simplified ABDM registration form for clinic (no bed count, no NABH)
- [ ] 8.5 Add `ENABLE_CLINIC_TIER` environment flag to `.env.example`
- [ ] 8.6 Update `CLAUDE.md` knowledge base: Clinic mode hides hospital modules, onboarding is 6 steps

## 9. Billing Simplification

- [ ] 9.1 Create `packages/core/domain/use-cases/GenerateClinicInvoice.ts` — simplified invoice without HSN/GST if exempt
- [ ] 9.2 Add `invoiceTemplate` enum: `HOSPITAL_FULL` vs `CLINIC_SIMPLE`
- [ ] 9.3 Update existing `BillingService` to branch on `facilityType` and `gstExempt`
- [ ] 9.4 Test: clinic invoice with `gstExempt=true` must NOT show GST or HSN lines
- [ ] 9.5 Test: clinic with revenue >= ₹20 lakh and `gstExempt=false` must show full GST/HSN
- [ ] 9.6 Add `billingSchemaClinic.ts` for Zod validation of clinic billing inputs

## 10. Frontend — Clinic Mode UI

- [ ] 10.1 Create `apps/patient-portal/components/clinic/ClinicDashboard.tsx` — simplified dashboard with only OPD, Billing, Patients, Appointments, Pharmacy, Follow-ups
- [ ] 10.2 Add `isClinicMode()` guard in `useRole()` hook to hide hospital-only menu items
- [ ] 10.3 Add clinic-specific color theme (optional, keep hospital theme for v1)
- [ ] 10.4 Create `ClinicSidebar.tsx` component (trimmed down from `HospitalSidebar`)
- [ ] 10.5 Create clinic-specific appointment queue page: `apps/patient-portal/app/clinic/queue/page.tsx`
- [ ] 10.6 Add responsive mobile support for clinic token queue (clinic staff use tablets/phones)

## 11. ABDM Clinic Integration

- [ ] 11.1 Update `ABDMRegistrationService` to accept `facilityType` param
- [ ] 11.2 Create simplified registration payload for `CLINIC` type (no bed count, no accreditations)
- [ ] 11.3 Update `/v1/hospitals/onboard` to support `facilityType = CLINIC`
- [ ] 11.4 Add ABDM clinic facility ID to `HospitalsMaster.abdmFacilityId` when registration completes
- [ ] 11.5 Test: clinic ABDM registration succeeds in sandbox

## 12. SEO & Marketing (Patient Acquisition)

- [ ] 12.1 Add `slug` field to `ClinicProfile` for SEO-friendly URLs
- [ ] 12.2 Generate `robots.txt` and `sitemap.xml` for clinic profile pages
- [ ] 12.3 Add Schema.org `MedicalClinic` JSON-LD structured data to each clinic profile page
- [ ] 12.4 Ensure clinic profile pages are statically generated with ISR (1-hour revalidate)
- [ ] 12.5 Add `meta` tags for title, description, OpenGraph images per clinic profile
- [ ] 12.6 Verify with Google Rich Results Test
