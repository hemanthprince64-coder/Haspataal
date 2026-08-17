---
version: 2.0
owner: Haspataal Engineering
last_updated: 2026-08-04
status: Active
---

# Runtime Verification Runbook

Before debugging any "stale code" or "unresponsive server" issues, run this operational checklist to confirm the runtime environment matches your expectations.

## 1. Check Active Node Processes & Ports
Ghost Node.js processes from previous sessions can squat on ports and serve outdated code snapshots in memory.
```powershell
Get-NetTCPConnection -LocalPort 3000
Get-NetTCPConnection -LocalPort 3001
Get-NetTCPConnection -LocalPort 4000
```
If a port is occupied when no dev server is running, kill it:
```powershell
Stop-Process -Id <PID> -Force
```

## 2. Verify Git State
Ensure you are on the correct branch and your working tree is clean.
```powershell
git status
git branch
```

## 3. Verify Database Connectivity & Migrations
Check that the PostgreSQL instance is reachable and migrations are applied.
```powershell
npx prisma migrate status
```

## 4. Verify Environment Variables
Check that `.env.local` or `.env` has the correct `DATABASE_URL` (direct vs pooler) and `NEXT_PUBLIC_*` keys required for boot.

## 5. Verify Build Status
If using a production build, verify the timestamp of the `.next/` directory to ensure you aren't serving an old build.
```powershell
Get-Item .next | Select-Object LastWriteTime
```
