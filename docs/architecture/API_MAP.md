---\nversion: 2.0\nowner: Haspataal Engineering\nlast_updated: 2026-08-04\nstatus: Active\n---\n
# API Map & Boundaries

## Next.js Server Actions (Internal API)

Used exclusively within Next.js apps (`patient-portal`, `hospital-hms`) for forms and data mutations.

**Rules for Server Actions:**
1. Must use `"use server"`.
2. Must validate all inputs with Zod (`@haspataal/types`).
3. Must explicitly check authorization (`requireAuth`, `requireRole`, `requireHospitalAccess`).
4. Must wrap errors in `withErrorMonitoring()` for Sentry reporting.
5. Must return typed `ActionResult` objects, never throw unhandled exceptions to the client.

## API Gateway (External API)

Used for mobile apps, IoT integrations (Lab machines), and third-party webhooks.

**Architecture:**
- **Framework:** Express.js
- **Auth:** Bearer Token via `jose` (shared with Next.js).
- **Rate Limiting:** Role-based (PATIENT=60, DOCTOR=120, ADMIN=200).
- **Tracing:** Generates `X-Request-ID` header.

## Protected API Endpoints (Webhooks/External)

- Payment gateways (Razorpay).
- WhatsApp Delivery Callbacks (Meta).
- ABDM / ABHA Health ID callbacks.

**Security Rule:** All external webhook endpoints must strictly verify cryptographic signatures (e.g., Razorpay `x-razorpay-signature`) before processing to prevent payload spoofing.
