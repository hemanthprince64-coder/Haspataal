## Why

The current architecture incorrectly combines patient identity, mobile number, password, login account, and authentication. `Patient.phone @unique` anchors identity, and a Patient cannot be created without login credentials. This creates a split-brain identity system across three stores (packages/db Prisma, HMS duplicate Prisma, Supabase) and prevents critical flows like Guest/Emergency registration, family members as independent patients, or updating a mobile number without changing the Patient ID. We need a single lifelong canonical Patient ID independent of login methods.

## What Changes

- **Separate Patient from Account**: Make `phone` and `password` optional on the `Patient` model.
- **New Account & Auth Models**: Introduce `UserAccount`, `AuthMethod`, and `PatientContactPoint` (or similar) to handle login and contact distinct from clinical identity.
- **Mobile Normalization & Encryption**: Add normalized, deterministic lookup hashes and authenticated encryption for mobile storage.
- **Identity Alias & Merge Request**: Introduce `PatientAlias` to resolve old/duplicate IDs to a single canonical ID without breaking history, and `IdentityMergeRequest` for governed duplicate-resolution.
- **Transitional Compatibility**: Create a canonical identity lookup service, and adapters for existing direct `Patient.phone` lookups and `session.user.id` assumptions.
- **Idempotent Backfill**: Migrate existing valid patients to the new `UserAccount`/`AuthMethod` structure safely without disrupting legacy fields.
- **Non-Goals**: No Guest emergency UI, no caregiver-as-contact workflow, no Family Network, no family OTP, no Aadhaar/ABHA integration, no automatic duplicate merge, no production merges, no deletion of duplicate HMS Prisma or Supabase patient tables yet. No changes to Discharge, Referral, Timeline visibility, or Patient/Admin Portal UIs.

## Capabilities

### New Capabilities
- `patient-identity-separation`: Separation of clinical Patient identity from UserAccount and authentication methods.
- `mobile-normalization-auth`: Cryptographic lookup hash and encryption for mobile numbers.
- `identity-alias-merge`: PatientAlias resolution and IdentityMergeRequest workflow foundation.

### Modified Capabilities
- `patient-auth-otp`: Moving OTP and verified authentication state out of Patient into AuthMethod.
- `session-identity`: Transitioning session `user.id` resolution to map through UserAccount to canonical Patient ID.

## Impact

- **packages/db**: Prisma schema expanded with new models; existing `Patient` fields made optional.
- **Identity Services**: New canonical lookup paths, alias resolution logic, and mobile normalization/encryption utilities.
- **Legacy Auth**: Transitional compatibility layer required for `session.user.id === Patient.id` and direct `Patient.phone` queries.
- **Outbox**: Minimal identity events (e.g., `PATIENT_ACCOUNT_LINKED`, `IDENTITY_MERGE_REQUESTED`) published via the Phase 0A/0B Outbox.
