# @haspataal/patients

Patient-centric domain package for the Haspataal platform.

## Purpose

Owns patient profile, demographics, identifiers, guardians, relationships, and contact points. This is the canonical source of truth for patient identity after `@haspataal/identity` resolves aliases.

## Public API

| Export | Type | Description |
|--------|------|-------------|
| `PatientProfileService` | class | Manages patient demographics, contact points, and profile data |
| `PatientIdentifierService` | class | Manages patient identifiers (ABHA, UHID, national IDs) |
| `PatientGuardianService` | class | Manages guardian/emergency contact relationships |
| `PatientProfile` | type | Patient profile DTO |
| `PatientIdentifier` | type | Patient identifier DTO |
| `PatientGuardian` | type | Guardian/emergency contact DTO |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@haspataal/identity` | Canonical patient ID resolution, alias management |
| `@haspataal/db` | Prisma client access |
| `@haspataal/types` | Shared TypeScript types |

## What Must Remain Internal

- Prisma repository implementations
- Identity resolution callbacks
- Profile validation rules

## Design Notes

`packages/patients` is a **new strategic package** introduced during the Phase 2 package extraction initiative.

It depends on `@haspataal/identity` because:
1. Patient IDs may be aliases that need resolution
2. Identity events (merge, alias creation) affect patient profiles
3. Authentication contexts resolve to canonical patient IDs via identity

Future packages (`appointments`, `alerts`, `pharmacy`, `laboratory`, `referral`) should depend on `@haspataal/patients` for patient-related data rather than accessing Prisma models directly.

## Migration Notes

This package is currently a **skeleton** with placeholder APIs. The actual implementation will be extracted from:
- `apps/patient-portal/lib/repositories/PrismaPatientRepository.ts`
- `packages/db/prisma/schema.prisma` (Patient model)

No backward compatibility stubs are needed since this is a new package.
