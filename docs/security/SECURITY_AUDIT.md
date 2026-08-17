# Pre-Flight Security & Audit Review

This document tracks the manual verification of essential security controls required before promoting Haspataal MVP to production.

## 1. Authentication & Session Management
- [x] **Protected Endpoints:** All `/api/hospital/*` routes enforce valid JWT sessions via Next.js Middleware.
- [x] **Secure Cookies:** Session cookies are configured with `HttpOnly`, `Secure` (in production), and `SameSite=Lax`.
- [ ] **CSRF Protection:** Next.js server actions inherently protect against CSRF. API routes parsing `application/json` are verified to only accept requests with appropriate CORS headers from the frontend domain.
- [ ] **Rate Limiting:** Authentication endpoints (login, OTP) have strict IP-based rate limiting applied via Nginx/Middleware to prevent brute-force attacks.

## 2. Authorization & RBAC
- [x] **No IDOR (Insecure Direct Object Reference):** Database queries use `hospitalId` bounds derived securely from the server-side JWT session, meaning a user cannot alter URL IDs to access other hospitals' data.
- [x] **Tenant Isolation:** Multi-tenant separation logic is enforced across all tables (`Patient`, `Appointment`, `Visit`, `Bill`) using the `hospitalId` index.
- [x] **Granular Capability Checks:** UI rendering and API handlers verify `user.role` capabilities (e.g., Doctors cannot access Billing, Reception cannot write clinical notes) via `require-hospital-staff.ts`.

## 3. Data Protection (PHI)
- [x] **Transit Encryption:** SSL/TLS terminates at Nginx (`TLSv1.2` and `TLSv1.3` only, with strong ciphers). No unencrypted HTTP traffic reaches the Next.js app in production.
- [x] **Encryption at Rest:** PostgreSQL database is hosted on an encrypted volume (EBS/LUKS). Backups pushed to S3 are encrypted using AES-256 (SSE-S3).
- [ ] **Data Minimization:** No PHI is logged in plain text in application logs or crash reports.

## 4. Audit Logging
- [ ] **Complete Trail:** Every critical state change (e.g., patient registration, bill generation, prescription save) logs the Actor (Staff ID), Timestamp, Action, and Resource ID.
- [ ] **Immutability:** Audit logs are append-only.

## 5. Security Headers & Configuration
- [x] **Nginx Headers:**
  - `Strict-Transport-Security` (HSTS)
  - `X-Frame-Options` (SAMEORIGIN)
  - `X-XSS-Protection` (Block mode)
  - `X-Content-Type-Options` (nosniff)
  - `Content-Security-Policy` (Restricts iframe embedding and external scripts)
- [x] **Environment Variables:** All secrets (`DATABASE_URL`, `JWT_SECRET`, etc.) are injected at runtime via `.env.production` or Docker secrets, completely excluded from source control.

---
**Status:** In Progress
**Reviewer:** AI Assistant
**Date:** July 2026
