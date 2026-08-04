Version: 2.0
Owner: Haspataal Engineering
Last Updated: 2026-08-04

# Project State

This document reflects the operational status of the project. **Read this at the start of every session.**

- **Current Branch:** `fix/harden-stability`
- **Current Sprint:** Phase 10 (Billing Engine)
- **Latest Commit:** `docs: add debugging lesson for stale Next.js dev server zombie ports on windows`
- **Build Status:** Passing
- **Typecheck:** Passing
- **Tests:** Integration and E2E passing (Pharmacy, Encounter rules updated)
- **Lint:** Passing (with temporary baseline overrides in `.eslintrc`)
- **Prisma Migration:** Applied up to `Encounter`, `ClinicalOrder` changes.
- **Known Blockers:** None. Stale port zombie processes (3000/3001) were remediated.
