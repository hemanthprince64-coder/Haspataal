- [x] 1.1 Expand `Patient` model in `packages/db/prisma/schema.prisma` (make `phone`, `password`, `abhaAddress` optional, add relation arrays).
- [x] 1.2 Add `UserAccount`, `AuthMethod`, and `PatientContactPoint` models. Add Enums including `ContactRelationshipType`.
- [x] 1.3 Add `PatientAlias` and `IdentityMergeRequest` models. Add `MobileVerificationChallenge` model.
- [x] 1.4 Validate Prisma schema and generate client.

## 2. PostgreSQL Partial Unique Index
- [x] 2.1 Create custom migration for `patient_contact_points_primary_idx`.

## 3. Cryptographic Utilities & Lookups
- [x] 3.1 Implement deterministic keyed HMAC lookup hash utility for mobile numbers (`HMAC-SHA256`).
- [x] 3.2 Implement authenticated encryption (`AES-256-GCM`) utility for raw mobile storage.
- [x] 3.3 Create `packages/core/identity/normalization.ts` for canonical mobile normalization (`libphonenumber-js`).

## 4. Backfill & Migration
- [x] 4.1 Write idempotent database backfill script (`scripts/migrations/phase1_identity_backfill.ts`).
- [x] 4.2 Ensure script properly assigns `UNVERIFIED` state to legacy phones and only creates `PatientContactPoint` for them (no `UserAccount` yet).

## 5. Identity Service Layer
- [x] 5.1 Implement canonical lookup: `findPatientByVerifiedMobile(rawMobile)`.
- [x] 5.2 Implement alias resolver: `resolvePatientId(inputPatientId)`.
- [x] 5.3 Implement pre-account mobile verification logic (OTP -> `MobileVerificationChallenge`).

## 6. Transitional Compatibility
- [x] 6.1 Implement restricted legacy `Patient.phone` dual-write for `SELF + MOBILE + VERIFIED + ACTIVE + PRIMARY`.
- [x] 6.2 Implement a legacy adapter for `Patient.findUnique({ phone })`.
- [x] 6.3 Implement a session adapter mapping JWT `session.user.id`.

## 7. Events & Verification
- [x] 7.1 Implement Outbox emission for `PATIENT_ACCOUNT_LINKED`, `AUTH_METHOD_VERIFIED`, `IDENTITY_MERGE_REQUESTED`, `IDENTITY_MERGE_APPROVED`, `PATIENT_ALIAS_CREATED`.
- [x] 7.2 Run exact testing plan: `npx vitest run --grep "Identity"` covering Dual-Write, Alias resolution, etc.
