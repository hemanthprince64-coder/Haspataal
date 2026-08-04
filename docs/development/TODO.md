Version: 2.0
Owner: Haspataal Engineering
Last Updated: 2026-08-04

# Pending Tasks (TODO)

- **Phase 11:** Notifications Engine overhaul (WhatsApp templates, 10pm-8am curfew enforcement).
- **Phase 12:** Analytics & Business Intelligence (Materialized views).
- **Phase 13:** Production Hardening.
- **Phase 14:** E2E Validation.

## Tech Debt
- Remove `ignoreBuildErrors` and `ignoreDuringBuilds` in `next.config.mjs` incrementally as `any` types are removed.
- Refactor all legacy `withAuth` API routes in `patient-portal` to use standard App Router session helpers.
