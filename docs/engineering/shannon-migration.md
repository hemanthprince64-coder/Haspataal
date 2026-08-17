# Shannon Sub-Monorepo Migration

The `shannon/` directory was originally a nested sub-monorepo containing independent code for the Shannon sub-project (weighing around 700MB with its own `.turbo` cache and `node_modules`).

As part of the Haspataal MVP cleanup (Phase 3 Deferrals), this directory was extracted and moved out of the main repository to reduce clone size, avoid duplicate tooling issues, and clarify repository ownership.

**Migration Details:**
- Date: July 2026
- Previous Location: `/shannon` (inside Haspataal root)
- Current Location: Exported as a standalone repository or local archive (e.g. `C:\Users\heman\Developer\shannon-archive`).

If you need to access or restore the Shannon code, please refer to the external repository.
