Version: 2.0
Owner: Haspataal Engineering
Last Updated: 2026-08-04

# Definition of Done

Every task and feature must pass this checklist before being considered complete.

- `[ ]` Builds successfully without errors (`npm run build:all`).
- `[ ]` Typecheck passes (`tsc --noEmit`).
- `[ ]` Lint passes for touched files (`npm run lint:all`).
- `[ ]` Unit/Integration tests added or updated.
- `[ ]` Documentation (`docs/`) updated to reflect architectural or API changes.
- `[ ]` `CHANGELOG.md` updated.
- `[ ]` `KNOWN_ISSUES.md` updated (if bugs were discovered).
- `[ ]` RBAC verified (Unauthorized users are blocked).
- `[ ]` Timeline events verified (Emitted correctly to PostgreSQL and Redis).
- `[ ]` Multi-tenant behavior verified (`SET LOCAL app.hospital_id` works).
- `[ ]` Security review completed (No PHI logged, tokens secured).
- `[ ]` Error states handled (Loading/Empty/Error UI).
