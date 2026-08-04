Version: 2.0
Owner: Haspataal Engineering
Last Updated: 2026-08-04

# Known Issues & Debugging Lessons

## Zombie Node Processes (Port Squatting)
If you are running Next.js locally and the UI renders outdated code despite code changes and server restarts, a ghost Node.js process is likely bound to your port (e.g., 3000, 3001) from an old session.
**Fix:**
```powershell
Get-NetTCPConnection -LocalPort 3000
Stop-Process -Id <PID> -Force
```
Turborepo may silently fail to bind the port or the browser will hit the stale snapshot instead of your current dev server.

## Supabase PgBouncer Pooler Reliability
If the Supabase PgBouncer pooler (port 6543) is intermittently unreachable in local development, switch the `DATABASE_URL` to the direct connection (port 5432) to restore stability.

## Dynamic Route Collisions
Next.js App Router strictly forbids using different slug names for the same dynamic path segment depth (e.g., `[visitId]` vs `[id]`) across sibling folders. The build will fail. Ensure only one path parameter name is used at any given depth.

## Server Action Auth Bypass
`requirePatientAccess` was missing entirely but used inside Server Actions; we re-implemented it to cleanly wrap `requireAuth('session_patient')` to unblock `patient-portal` development.

## Hydration Attribute Mismatches
Browser extensions (like Edge Password Manager or Grammarly/Vantage) often inject attributes (e.g., `fdprocessedid`, `crxemulator`) into form elements or `<html>` before hydration. Use `suppressHydrationWarning` to prevent Next.js hydration errors.
