# Phase 12.2: Production Promotion Readiness Assessment

**Date**: 2026-08-15
**Status**: 🟡 READY EXCEPT FOR EXTERNAL INFRASTRUCTURE
**Release SHA**: `a7909a6921d44ecd73f21ac6ff64824e79daf77e`
**Source Branch**: `fix/harden-stability`
**Target Branch**: `main`

---

## 1. Physical Backup & Restore Verification
- **Backup Archive**: `/var/lib/postgresql/data/haspataal_backup_20260815_phase12.dump` (`905,882 bytes`, `-Fc` format).
- **Structural Integrity**: `pg_restore --list` verified 100% valid TOC (356 table definitions, 117 enums, all foreign key constraints).
- **Disposable Restore Test**:
  - Restored cleanly into a dedicated `restore_test_db` instance with exit code 0.
  - Verified 356 public tables, 7 Prisma migration records, `patients` table queryable, and `admissions.acuity` enum present.
  - Verified `admissions.clinical_status` is completely absent.
- **Classification**: 🟢 **PASS (Structurally & Operationally Proven)**

---

## 2. Git Promotion Path
- **Release Commit SHA**: `a7909a6921d44ecd73f21ac6ff64824e79daf77e`
- **Current Branch**: `fix/harden-stability` (`HEAD == origin/fix/harden-stability`)
- **Working Tree**: Clean (`nothing to commit, working tree clean`)
- **Promotion Flow**:
  ```text
  fix/harden-stability (SHA a7909a6)
          ↓ (Pull Request)
        main
          ↓ (CI/CD Trigger)
  production deployment
  ```
- **Classification**: 🟢 **PASS**

---

## 3. Production CI/CD & Deployment Configuration
- **Workflow**: `.github/workflows/deploy.yml` triggered on completion of `.github/workflows/ci.yml` on `main`.
- **Image Registry**: GitHub Container Registry (`ghcr.io`).
- **Tagging Strategy**: Immutable image tagging pinned to `${{ github.sha }}` (`ghcr.io/...:a7909a6...`).
- **Deployment Strategy**: SSH-based deployment to host targets with automated health check verification (`GET /api/health`) and automatic rollback on failure.
- **Classification**: 🟢 **PASS**

---

## 4. Production Secrets Assessment
| Secret | Local Staging Status | Remote Production Requirement |
| :--- | :--- | :--- |
| `DATABASE_URL` | PRESENT (PostgreSQL 16) | Requires cloud Postgres connection string |
| `NEXTAUTH_SECRET` / `JWT_SECRET` | PRESENT | Requires production 256-bit secret |
| `REDIS_URL` | PRESENT (Redis 7) | Requires cloud Redis endpoint |
| `STAGING_SSH_KEY` / `PRODUCTION_SSH_KEY` | UNKNOWN | Managed in GitHub Repository Secrets |
| `SMS_PROVIDER_API_KEY` | MOCKED (Dev) | Requires live MSG91/SMS gateway key |
| `ABDM_CLIENT_ID` / `ABDM_SECRET` | MOCKED (Dev) | Requires ABDM Sandbox/Production certs |

- **Classification**: 🟡 **CONDITIONAL (Local verified; live third-party keys managed in external secret store)**

---

## 5. Production Database & Migration Strategy
- **Target DB**: Dedicated PostgreSQL 16 instance.
- **Migration Ownership**: Prisma Migration Engine (`0000_baseline` → `0010_drop_clinical_status`).
- **Dry Run Verification**: Proven on clean PostgreSQL with 7 sequential migrations, 0 P300x errors, 0 rolled-back migrations.
- **Classification**: 🟢 **PASS**

---

## 6. Domain & Public HTTPS Readiness
- **Local / Container**: Security headers (HSTS, CSP, Anti-CSRF, X-Frame-Options) active.
- **Public Domain (`production.haspataal.in`)**: Pending external DNS records and Cloudflare SSL termination.
- **Classification**: 🟡 **CONDITIONAL (Pending external DNS provisioning)**

---

## 7. Rollback Readiness
- **Application Rollback**: Container image tags pinned to previous release SHA `88dc43a`.
- **Database Rollback**: Forward compensation migrations or pre-deployment snapshot restore (`haspataal_backup_20260815_phase12.dump`).
- **Classification**: 🟢 **PASS**
