## Context

Haspataal currently serves hospitals with a 14-step setup wizard, multi-department IPD/OPD management, GST-compliant billing, and full ABDM integration. The platform is architected for mid-size hospitals (20+ beds) with complex clinical and financial workflows.

However, the Indian healthcare market has a significant base of **independent single-doctor clinics** (estimated 600,000+ in India) and **small multi-speciality clinics** that cannot justify hospital-level software due to cost, complexity, or lack of technical staff. These clinics currently rely on paper records, WhatsApp for appointment reminders, and manual billing.

This proposal expands Haspataal's addressable market by adding a **Clinic-Facing Tier** — a simplified, lighter version of the existing HMS that retains core clinical utility while removing hospital-specific complexity.

**Stakeholders:**
- **Product**: Clinic-focused feature set, simplified pricing
- **Engineering**: Monorepo extension, new AI service, clinic-scoped RLS
- **Clinical**: Reduced setup complexity, faster onboarding
- **Growth**: Patient acquisition engine, clinic marketing tools
- **Compliance**: PHI, DPDP, ABDM clinic registration

## Goals / Non-Goals

**Goals:**
- Introduce a `ClinicProfile` model that supports both single-doctor and multi-speciality clinic structures
- Build a "Clinic Mode" UI that hides hospital-specific features (IPD, wards, complex billing, multi-branch treasury)
- Implement a Patient Retention Engine calibrated for clinic cadence (not hospital)
- Add an AI Clinical Documentation microservice (FastAPI/Node) for discharge summaries, OPD notes, and prescription drafting
- Create a Patient Acquisition & Growth Engine with local SEO, referral tracking, and specialty visibility
- Support clinic-specific ABDM registration (simplified vs hospital facility ID)
- Maintain strict RLS, PHI redaction, and DPDP compliance across all new clinic flows

**Non-Goals:**
- Deprecating or modifying existing hospital workflows (this is additive)
- Building a separate clinic product codebase (everything lives in existing monorepo)
- IPO-ready analytics for clinics (scope 2)
- Multi-clinic chain management (single clinic/single owner for v1)
- Mobile app for clinic staff (web-only for v1)

## Decisions

| Decision | Alternatives Considered | Rationale |
|---|---|---|
| **Extend `HospitalsMaster` model** with `clinicTier` enum rather than separate table | Create `ClinicsMaster` table | Single table keeps RLS simpler (one `hospital_id` concept), foreign keys consistent, and migration path for clinics upgrading to hospitals. `ClinicProfile` is a 1:1 extension table for clinic-specific fields |
| **AI Documentation as separate microservice** under `services/ai-docs/` | Inline in `medchat/` | AI docs workload is predictable, isolated, and uses different models (GPT-4o for summarization vs Gemini for triage). Separate service allows independent scaling and avoids blocking MedChat |
| **Clinic billing uses simplified HSN/GST rules** | Same hospital GST engine | Clinics under ₹20 lakh revenue are not required to register for GST. Reusing the existing billing engine with a `gstExempt` flag introduces complexity. Simplified billing module is cleaner |
| **Patient Acquisition as EventBus consumers** | Direct insert from acquisition pipeline | Acquisition events (SEO click, referral conversion) must be audit-friendly. EventBus (Redis Streams + EventLog dual-write) is consistent with existing architecture. Analytics dashboard reads from materialized views fed by event consumers |
| **"Clinic Mode" toggled by feature flag** | Separate Next.js app | Feature flag at account level keeps deployment simple, shares auth/session infrastructure, and allows clinics to upgrade to hospital tiers seamlessly |
| **Clinic RLS uses existing `app.hospital_id`** | New `app.clinic_id` | Reusing `hospital_id` as the tenant key keeps existing RLS policies valid. Clinics are just another tenant type. The `clinicTier` flag controls UI and API behavior, not data isolation |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| **Data model bloat** — Adding `ClinicProfile` and related tables could slow down hospital-tenant queries | Separate Prisma views (`hospitalScopedQuery`, `clinicScopedQuery`) with selective includes. `ClinicProfile` has `@ignore` on heavy fields |
| **Feature creep** — Clinic team might ask for hospital-level features, forcing the "simplified" UI to grow | Formal feature-gating. `ClinicProfile.allowedFeatures` is an array enum, with a strict allowlist. Any feature request must pass product review |
| **AI Documentation generating incorrect clinical content** | AI docs service uses structured prompting with Zod output validation. Every generated document is marked `AI_ASSISTED` and requires doctor review/approval before being stored as final. Sentry alerts on >5% rejection rate |
| **Different ABDM clinic vs hospital registration** | ABDM integration already supports facility types. Add a `facilityType` enum (`HOSPITAL`, `CLINIC`) to the existing registration flow. Clinic registration uses a simplified form |
| **Clinic churn due to pricing** | Freemium tier for clinics: free HMS for up to 500 patients/month, then per-patient pricing. Charging per-patient aligns incentives with clinic success |
| **Notification curfew complexity** — Clinics may have different operating hours | `NotificationSchedule` table already exists per-hospital. Clinic mode extends this with `operatingHours` JSON (default: 9 AM–9 PM) that overrides the global 10 PM curfew |

## Migration Plan

1. **Database**: 
   - Add `ClinicProfile`, `ClinicTier`, `PatientAcquisition`, `AIDocument` models via Prisma migration (`npx prisma migrate dev --name add-clinic-tier`)
   - Add `facilityType` column to `HospitalsMaster` (default: `HOSPITAL` for existing records)
   - Backfill: none required (existing hospitals remain `HOSPITAL`)

2. **Services**:
   - Deploy `services/ai-docs/` (new service, port 4003)
   - Register in `docker-compose.yml` and `nginx.conf`
   - Add health check endpoint `/api/health`

3. **Frontend**:
   - Add `isClinicMode()` helper to `lib/session.ts`
   - Gate hospital-only routes in `middleware.ts` for clinic users
   - Add `features/clinic-mode/` directory in patient-portal (separate from `features/hms-core/`)

4. **ABDM**:
   - Update `ABDMRegistrationService` to handle `CLINIC` facility type
   - Update sandbox test credentials for clinic registration

5. **Release**:
   - Feature flag `ENABLE_CLINIC_TIER` in environment (default: `false`)
   - Enable for beta clinics only
   - Gradual rollout to all Tier-2/3 cities

## Open Questions

- [ ] Should clinic AI documentation require mandatory legal disclaimer ("AI-generated, review by doctor") on every page?
- [ ] Should we offer a purely offline option for clinics with unreliable internet (sync later)?
- [ ] Should the patient acquisition engine support clinic-branded landing pages (.haspataal.com/<clinic-slug>)?
