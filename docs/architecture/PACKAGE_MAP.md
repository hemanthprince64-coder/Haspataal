---\nversion: 2.0\nowner: Haspataal Engineering\nlast_updated: 2026-08-04\nstatus: Active\n---\n
# Package Map & Responsibilities

Haspataal is a Turborepo monorepo. Shared logic resides in `packages/` and is consumed by `apps/`.

## Shared Packages

### `@haspataal/core`
**Responsibility:** Clean Architecture Domain Layer.
- **Rules:** No database queries (Prisma) or HTTP frameworks (Next.js/Express) allowed.
- **Contains:** Entities, Repository Interfaces, Use-Cases, Domain Events.

### `@haspataal/db`
**Responsibility:** Data Access Layer.
- **Rules:** Must export Prisma client as a global singleton for Next.js hot-reload compatibility.
- **Contains:** `schema.prisma`, `PrismaClient` initialization, Prisma specific extensions (RLS scoping).

### `@haspataal/auth`
**Responsibility:** Identity & Session Management.
- **Rules:** Shared between Next.js and API Gateway. Must use `jose` for Edge compatibility.
- **Contains:** JWT Minting, UnifiedOtpService, RBAC schemas (`ROLES`).

### `@haspataal/types`
**Responsibility:** Contracts and Validation.
- **Rules:** Must not import `@haspataal/db`.
- **Contains:** Shared TypeScript interfaces, Zod Validation Schemas (e.g., `MobileSchema`, `HospitalOnboardingSchema`).

### `@haspataal/config`
**Responsibility:** Tooling Configuration.
- **Contains:** Shared Prettier, ESLint, TypeScript, and Tailwind configs.

### `@haspataal/ui`
**Responsibility:** Component Library.
- **Rules:** Framework-agnostic React components styled with Tailwind CSS (Shadcn UI).
- **Contains:** Buttons, Inputs, Dialogs, Cards.

## Key Applications

- `patient-portal`: Port 3000. Patient-facing search, booking, and records.
- `hospital-hms`: Port 3001. Hospital admin and clinical operations dashboard.
- `admin-panel`: Port 3002. Platform-level superset admin tools.
- `api-gateway`: Port 4000. Express server for external mobile/partner access.
