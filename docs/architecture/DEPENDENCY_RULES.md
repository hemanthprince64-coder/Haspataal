Version: 2.0
Owner: Haspataal Engineering
Last Updated: 2026-08-04

# Dependency Rules & Boundaries

To prevent spaghetti architecture and circular dependencies in the Turborepo monorepo, strict rules apply to package imports.

## Prohibited Cross-Module Imports

- `packages/radiology` MUST NOT import from `packages/laboratory` (and vice-versa).
- `packages/orders` MUST NOT import `packages/billing` directly (Emit a `BILLABLE_EVENT` instead).
- `packages/auth` MUST NOT depend on Next.js or React. It must remain pure Node/Edge compatible.

## Allowed Dependency Flow

Higher-level orchestrators depend on lower-level primitives.

```
apps/patient-portal, apps/hospital-hms
  ↓ depends on
packages/core (Clean Architecture Use-Cases)
  ↓ depends on
packages/db (Prisma Client), packages/types (Zod Schemas)
```

## Enforcing Boundaries
Violations will cause Turborepo build cycles or ESLint boundary rule failures. Always verify `turbo graph` when extracting new modules.
