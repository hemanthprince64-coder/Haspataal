# Haspataal Monorepo Dependency Rules

## Purpose

This document defines the canonical dependency relationships between Haspataal packages. All package authors and contributors must follow these rules to prevent circular dependencies and maintain clean architectural boundaries.

## Layer Definitions

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation                          │
│  apps/patient-portal, apps/hospital-hms, apps/admin-panel  │
├─────────────────────────────────────────────────────────────┤
│                       Application                            │
│  services/gateway, services/auth-service                   │
├─────────────────────────────────────────────────────────────┤
│                        Domain                                │
│  packages/core, packages/alerts, packages/scheduling, ...  │
├─────────────────────────────────────────────────────────────┤
│                     Infrastructure                           │
│  packages/db, packages/logger, packages/queue, packages/notify │
├─────────────────────────────────────────────────────────────┤
│                        Shared                                │
│  packages/types, packages/ui, packages/config               │
└─────────────────────────────────────────────────────────────┘
```

## Allowed Dependency Matrix

| Source ↓ / Target → | types | ui | db | logger | notify | queue | events | auth | timeline | alerts | scheduling | referral | core | procedure | radiology | bloodbank | identity |
|---------------------|-------|----|----|--------|--------|-------|--------|------|----------|--------|------------|----------|------|-----------|----------|-----------|----------|
| **types** | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **ui** | ✅ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **config** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **db** | ✅ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **logger** | ✅ | ❌ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **queue** | ✅ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **events** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **auth** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **timeline** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **notify** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **patients** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **alerts** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **scheduling** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **referral** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **pharmacy** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **laboratory** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **core** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| **identity** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — |
| **procedure** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | — | ❌ | ❌ | ❌ | ❌ |
| **radiology** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | — | ❌ | ❌ | ❌ |
| **bloodbank** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | — | ❌ | ❌ |

## Rules

1. **Upward-only dependencies**: Lower layers may not depend on higher layers.
2. **No circular dependencies**: If A depends on B, B must not depend on A.
3. **Core is a facade only**: `@haspataal/core` re-exports from other packages. It must not contain new business logic.
4. **Shared layer is dependency-free**: `packages/types`, `packages/ui`, `packages/config` must not depend on any other haspataal package.
5. **Infrastructure depends on Shared only**: `packages/db`, `packages/logger`, etc. may only depend on `types` and external libraries.
6. **Domain may depend on Infrastructure**: Domain packages may use infrastructure adapters.
7. **Application depends on Domain + Infrastructure**: Service packages orchestrate domain logic.
8. **Presentation depends on anything**: App layers may import from any package below.

## Enforcement

```bash
# Check for circular dependencies
pnpm nx dep-graph

# Lint for boundary violations
pnpm nx lint --affected

# Manual audit
pnpm madge --circular packages/
```

## Adding New Packages

When creating a new package:

1. Identify which layer it belongs to
2. Define allowed dependencies from this matrix
3. Add the package to the matrix
4. Create a README documenting purpose and API
5. Add barrel exports in `index.ts`
6. Backward-compatibly re-export from `@haspataal/core` during transition

## Post-MVP Cleanup

After MVP stabilization:

1. Remove backward-compatibility stubs from `packages/core/`
2. Update all consumers to import from target packages directly
3. Reduce `packages/core/` to a minimal facade or remove entirely
4. Enforce dependency rules via CI
