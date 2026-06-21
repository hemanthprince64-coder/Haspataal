# Dependency Graph

This document highlights critical files, cross-project dependencies, and import paths in the Haspataal monorepo.

## Monorepo Workspaces

The workspaces configured in `package.json` are:
- `apps/*`
  - `patient-portal`
  - `hospital-hms`
  - `marketing`
  - `admin-panel`
  - `mobile` (React Native)
- `packages/*`
  - `db` (Prisma ORM database client & schema)
  - `auth` (Jose session encrypt/decrypt/verify helpers)
  - `queue` (BullMQ, in-process, and pg-boss queue adapters)
  - `logger` (Pino logger)
  - `types` (Shared type definitions)
  - `ui` (Shared Tailwind UI components)

## Critical Files

- `packages/db/prisma/schema.prisma`: Database schema definition. Any modification here triggers database migration.
- `packages/db/index.ts`: Contains global Prisma Client initialization, including database RLS session helper and soft-delete middleware.
- `packages/auth/session.ts`: Core JWT sign/verify session cookie logic used by all web gateways.
- `apps/patient-portal/app/actions.ts`: Server-side actions managing forms, logins, and API mappings for the patient portal.
- `apps/hospital-hms/middleware.ts`: Checks session tokens and restricts access to hospital dashboard paths.
