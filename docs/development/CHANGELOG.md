Version: 2.0
Owner: Haspataal Engineering
Last Updated: 2026-08-04

# Changelog & Completed Work

- **2026-08-04**: Fixed Next.js soft navigation bug by changing `next/link` paths in `PortalCard` to absolute URLs to enforce cross-domain navigation.
- **2026-08-04**: Bypassed PostHog initialization on local environments without tokens. Suppressed browser extension hydration warnings on `RootLayout`.
- **2026-08-04**: Increased `turbo` concurrency to `20` in `package.json` to prevent process limitation errors when booting the monorepo.
- **2026-08-04**: Migrated legacy Catch-All routes via `next.config.mjs` and removed non-patient logic from `patient-portal` middleware.
- **2026-07-29**: Completed Pharmacy Implementation (`PharmacyStateMachine` and Use Cases).
- **2026-07-29**: Reorganized root repository documentation into `/docs` and archived legacy open-specs.
- **2026-07-25**: Established 9-step production deployment runbook.
