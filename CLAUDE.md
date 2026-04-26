# 🩺 CLAUDE.md - Project Haspataal

## 🎯 High-Level Mission
Haspataal is a multi-tenant hospital SaaS platform targeting India's tier-2 and tier-3 cities.
Reliability, data privacy (RLS), and sub-30s doctor UX are non-negotiable.

## ⚠️ Session Protocol (MANDATORY)
1. **READ FIRST:** At the start of every session or conversation, **always read this `CLAUDE.md` file before doing any work.** No exceptions.
2. **UPDATE AFTER EVERY BUG FIX:** After fixing any bug, immediately add an entry to the **Knowledge Base** section below with the root cause and fix.
3. **NEVER REPEAT MISTAKES:** Before writing code, check the Knowledge Base for known pitfalls. If a past lesson applies, follow it.
4. **Accountability:** If a bug recurs that is already documented in the Knowledge Base, treat it as a critical failure and flag it.

---

## 🏗️ Architecture (Event-Driven Micro-Architecture)

**Core Logic:**
- **Single Source of Truth:** `EventLog` table. Every write in HMS emits an event.
- **Event Bus:** Dual-write to PostgreSQL (`EventLog`) and Redis Streams for async processing.
- **Multi-Tenancy:** Strict Row-Level Security (RLS) on EVERY table using `current_setting('app.hospital_id')`.
- **Inter-Module Communication:** No direct calls. Modules communicate purely via events (e.g., `patient_visited` triggers `bill_generated`).

**Key Modules:**
- `onboarding/`: Hospital registration and document verification.
- `setup-wizard/`: Dynamic hospital configuration and activation.
- `migration-engine/`: Fuzzy-mapping CSV/Excel imports for legacy data.
- `hms-core/`: OPD, IPD, Billing, Pharmacy, Diagnostics.
- `doctor-ux/`: Keyboard-optimized prescription entry (Sub-30s goal).
- `retention-engine/`: Automated care pathways (Pregnancy, Chronic, etc.) scheduled via `FollowUp` workers.
- `notification-engine/`: WhatsApp-first delivery with SMS fallback and 10pm-8am curfew.
- `analytics-bi/`: Real-time ROI dashboards via Materialized Views and incremental aggregation.

---

## 🛠 Tech Stack & Environment
- **Framework:** Next.js 16 (App Router) / Express.js
- **Styling:** Tailwind CSS 3.4 + Shadcn UI
- **ORM/DB:** Prisma 5 / Raw `pg` Pool for RLS-scoped transactions
- **Auth:** JWT RBAC + Multi-tenant hospital isolation
- **Messaging:** Redis Streams
- **Notifications:** WhatsApp Business API + SMS Gateway
- **AI:** Gemini (Triage & OCR)

---

## 🧠 Recursive Memory & Learning (CRITICAL)
- **RLS Boundary:** Always wrap DB calls in transactions that `SET LOCAL app.hospital_id` to ensure tenant isolation.
- **Event-First:** If you are about to call another module's function, STOP. Emit an event instead.

---

## 📋 Coding Standards
- **Naming:** `PascalCase` for Components, `camelCase` for variables, `kebab-case` for folder names.
- **Imports:** Use absolute paths (e.g., `@/components/...`).
- **Performance:** Prescription entry MUST be mouse-free (Tab/Enter optimized).

---

## 🛠 Commands
- `npm run dev` — Start dev server
- `npm run build` — Production Next.js build
- `npx prisma generate` — Regenerate Prisma client after schema changes
- `npx prisma db push` — Update schema
- `node workers/followup.worker.js` — Run retention engine cron

---

## ✅ Current Production Surface
- Implemented tenant-scoped HMS APIs for setup activation, RBAC permissions, OPD appointments/queue, IPD admissions/discharge, billing invoices/payments, pharmacy dispensing/stock, diagnostics orders/results/pricing, notifications, retention tags, and marketplace discovery.
- Setup wizard is a 14-step DB-backed flow with activation gates for identity, staff/admin, doctors, OPD, billing, and security configuration.
- Billing supports GST-aware invoice line calculations, finalization, payments, and OPD/IPD/diagnostic/pharmacy linkage.
- Security baseline uses JWT hospital sessions, module-level RBAC guard (`requireHospitalAccess`), audit logging on critical writes, encrypted integration credentials, and RLS SQL migration coverage for active tenant tables.
- Known limitation: Prisma requests are tenant-filtered in application code; full PostgreSQL RLS isolation requires applying the SQL migration and binding `app.hospital_id` in production database sessions.

---

## 🔑 Key Design Patterns

### RLS Transaction Wrapper
```ts
await client.query('BEGIN');
await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);
// ... business logic ...
await client.query('COMMIT');
```

### Event Dual-Write
```ts
await client.query('INSERT INTO "EventLog" ...');
await redis.xadd('events', '*', 'type', eventType, 'payload', JSON.stringify(payload));
```

---

