---\nversion: 2.0\nowner: Haspataal Engineering\nlast_updated: 2026-08-04\nstatus: Active\n---\n
# Pre-Deployment Release Checklist

Before every deployment to production, the following Runbook must be executed:

- `[ ]` **Build:** `npm run build:all` completes without errors.
- `[ ]` **Typecheck:** `tsc --noEmit` completes without errors.
- `[ ]` **Lint:** `npm run lint:all` completes without errors (respecting current baseline).
- `[ ]` **Tests:** Unit, Integration, and E2E pass (`npm run test:all`).
- `[ ]` **Database Backups:** Explicit DB snapshot taken before applying migrations.
- `[ ]` **Migration:** `npx prisma migrate deploy` executed against staging, then production.
- `[ ]` **Rollback Plan:** Verified immutable git tags exist for the previous healthy release.
- `[ ]` **Environment Variables:** Verified production secrets in Vault/Vercel (e.g., `ENCRYPTION_KEY` is 32-chars).
- `[ ]` **Health Checks:** `/api/health` returns HTTP 200.
- `[ ]` **Smoke Tests:** End-to-end patient booking flow and hospital login flow tested.
