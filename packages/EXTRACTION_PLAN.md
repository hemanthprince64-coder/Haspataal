# Package Extraction Plan

## Overview

This document tracks the incremental extraction of domain packages from `packages/core` into standalone, independently maintainable packages.

## Guiding Principles

1. **Extract first, preserve compatibility**: Move files, create stubs, keep old imports working
2. **One domain per package**: Each package owns exactly one business capability
3. **Barrel exports only**: `index.ts` is the public API surface
4. **No circular dependencies**: Follow the dependency matrix in `DEPENDENCY_RULES.md`
5. **Test at every step**: Run full test suite after each extraction

## Completed Extractions

| Package | Source | Date | Status |
|---------|--------|------|--------|
| `@haspataal/alerts` | `core/domain/alerts/` | 2026-07-29 | ✅ Complete |
| `@haspataal/scheduling` | `core/domain/use-cases/`, `entities/`, `repositories/`, `infrastructure/prisma/` | 2026-07-29 | ✅ Complete |
| `@haspataal/referral` | `core/domain/referral/` | 2026-07-29 | ✅ Complete |
| `@haspataal/pharmacy` | `core/domain/pharmacy/` | 2026-07-29 | ✅ Complete |
| `@haspataal/laboratory` | `core/domain/laboratory/` | 2026-07-29 | ✅ Complete |
| `@haspataal/identity` | `core/domain/identity/` | 2026-07-29 | ✅ Complete |
| `@haspataal/authorization` | `core/domain/authorization/` | 2026-07-29 | ✅ Complete |
| `@haspataal/procedure` | `core/domain/procedure/` | 2026-07-29 | ✅ Complete |
| `@haspataal/radiology` | `core/domain/radiology/` | 2026-07-29 | ✅ Complete |
| `@haspataal/bloodbank` | `core/domain/bloodbank/` | 2026-07-29 | ✅ Complete |
| `@haspataal/patients` | NEW — strategic package | 2026-07-29 | ✅ Scaffolded |

## Package Inventory (Post-Extraction)

```
packages/
├── alerts/          # Clinical alert service
├── auth/            # Authentication library
├── authorization/   # RBAC, doctor-patient relationships, care responsibility
├── bloodbank/       # Blood bank domain
├── core/            # Compatibility facade (re-exports from sub-packages)
├── db/              # Prisma database layer
├── identity/        # Patient identity, aliases, normalization
├── laboratory/      # Lab orders, specimens, results, analyzer
├── notify/          # Notification engine
├── patients/        # Patient profile, demographics, identifiers (new)
├── pharmacy/        # Medication dispensing, MAR, verification
├── procedure/       # Clinical procedures, checklists, anesthesia
├── radiology/       # Imaging workflow, scheduling, reports
├── referral/        # Referral execution, consultation, care transfer
├── scheduling/      # Appointment booking domain
├── timeline/        # Event timeline
├── ui/              # Component library
├── types/           # Shared types
└── ...              # Other existing packages
```

## Dependency Rules

See `packages/DEPENDENCY_RULES.md` for the canonical dependency matrix.

## Post-MVP Cleanup

After MVP stabilization:

1. Remove backward-compatibility stubs from `packages/core/domain/*`
2. Update all consumer imports from `@haspataal/core` to direct package imports
3. Reduce `packages/core/index.ts` to a minimal facade or remove
4. Enforce dependency rules via CI/linting
5. Implement `packages/patients` with actual repository logic