## 📚 Knowledge Base (Lessons Learned)
- **Phase 4-10 Build Sequence:** Never skip activation gates. A hospital MUST be `verified` then `activated` before HMS access is granted.
- **Migration Validation:** Always perform client-side fuzzy mapping and validation reports before batch-importing legacy data to prevent DB pollution.
- **Notification Curfew:** Never send non-critical notifications (follow-ups) between 10 PM and 8 AM IST.
- **Materialized Views ROI:** Use materialized views refreshed every 15m for complex analytics (Readmission rates, Network Benchmarks) to keep dashboards responsive.
- **Keyboard-Optimized UX:** Prescription fields must auto-focus sequentially (Drug -> Dose -> Freq -> Duration) on Enter/Tab to hit the <30s target.
- **Chronic Escalation:** Patients missing 2 consecutive chronic follow-ups MUST fire an escalation alert to the treating doctor.
- **WhatsApp Fallback:** If WhatsApp delivery fails or is unregistered (Meta error 131026), immediately fallback to SMS to ensure critical medical adherence.
- **Prisma/RLS Conflict:** Prisma doesn't natively support `SET LOCAL` within its query API easily for every transaction; use raw `pg` pool for sensitive multi-tenant write operations.
- **Unique Constraint Pre-checks:** In hospital registration flows, always perform `Promise.all` pre-checks for unique fields (registrationNumber, adminMobile, adminEmail) before starting a transaction. This prevents generic `P2002` crashes and allows for specific, user-friendly error messages while avoiding transaction rollback overhead. *(Fixed in hospital onboarding flow)*
- **Admin Password Hash Management:** Always use Bcrypt for admin credentials. Ensure hardcoded fallbacks match the intended dev credentials (e.g., `admin123` hash: `$2b$12$YwrNaShX3AbSpPDb7FtlFOilUoeGAmPX5pCfa6IAd48UYfF6B3X7e`).
- **Hydration Attribute Mismatches:** Browser extensions (like Edge Password Manager) often inject attributes (e.g., `fdprocessedid`) into form elements before hydration. Use `suppressHydrationWarning` on inputs and buttons to prevent Next.js hydration errors.
- **Service Layer Hygiene:** Maintain strict organization in `lib/services.ts`. When refactoring, ensure no duplicate service blocks (e.g., `doctor` service) are left behind, as they can cause build failures during ESM parsing.
- **Setup Engine Finalization:** Completed the 14-step configuration wizard. Modules like Billing, Doctors, OPD, and Retention are now data-driven, replacing legacy placeholders.
- **Revenue Intelligence (ROI Tracking):** All bill payments MUST use the centralized `markBillPaid` utility. This ensures every transaction is tagged with a `source` (e.g., 'direct', 'retention_followup') to accurately measure the ROI of retention campaigns.
- **Multi-Branch Session Management:** Use `getActiveBranchId()` from `@/lib/branch` to scope data in multi-campus environments. The `BranchSwitcher` component handles the cross-session branch state via cookies.
- **AES-256 Integration Security:** API keys for third-party integrations (Razorpay, WhatsApp) MUST be stored encrypted in the database. Use the `ENCRYPTION_KEY` environment variable (32-char string) for encryption/decryption at the API boundary.
- **Drag-and-Drop Sorting:** Use `@dnd-kit` for managing hierarchical lists like Wards/Units within Departments to ensure a premium, interactive administrative experience.
- **Prisma Singleton & ESM Compatibility:** In Next.js 16/ESM environments, ensure Prisma is exported as a single, global constant to avoid "cannot redeclare block-scoped variable" errors during hot-reloads and production builds.
- **API/Schema Synchronization:** Always audit API routes immediately after schema migrations. Common pitfalls include renamed fields (e.g., `name` to `bedNumber` in Wards, `drugName` to `name` in Pharmacy) that break generated TypeScript types and cause build-time failures.
- **Real-Time Onboarding UX:** For complex multi-step configuration (e.g., the 14-step setup wizard), disable API caching (`revalidate: 0`) for completion metrics. This ensures that navigation sidebars and progress bars reflect state changes immediately upon form submission without waiting for a revalidation window.
- **Recursive Type Safety:** When processing high-frequency event streams or complex Redis responses, prioritize explicit type casting (e.g., `as any[]`) for iteration if recursive depth or dynamic payloads exceed TypeScript's analysis limits, ensuring build stability.
- **High-Density Dashboard Standards:** Move beyond basic MVP layouts to premium, clinical-grade interfaces. Use `.tsx` for all dashboard components, replacing inline styles with Tailwind CSS, Lucide icons for high-density navigation, and data-rich visualizations like inflow heatmaps for better operational oversight.
- **Supabase Connectivity Optimization:** If the Supabase PgBouncer pooler (port 6543) is intermittently unreachable in local development, switch the `DATABASE_URL` to the direct connection (port 5432) to restore stability.
- **Relaxed Onboarding Requirements:** To prevent administrative friction, only require "Core" identity fields (Legal Name, Display Name, Contact Number) for "Complete" status in the setup wizard. Treat branding assets (Logo, GST) as optional warnings rather than hard blocks for downstream clinical configuration.
- **Clinical Structure Integrity:** Enforce strict rules for hospital structure at the API layer: (1) Auto-generate bed identifiers (B1, B2...) when unit capacity is set, and (2) Prevent deletion of units containing occupied beds to ensure patient data continuity.
- **Setup/API Shape Drift:** Setup pages must consume the same DTO shape returned by their APIs. Pharmacy stock now maps `DrugStock.name/stock/category` to `drugName/quantity/type`, and diagnostics pricing now maps nested master tests to setup-friendly `testName/category/patientMrp` fields.
- **Integration Key Safety:** Never pad or synthesize encryption keys. Integration APIs must refuse writes unless `ENCRYPTION_KEY` is present and at least 32 characters.
- **Fresh Deploy Prisma Generation:** Schema changes that add Prisma models require `prisma generate` during installation; keep `postinstall` in `package.json` so clean deployments build with the current client.

---

## 🤖 Agent Personality
- Be concise.
- Use "we".
- Prioritize event-driven decoupling.
