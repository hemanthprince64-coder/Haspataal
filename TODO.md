# Technical Debt & TODOs

## P1 (Security & Correctness)
- (None currently)

## P2 (TypeScript Improvements)
- `apps/patient-portal`: Fix `@typescript-eslint/no-explicit-any` usages (e.g. `lib/fetcher.ts`, `lib/hospital-actions.ts`, `lib/infrastructure/fhir-converter.ts`, `lib/infrastructure/queues.ts`, `lib/infrastructure/slot-engine.ts`, `lib/infrastructure/waitlist-service.ts`, `lib/offline/sync-queue.ts`).
- `apps/patient-portal`: Add explicit return types `@typescript-eslint/explicit-function-return-type` to functions in `lib/auth/patient-access.ts`, `lib/auth/requireRole.ts`, `lib/branch.ts`, `lib/hospital-actions.ts`, `lib/offline/sync-queue.ts`, etc.

## P3 (Formatting)
- Fix legacy unused ESLint directives (e.g. `no-direct-prisma-in-pages`).

## P4 (Style)
- Remove unexpected `console` statements in `apps/patient-portal/lib/services.ts` (or convert them to proper logger calls).
- Remove unused variables (e.g. `'e' is defined but never used` in `lib/auth/patient-access.ts`).
