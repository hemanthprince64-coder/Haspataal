# Haspataal Dependency Graph & Rules

This document defines the strict dependency hierarchy across the Turborepo monorepo. **Cyclic dependencies and upstream imports are strictly forbidden.** This hierarchy is enforced by CI.

## 1. Architectural Layers

The repository is structured in a strict top-down hierarchy:

1. **Apps** (`apps/*`, `services/*`)
   - E.g., `patient-portal`, `hospital-hms`, `haspataal-admin`, `api-gateway`
   - *Allowed to import from:* Application Packages, Domain Packages, Shared Packages, Types/DB.
2. **Application Packages** (`packages/admin-core`, `packages/workflows`, `packages/orchestration`)
   - Higher-level modules that compose multiple domain packages to fulfill application-specific flows.
   - *Allowed to import from:* Domain Packages, Shared Packages, Types/DB.
   - *Forbidden:* Cannot import from Apps.
3. **Domain Packages** (`packages/encounter`, `packages/laboratory`, `packages/radiology`, `packages/auth`)
   - Core clinical and business domains (Clean Architecture).
   - *Allowed to import from:* Shared Packages, Types/DB, and laterally from other Domain Packages ONLY via strict interfaces/events (no deep imports).
   - *Forbidden:* Cannot import from Application Packages or Apps.
4. **Shared Packages** (`packages/logger`, `packages/ui`, `packages/config`, `packages/events`)
   - Platform-wide utilities and shared configurations.
   - *Allowed to import from:* Types/DB.
   - *Forbidden:* Cannot import from Domain Packages, Application Packages, or Apps.
5. **Types/DB** (`packages/types`, `packages/db`, `packages/platform-contracts`)
   - Foundational schemas, database singletons, and primitive types.
   - *Allowed to import from:* Nothing (leaf nodes).
   - *Forbidden:* Cannot import from any other layer in the monorepo.

## 2. Strict Rules & Ownership

### Rule 1: No Upstream Imports
A package at a lower layer (e.g., Domain) can never import a package at a higher layer (e.g., Apps).

### Rule 2: No Circular Dependencies
Package A cannot depend on Package B if Package B depends on Package A. This applies to lateral domain-to-domain communication. If two domains need to communicate bidirectionally, they must use **Events** (`packages/events`).

### Rule 3: No Deep Imports (Public API Only)
Packages must only import from the root barrel file of another package.
- ✅ `import { RadiologyOrder } from '@haspataal/radiology'`
- ❌ `import { RadiologyOrder } from '@haspataal/radiology/src/entities/RadiologyOrder'`

### Rule 4: Ownership
- **Clinical Domains (Orders, Encounter, Lab, Radiology, etc.):** Owned by the core backend team.
- **Platform & Infrastructure (DB, Events, Auth, Gateway):** Owned by the platform team.
- **Apps:** Owned by respective frontend/product teams.

## 3. Enforcement
These rules are enforced during the CI pipeline via:
1. `madge` / `dependency-cruiser` cycle detection checks.
2. ESLint `import/no-extraneous-dependencies` and boundary enforcement.
