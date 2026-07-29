## Why

Haspataal is a multi-tenant hospital SaaS currently targeting mid-size hospitals in Tier-2/3 Indian cities. There is a significant, underserved market of **independent single-doctor clinics and small multi-speciality centers** that operate without structured digital infrastructure. These clinics currently rely on manual workflows, paper records, ad-hoc patient follow-ups, and fragmented tools. There is no scaled solution that combines HMS, patient acquisition, retention automation, and AI-assisted clinical documentation into a single platform for this segment. By expanding Haspataal to serve these clinics, we can:

1. Capture a lower-ACI (Annual Contract Value) but higher-volume market segment
2. Build a sticky patient ecosystem upstream before patients ever reach hospital-level care
3. Use clinic-level EMR data to enrich downstream hospital and ABDM integrations
4. Position Haspataal as a "growth platform" rather than just an HMS vendor

## What Changes

This proposal introduces a **Clinic-Facing Tier** within the existing Haspataal monorepo, specifically designed for:

- **Segment 1**: Independent single-doctor clinics (1 doctor, 1-2 nurses, self-owned pharmacy, external labs, no digital workflow)
- **Segment 2**: Multi-speciality private clinics (1 owner, multiple visiting doctors, own lab/pharmacy/billing, semi-organized operations)

### New Capabilities

1. **Lightweight Clinic HMS Module**: Simplified OPD, digital prescriptions, billing, appointment scheduling, patient records, follow-up reminders, lab/pharmacy integration, digital reports — specifically designed for low-complexity, high-velocity clinic operations
2. **Patient Retention Engine (Clinic Edition)**: Automated follow-up reminders, vaccination reminders, chronic disease tracking, missed appointment recovery, recall systems — calibrated for clinic cadence (not hospital cadence)
3. **Clinic Workflow Optimizer**: Smart appointment queue, token management, quick prescription templates, AI-assisted documentation, integrated billing + pharmacy workflow — designed to reduce doctor waiting time and staff inefficiency
4. **Patient Acquisition & Growth Engine**: Online discoverability, local search optimization, referral optimization, specialty visibility, follow-up conversion — bringing new patients to the clinic, not just managing existing ones
5. **AI Clinical Documentation Assistant**: AI-generated discharge summaries, AI-assisted OPD notes, prescription drafting, structured EMR generation — reducing documentation burden by 40-60%
6. **Multi-Speciality Clinic Infrastructure**: Multi-doctor scheduling, cross-speciality coordination, shared EMR, revenue analytics, referral tracking — for private clinics with multiple visiting consultants

### Modified Capabilities

- **Hospital Onboarding Flow**: The existing 14-step setup wizard must support a "Clinic Mode" with reduced requirements (no IPD, no wards, no complex bed management, simplified billing). This is a requirement change to the existing onboarding spec
- **Billing & Treasury**: Must support simplified clinic billing (no GST for clinics under threshold, no HSN complexity, no multi-branch treasury). GST applicability flag must be relaxed for clinic-tier accounts
- **Notification Engine**: Must support clinic-specific templates, clinic-specific notification curfews, and WhatsApp Business API tiering (clinic vs hospital account limits)
- **ABDM Integration**: Clinic-level facility ID registration is different from hospital-level. Must support Ayushman Bharat clinic registration and simplified health record syncing

## Impact

- **Database**: New `ClinicProfile` model (simplified `HospitalsMaster` variant), new `ClinicTier` enum, new `PatientAcquisition` analytics table
- **Backend**: New clinic-scoped API routes, new clinic billing engine, new AI documentation service (FastAPI/Node microservice), new patient acquisition pipeline
- **Frontend**: New "Clinic Mode" UI in patient-portal (simplified dashboard), new clinic-specific appointment queue, new AI documentation UI, new growth analytics dashboard
- **Infrastructure**: New AI service container, new Redis queues for clinic retention jobs, new BullMQ worker for AI document generation
- **Compliance**: Must maintain PHI protection, RLS, and DPDP compliance within clinic-scoped data. Clinic data must not leak into hospital views
- **Monetization**: New pricing tier for clinics (freemium or per-patient/month model vs hospital per-bed/month model)