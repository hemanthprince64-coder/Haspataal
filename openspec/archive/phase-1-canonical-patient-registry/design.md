## Context

The current `Patient` model in `packages/db` requires a unique `phone` and `password`. This creates a coupling where a clinical patient identity cannot exist without login credentials, forcing emergency and child registrations to fabricate data or fail. The existence of three separate patient tables across Prisma and Supabase worsens this problem. Phase 1 corrects the underlying identity model to decouple clinical identity from authentication logic. We must modify Prisma schemas additively to maintain backward compatibility for existing code.

## Goals / Non-Goals

**Goals:**
- Additive schema modifications to introduce `UserAccount`, `AuthMethod`, `PatientAlias`, and `IdentityMergeRequest`.
- Cryptographic lookup hash and encrypted storage for mobile numbers.
- Ensure the `Patient` model can be created without a `phone` or `password`.
- Idempotent backfill script to convert existing `Patient` rows into `UserAccount`/`AuthMethod` relationships.
- Transitional compatibility layers for legacy direct phone queries and JWT `session.user.id` mapping.

**Non-Goals:**
- No automated deduplication or merging based on matching phones.
- Do not rewrite historical hospital clinical records during merges.
- Do not immediately delete Supabase patient tables or duplicate Prisma patient models.
- No new UI/UX for Guest emergency or full Identity Authority approval workflows yet (API foundation only).
- Do not implement Aadhaar, ABHA, or unsupported authentication mechanisms.

## Decisions

- **Identity Separation Boundary**: `UserAccount` sits in a `0..1` relationship with `Patient`. `AuthMethod` relates `1..*` to `UserAccount`. `phone` and `password` on `Patient` become optional (`String?`).
- **Mobile Encryption & Lookup**: We will use a keyed cryptographic hash (e.g., HMAC-SHA256 with a server secret) for `identifierLookupHash` to enable fast, exact matches for duplication checks without compromising privacy. Storage of the raw mobile number will be removed in favor of `identifierEncrypted` using authenticated encryption (AES-256-GCM).
- **PatientAlias Model**: To merge identities safely without destroying referential integrity in legacy records, `PatientAlias` will resolve deprecated `aliasPatientId` to the surviving `canonicalPatientId`. The resolver service will block self-alias and cyclic alias chains.
- **IdentityMergeRequest**: A governed state machine (`REQUESTED` → `UNDER_REVIEW` → `APPROVED` → `EXECUTED` / `REJECTED`) tracks duplicate resolution. Phase 1 implements the schema and service layer but delegates `EXECUTED` triggering to a future authorization phase.

## Risks / Trade-offs

- [Risk] Legacy applications expect `session.user.id` to map directly to a `Patient`. → We will implement a temporary session adapter that intercepts authentication and injects the `canonicalPatientId` for backward compatibility.
- [Risk] Direct `Patient.findUnique({ phone })` calls will break when `phone` becomes optional. → A canonical identity lookup service `findPatientByVerifiedMobile` will serve as the transition path. An inventory of all remaining lookups will be produced.
- [Risk] Missing encryption secrets in production could block login. → Start-up checks will validate secret availability before allowing the auth service to boot.
