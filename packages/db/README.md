# @haspataal/db

## Purpose
The Data Access Layer. Provides the Prisma client singleton, schema definitions, and RLS transaction wrappers.

## Public API
- `prisma`: The initialized `PrismaClient` singleton.
- `withTenant`: Wrapper to execute a transaction scoped to a specific `hospital_id`.

## Dependencies
- `@prisma/client`

## Prohibited Dependencies
- `@haspataal/core`
- `next`, `react`

## Key Use Cases
- Generating the DB types and handling migrations.
- Instantiating the Prisma Client exactly once to avoid connection exhaustion in Next.js HMR.

## Tests
- Integration tests using `Testcontainers`.
