# STABLE_CLAIM_SECRET Rotation Risk & Strategy

## Current Design & Invariant
In Haspataal Phase 1, authentication mobile uniqueness is enforced by the database via `@@unique([type, claimKey])` on the `AuthMethod` table. The `claimKey` is a deterministic HMAC of the mobile number generated using `STABLE_CLAIM_SECRET`.

The current invariant is that the `claimKey` remains stable across rotations and provides a consistent constraint against multiple accounts claiming the same mobile.
The stable claim secret must not be rotated in place during ordinary lookup/encryption key rotation. Emergency rotation requires a controlled dual-key or identity-reservation migration that preserves authentication uniqueness throughout the transition.

## Exposure Risk & Emergency Rotation Trigger
If the `STABLE_CLAIM_SECRET` is exposed, it constitutes a security risk. This exposure acts as the trigger for an emergency rotation.

## Migration Requirement
An emergency rotation requires migrating all existing claims. Since the uniqueness constraint is global, a simple in-place secret swap would break all existing `claimKey` records. A controlled dual-key or identity-reservation migration is required to safely transition all existing claims to the new secret while maintaining uniqueness.

## Prohibition
There is a strict prohibition on deleting the old key before all claims are safely migrated. The old secret must be retained to verify and migrate existing claims until the transition is 100% complete.
