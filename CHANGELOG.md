# Changelog

## Engineering History

All notable changes to the Haspataal platform are documented in this file.

## Phase 1 Foundation (2026-06-29)

### Added

#### Database Schema
- `DoctorProfile` table - Personal information, speciality, experience
- `DoctorEducation` table - Education records (MBBS, PG, SS)
- `DoctorCertification` table - Certifications and expiry tracking
- `DoctorSkill` table - Clinical skills and competencies
- `DoctorMembership` table - Professional memberships
- `DoctorPublication` table - Research publications
- `DoctorAward` table - Professional awards
- `DoctorConference` table - Conference presentations
- `DoctorExperience` table - Work experience history
- `DoctorVerification` table - Verification workflow and status
- `DoctorSearchIndex` table - Public discovery index
- `DoctorPublicProfile` table - Patient-facing profile
- `DoctorAvailability` table - Real-time availability computation
- `DoctorHoliday` table - Holiday calendar
- `DoctorLeave` table - Leave management
- `TimelineEvent` table - Clinical timeline events
- `ChiefComplaint` table - Chief complaints tracking
- `ClinicalHistory` table - Patient history records
- `ClinicalExamination` table - Examination findings
- `Diagnosis` table - ICD-10 diagnosis codes
- `InvestigationOrder` table - Lab/radio orders
- `Treatment` table - Treatment procedures
- `ClinicalAttachment` table - Clinical document attachments

#### Shared Packages
- `@haspataal/events` package - Redis Stream event bus singleton
- `@haspataal/scheduler` package - BullMQ cron engine
- `@haspataal/files` package - Secure file storage driver
- `@haspataal/types` updates - Doctor identity and clinical data types

#### Security Middleware
- `authorization.ts` - RBAC middleware with role checking
- `rate-limit.ts` - Redis sliding window rate limiting
- `security.ts` - CSRF protection, CSP headers, security middleware

#### API Routes
- `POST /api/doctors` - Doctor registration (send OTP, verify OTP, create)
- `GET /api/doctors` - List doctors with hospital filter
- `POST /api/doctors/documents` - Document upload with validation
- `GET /api/doctors/documents` - List doctor documents
- `POST /api/doctors/education` - Education records CRUD
- `GET /api/doctors/education` - Get education records
- `PUT /api/doctors/education` - Update education
- `POST /api/doctors/certifications` - Certification records
- `GET /api/doctors/certifications` - List certifications
- `PUT /api/doctors/verification` - Update verification status (admin)
- `GET /api/doctors/verification` - Get verification status
- `POST /api/hospital/doctors/invite` - Hospital-to-doctor invitation
- `GET /api/hospital/doctors/invite` - Get invitations
- `POST /api/patients` - Patient registration with consent/ABHA
- `GET /api/patients` - List patients (staff only)
- `POST /api/auth/otp` - OTP service for authentication

#### Workers & Monitoring
- `credential-expiry.ts` - Credential expiry monitoring worker
- `migrations/01_phase1_rls_policies.sql` - RLS policies for production

#### Testing
- `tests/smoke/phase1.spec.ts` - Smoke tests for health checks and integration

#### CI/CD
- `.github/workflows/phase1-cicd.yml` - Lint, test, build workflows

#### Documentation
- `ADMIN.md` - Platform administration guide
- `HMS.md` - Hospital management system guide
- `DOCTOR.md` - Doctor portal guide
- `PATIENT.md` - Patient portal guide
- `API.md` - Complete API inventory
- `DATABASE.md` - Database architecture
- `SECURITY.md` - Security architecture
- `ANALYTICS.md` - Business intelligence
- `AI.md` - AI platform documentation
- `DEPLOYMENT.md` - Infrastructure deployment
- `QA.md` - Quality assurance guide

### Changed
- Updated `VerificationStatus` enum to include: PENDING, DOCUMENT_PENDING, UNDER_VERIFICATION, VERIFIED, REJECTED
- Removed duplicate `apps/hospital-hms/app/api/doctors/route.js` (consolidated to route.ts)

### Files Modified
- `packages/db/prisma/schema.prisma` - Added 20+ new tables
- `apps/hospital-hms/app/api/doctors/route.ts` - Registration flow implementation
- `apps/hospital-hms/app/api/patients/route.ts` - Patient registration with consent
- `packages/auth/authorization.ts` - RBAC middleware (exists)
- `packages/auth/rate-limit.ts` - Rate limiting (exists)
- `packages/auth/security.ts` - security headers (exists)

### Database Changes
- New tables: 20+ tables added
- New enums: VerificationStatus values expanded
- Foreign key relations: Added to DoctorMaster

### API Changes
- Breaking: None (new endpoints only)

### Migration Notes
- Schema validated and pushed to Supabase
- RLS policies created but not applied (requires manual migration)
- Seed data for new enums may be needed

### Rollback Instructions
- Database rollback requires reverting to previous migration
- Code rollback: Revert to previous git tag
- Files to restore: Previous schema.prisma state

## Phase 2 Doctor Discovery Engine (2026-06-29)

### Added

#### Services
- `DoctorDiscoveryService` - Search aggregation, index management, availability computation
- `distance.js` - Haversine distance calculation utility

#### API Routes
- `GET /api/doctors/search` - Doctor search with filters
- `GET /api/doctors/availability` - Real-time availability check
- `GET /api/doctors/public` - Doctor public profile

#### Integration
- `hooks/useDoctorDiscovery.ts` - Patient portal hooks
- `lib/queue.js` - Added discovery queue for index refresh
- `lib/events/doctor-events.js` - Events for search index updates
- `migrations/02_search_index_triggers.sql` - Database triggers

#### Testing
- `__tests__/discovery.test.ts` - Unit tests for discovery service

#### Security
- RLS policies for read-only discovery access (DoctorSearchIndex, DoctorPublicProfile, DoctorAvailability)

### Phase 2 Planned (Q3 2026)
- `@haspataal/appointments` package
- Hospital onboarding wizard UI components
- Clinical records API (vitals, complaints, diagnosis, prescription)
- OpenAPI type generation script