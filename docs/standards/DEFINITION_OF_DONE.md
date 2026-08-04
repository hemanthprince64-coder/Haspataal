---
version: 2.0
owner: Haspataal Engineering
last_updated: 2026-08-04
status: Active
---

# Definition of Done

Every task and feature must pass this checklist before being considered complete.

- `[ ]` **Build passes** (`npm run build:all`).
- `[ ]` **Typecheck passes** (`tsc --noEmit`).
- `[ ]` **Lint passes** for modified files (`npm run lint:all`).
- `[ ]` **Unit/integration tests** added or updated where applicable.
- `[ ]` **Documentation** (`docs/`) updated to reflect architectural or API changes.
- `[ ]` **Changelog** updated.
- `[ ]` **RBAC reviewed** (Unauthorized users are blocked; roles verified).
- `[ ]` **Multi-tenant isolation verified** (`SET LOCAL app.hospital_id` works; no cross-tenant leaks).
- `[ ]` **Timeline events verified** (Emitted correctly to PostgreSQL EventLog and Redis Streams).
- `[ ]` **Audit logging verified** (Sensitive actions logged appropriately).
- `[ ]` **API contracts updated** (If altering Zod schemas or endpoints).
