# IDENTITY SOURCE-OF-TRUTH AUDIT

Scope: Invariants A (Patient Identity), B (Guest/Emergency), C (Family/Guardian), D (Child/Dependent).
No code modified.

## 1. What Already Exists
- `Patient` model `packages/db/prisma/schema.prisma:434` with `phone String @unique`, `password String` (non-optional), `role Role @default(PATIENT)`, `abhaAddress? @unique`, `familyMembers`, `newbornRecord`, `vaccinationRecords`, `internalReferrals`.
- `OtpCode` `schema.prisma:1363` (`phone @unique`, `code` plaintext).
- `FamilyMember` `schema.prisma:1081` (flat: name/relation/dob/gender/bloodGroup + `patientId`).
- `NewbornRecord.babyPatientId @unique → Patient` `schema.prisma:1298,1304`.
- `VaccinationRecord.patientId` `schema.prisma:1147`.
- OTP send/verify in `apps/hospital-hms/app/api/auth/otp.ts` and `apps/patient-portal/lib/services/otp.ts`.
- `TimelineSnapshot` model exists `schema.prisma:3556` but is **never written**.

## 2. What Partially Exists
- A.10 (no auto-merge) — true only because merge code doesn't exist; duplicates hard-fail on `@unique`.
- C.2 (family graph) — flat `FamilyMember` rows, not a relationship graph.
- C.10 / D-level audit — generic `AuditLog` `schema.prisma:1009`, `OverrideLog` 1496 exist.
- D.1/D.2/D.5/D.6/D.8/D.10 — structurally satisfied by FK design.

## 3. What Contradicts the Approved Architecture (P0)
- **A.1 / A.4 / A.6 / A.8 — Identity anchored on `phone @unique`.** Mobile is the de-facto primary key and lookup key (`patients/route.ts:33-46`). One human is NOT represented by a stable canonical ID independent of contact method.
- **A.2 / A.3 — `UserAccount` does not exist.** `Patient` holds `password` (non-optional `schema.prisma:439`); JWT `user.id` IS `Patient.id` (`packages/auth/session.ts:43-58`, `auth.ts:5-14`). A Patient literally cannot be created without a password at DB level (registration `patients/route.ts:38-46` omits it and would fail).
- **A.8 — THREE identity stores (SPLIT-BRAIN):**
  1. `packages/db/prisma/schema.prisma:434` `patients`
  2. `apps/hospital-hms/prisma/schema.prisma:464` `patients` (second prisma client)
  3. `apps/hospital-hms/supabase/schema.sql:24-38` `global_patients(mobile unique not null)` + `hospital_patients`
  - Runtime crosses stores: registration writes Prisma `patients` (`patients/route.ts:38`); profile read uses Supabase `global_patients` (`app/api/patient/route.ts:23-33` `decrypt(mobile)`), with mapping flagged unresolved (`patient/route.ts:39-51`).
- **A.9 — OTP/plaintext + no lookup hash.** `OtpCode` stores `phone` plaintext; no encrypted normalized mobile, no deterministic keyed lookup hash, no separate OTP-verification state (`otp.ts:16-20`). No hash-based duplicate detection anywhere.
- **C.1 — `FamilyMember` has no independent Patient ID/timeline.** It is a dependent row, not a relationship-graph node.
- **D.3 — `Patient.phone @unique` required ⇒ newborn Patient requires mobile** (contradicts "no mobile required").

## 4. What Is Missing (MVP-critical)
- A.5, A.11–A.14; all B.1–B.6; C.3–C.9, C.11; D.4, D.7, D.9, D.11.
- Models: `UserAccount`, `PatientAlias`, `IdentityMergeRequest`, `MergeAuthority` role, `Caregiver`/`Guardian` (distinct from `FamilyMember`), `AuthMethod`, `PatientRegistry`.

## 5. What Must Be Reused
- `packages/db` Prisma `Patient` row `id` (uuid) — keep as the canonical key; do NOT mint a second ID.
- `abhaAddress` column — extend into verified auth-method verification, do not rebuild Aadhaar flow.
- `NewbornRecord` / `VaccinationRecord` FK design — already correct.

## 6. What Must Be Refactored (do NOT duplicate)
- `Patient` model: make `phone`/`password` optional; add `mobileEncrypted`, `mobileLookupHash`, `canonicalPatientId?`, `identityStatus` (VERIFIED/GUEST/ALIAS). Add `UserAccount` (1:1..0 with Patient) + `AuthMethod` (many per account). Add `PatientAlias` (old→surviving) + `IdentityMergeRequest` (raised by hospital/staff, executed only by Identity Authority).
- OTP flows: encrypt normalized mobile; add keyed lookup hash for duplicate detection; separate OTP-verification state; wire `rate-limit.ts` `otpRateLimiter` (currently unused; `getKey` is IP-based not phone-based — `rate-limit.ts:63-65`).

## 7. What Must Be Migrated
- Converge ALL patient reads/writes onto the single `packages/db` registry. Hospital records reference `canonicalPatientId`.
- Retire `apps/hospital-hms/supabase/schema.sql` patient tables to read-only lookup post-migration.

## 8. What Must Be Deleted Only After Safe Replacement
- `apps/hospital-hms/prisma/schema.prisma:464` duplicate `Patient` + its standalone prisma client — delete after `packages/db` is the single source.
- `apps/hospital-hms/supabase/schema.sql` `global_patients`/`hospital_patients` — delete after migration + reconciliation verification.

## 9. Remediation Order
1. Outbox contract (prereq for merge audit trail events).
2. Canonical Patient Registry (`UserAccount` + alias + merge + lookup hash).
3. De-duplicate identity stores (migrate HMS Supabase/Prisma onto registry).
4. Guest registration + caregiver-as-contact (B).
5. Family/guardian graph + OTP invite (C).
6. Child identity completion (D.4/D.7/D.9/D.11).

## 10. Files Needing Change
- `packages/db/prisma/schema.prisma` (Patient 434, OtpCode 1363, FamilyMember 1081, NewbornRecord 1295; add UserAccount/PatientAlias/IdentityMergeRequest/AuthMethod/Caregiver)
- `apps/hospital-hms/prisma/schema.prisma` (Patient 464 — delete/migrate)
- `apps/hospital-hms/supabase/schema.sql` (24-38 — delete post-migration)
- `apps/hospital-hms/app/api/auth/otp.ts`, `apps/patient-portal/lib/services/otp.ts`
- `apps/hospital-hms/app/api/patients/route.ts`, `app/api/patient/route.ts`
- `apps/patient-portal/lib/services.ts` (addFamilyMember 842; abdm-mock caregiver 63)
- `packages/auth/session.ts`, `auth.ts`, `rate-limit.ts`
