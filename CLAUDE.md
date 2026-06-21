# 🩺 CLAUDE.md - Project Haspataal

## 🎯 High-Level Mission

Haspataal is a multi-tenant hospital SaaS platform targeting India's tier-2 and tier-3 cities.
Reliability, data privacy (RLS), and sub-30s doctor UX are non-negotiable.

## ⚠️ Session Protocol (MANDATORY)

1. **READ FIRST:** At the start of every session or conversation, **always read this `codebase_memory.md` file before doing any work.** No exceptions.
2. **UPDATE AFTER EVERY BUG FIX:** After fixing any bug, immediately add an entry to the **Knowledge Base** section below with the root cause and fix.
3. **NEVER REPEAT MISTAKES:** Before writing code, check the Knowledge Base for known pitfalls. If a past lesson applies, follow it.
4. **Accountability:** If a bug recurs that is already documented in the Knowledge Base, treat it as a critical failure and flag it.
5. **Mobile Validation:** All hospital-facing login and registration actions MUST validate mobile numbers using `MobileSchema` (min 10 digits) before proceeding to database queries.
6. **Auto-Login:** Successful hospital registration MUST automatically create a session and redirect the user to `/hospital/dashboard/setup` to ensure a frictionless onboarding experience.

---

## 🏗️ Architecture (Turborepo Monorepo)

**Monorepo (npm Workspaces + Turborepo):**

```
haspataal/
├── apps/
│   ├── patient-portal/       ← Primary app (port 3000)
│   ├── hospital-hms/         ← Hospital Admin app (port 3001)
│   ├── admin-panel/          ← Platform Admin panel (port 3002)
│   ├── marketing/            ← Marketing site
│   └── mobile/               ← React Native / Expo app
├── packages/
<<<<<<< Updated upstream
│   ├── types/                ← @haspataal/types — shared TypeScript types
│   ├── db/                   ← @haspataal/db — shared Prisma client singleton
│   ├── ui/                   ← @haspataal/ui — shared shadcn component library
│   ├── logger/               ← @haspataal/logger — shared structured Pino logger
│   └── config/               ← @haspataal/config — shared ESLint/TS/Tailwind
├── haspataal-in/             ← Next.js app (port 3001)
├── haspataal-admin/          ← Next.js admin panel (port 3002)
├── haspataal-com/            ← Next.js public site
├── api-gateway/              ← Express gateway (port 4002, jose JWT, Pino logging)
├── haspataal-mobile/         ← React Native/Expo (standalone, NOT in workspaces)
=======
│   ├── db/                   ← @haspataal/db — Prisma client singleton
│   ├── types/                ← @haspataal/types — Shared domain types & Zod schemas
│   ├── auth/                 ← @haspataal/auth — Shared session/auth logic
│   ├── core/                 ← @haspataal/core — Clean Architecture Domain layer
│   └── config/               ← @haspataal/config — Shared lint/TS/Tailwind
├── services/
│   ├── auth/                 ← Auth microservice (Go/Node)
│   ├── gateway/              ← Express API Gateway
│   └── medchat/              ← AI Service
>>>>>>> Stashed changes
└── turbo.json                ← Turborepo pipeline config
```

**Domain Layer (Clean Architecture in @haspataal/core):**

```
packages/core/
├── domain/
│   ├── entities/             ← Pure logic: Appointment.ts, Patient.ts
│   ├── repositories/         ← Interfaces: IAppointmentRepository.ts
│   └── use-cases/            ← Orchestration: BookAppointmentUseCase.ts
├── infrastructure/
│   └── prisma/               ← Implementations: PrismaAppointmentRepository.ts
└── index.ts                  ← Public API
```

**Core Logic:**

- **Single Source of Truth:** `EventLog` table. Every write in HMS emits an event.
- **Event Bus:** Dual-write to PostgreSQL (`EventLog`) and Redis Streams for async processing.
- **Multi-Tenancy:** Strict Row-Level Security (RLS) on EVERY table using `current_setting('app.hospital_id')`.
- **Inter-Module Communication:** No direct calls. Modules communicate purely via events.

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
- **Build System:** Turborepo + npm Workspaces
- **Styling:** Tailwind CSS 3.4 + Shadcn UI (`@haspataal/ui`)
- **ORM/DB:** Prisma 5 (`@haspataal/db`) / Raw `pg` Pool for RLS-scoped transactions
- **Auth:** `jose` JWT RBAC + Multi-tenant hospital isolation (unified across root app + gateway)
- **Observability:** Shared Pino structured logging (@haspataal/logger) with PHI redaction, Prometheus metrics (prom-client), and structured health checks (/api/health).
- **API Gateway:** Express with role-based rate limiting and X-Request-ID correlation.
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

- `npm run dev` — Start root app dev server
- `npm run dev:all` — Start ALL apps via Turborepo
- `npm run dev:admin` — Start admin panel only
- `npm run dev:gateway` — Start API gateway only
- `npm run build` — Production build (root app)
- `npm run build:all` — Build ALL apps via Turborepo
- `npm run lint:all` — Lint ALL apps via Turborepo
- `npx prisma generate` — Regenerate Prisma client after schema changes
- `npx prisma db push` — Update schema
- `node workers/followup.worker.js` — Run retention engine cron
- `make dev` — Start the full local Docker dev stack (Postgres + Redis + Nginx + Apps)
- `make test` — Run all unit and integration tests
- `make migrate` — Apply Prisma migrations locally

---

## ✅ Current Production Surface

- Completed the comprehensive 13-step clinical and financial setup wizard.
- **Clinical Architecture**: Consolidated department and bed inventory management with Head Doctor assignment logic.
- **Financial Treasury**: GST-compliant billing with HSN mapping, service bundling (packages), and automated invoice sequencing.
- **Clinical Dispensary**: Pharmacy stock management with formulation tracking, reorder alerts, and safety audits for expired batches.
- **Investigation Hub**: Diagnostics master test registry with turnaround SLA tracking and LIS integration hooks.
- **Communications Node**: Consolidated WhatsApp/SMS/Email/Gateway orchestration with DLT-compliant template management.
- **Marketplace Discovery**: Professional hospital profiles with media galleries, insurance panel support, and multi-tier cancellation policies.
- **Retention Engine**: Logic-driven patient recall with frequency capping and audience segmentation.
- **Bihar Pregnancy Tracker (Phase 2 & 3)**: Completed full integration with ABDM/ABHA IDs, FHIR R4 resource exports, bilingual Hindi/Bhojpuri MCH portal with TTS reader, WHO Partograph chart, referral slip generator, 108 emergency ambulance integration, and e-Raktkosh blood bank locator.
- **Activation Gate**: Deep validation engine ensuring 100% compliance before production workflow enablement.

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

## 📚 Knowledge Base (Lessons Learned)

- **Hospital Login Session (hospitalId):** The login service MUST include `hospitalId` in the returned user object. The `requireHospitalAccess` middleware depends on this field to enforce tenant isolation. Omission causes post-login 401/403 errors and dashboard redirects. _(Fixed 2026-05-05)_
- **Hospital Mobile Validation:** Hospital login and registration actions must validate mobile numbers via `MobileSchema`. Unvalidated mobile strings lead to poor UX ("Invalid credentials" for typos) and malformed data that breaks downstream SMS/WhatsApp integrations. _(Fixed 2026-05-05)_
- **Hospital Auto-Login:** Registrations now auto-login the admin and redirect to `/hospital/dashboard/setup`. This is achieved by capturing the returned `hospital` object from the register service and immediately calling `createSession`. This eliminates onboarding friction and improves conversion. _(Implemented 2026-05-05)_
- **Phase 4-10 Build Sequence:** Never skip activation gates. A hospital MUST be `verified` then `activated` before HMS access is granted.
- **Migration Validation:** Always perform client-side fuzzy mapping and validation reports before batch-importing legacy data to prevent DB pollution.
- **Notification Curfew:** Never send non-critical notifications (follow-ups) between 10 PM and 8 AM IST.
- **Materialized Views ROI:** Use materialized views refreshed every 15m for complex analytics (Readmission rates, Network Benchmarks) to keep dashboards responsive.
- **Keyboard-Optimized UX:** Prescription fields must auto-focus sequentially (Drug -> Dose -> Freq -> Duration) on Enter/Tab to hit the <30s target.
- **Chronic Escalation:** Patients missing 2 consecutive chronic follow-ups MUST fire an escalation alert to the treating doctor.
- **WhatsApp Fallback:** If WhatsApp delivery fails or is unregistered (Meta error 131026), immediately fallback to SMS to ensure critical medical adherence.
- **Prisma/RLS Conflict:** Prisma doesn't natively support `SET LOCAL` within its query API easily for every transaction; use raw `pg` pool for sensitive multi-tenant write operations.
- **Unique Constraint Pre-checks:** In hospital registration flows, always perform `Promise.all` pre-checks for unique fields (registrationNumber, adminMobile, adminEmail) before starting a transaction. This prevents generic `P2002` crashes and allows for specific, user-friendly error messages while avoiding transaction rollback overhead. _(Fixed in hospital onboarding flow)_
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
- **Dynamic Import in Client Pages:** Using `next/dynamic` default import in client pages can yield `dynamic is not defined` in Next.js 15 webpack/5 App Router builds. When the dynamic loading boundary provides little gain, prefer a direct static import for child components. _(Fixed 2026-06-14)_
- **Module-Hoisted UI Imports:** After replacing a dynamic import with a static `import DoctorCard from './components/DoctorCard'`, sibling UI imports like `Badge`, `Button`, and `Card` were lost and the client module boot failed at runtime with `<Badge> is not defined`. When changing import blocks, preserve the full set of UI component imports the JSX depends on. _(Fixed 2026-06-14)_
- **Setup/API Shape Drift:** Setup pages must consume the same DTO shape returned by their APIs. Pharmacy stock now maps `DrugStock.name/stock/category` to `drugName/quantity/type`, and diagnostics pricing now maps nested master tests to setup-friendly `testName/category/patientMrp` fields.
- **Integration Key Safety:** Never pad or synthesize encryption keys. Integration APIs must refuse writes unless `ENCRYPTION_KEY` is present and at least 32 characters.
- **Fresh Deploy Prisma Generation:** Schema changes that add Prisma models require `prisma generate` during installation; keep `postinstall` in `package.json` so clean deployments build with the current client.
- **Identity Configuration Mapping:** To resolve "No identity configured" blocks and invoicing warnings, ensure `contactNumber` and `registrationNumber` are explicitly mapped in the Identity API/UI. Additionally, the setup completion engine must be GST-aware; only trigger compliance warnings for missing GST if the hospital's billing profile explicitly marks GST as applicable, preventing false negatives for non-GST entities.
- **Resilient Static Generation (Sitemap):** In Next.js static route generation (e.g., `sitemap.ts`), always wrap dynamic database fetches in `try-catch` blocks. This ensures that if the database is unreachable during the build process, the system can gracefully fallback to static routes instead of failing the entire build. Additionally, keep Prisma connection limits tight in shared environments to prevent pool exhaustion during parallel static generation.
- **Monorepo npm Workspaces:** After pulling, always run `npm install` from the ROOT directory. Individual app `node_modules/` are hoisted to root. Never `npm install` inside a sub-app. `haspataal-mobile` (Expo) stays outside workspaces because Metro bundler is incompatible.
- **Domain Layer Decomposition:** `lib/services.ts` is being progressively refactored into `lib/repositories/` (Prisma queries behind interfaces) and `lib/use-cases/` (pure business logic). The `services` export object stays identical — nothing downstream breaks. New business logic should be written as a use-case class, not added to `services.ts`.
- **API Gateway Auth Unification:** The gateway now uses `jose` (not `jsonwebtoken`) for JWT verification, aligned with the root app's `lib/session.ts`. Per-role rate limits: PATIENT=60, DOCTOR=120, HOSPITAL_ADMIN=200, SUPER_ADMIN=unlimited. Every request gets an `X-Request-ID` correlation header for distributed tracing.
- **npm audit fix --force Workspace Bug:** Never run `npm audit fix --force` in a workspace monorepo — it hits `undefined@undefined` resolution errors. Use `npm audit fix` (without --force) instead.
- **Hospital.password @ignore (SECURITY):** `HospitalsMaster.password` is marked `@ignore` in Prisma schema to prevent password hashes from leaking to API responses. Hospital login and registration use raw SQL (`$queryRaw` / `$executeRaw`) to read/write the password field. NEVER remove `@ignore` from this field. Use `lib/dto/hospital.ts` → `toHospitalSafeDto()` when returning hospital data to clients.
- **TypeScript Migration:** `app/actions.ts` (formerly `.js`) now has full Zod input schemas (`RegisterDoctorSchema`, `RegisterHospitalSchema`, `BookAppointmentSchema`, etc.) and typed `ActionResult` returns on all 50+ server actions. All catch clauses use `catch (e: any)`. New server actions MUST be written in TypeScript with Zod validation.
- **Prettier + Husky + lint-staged:** Pre-commit hooks auto-format staged files. Config: `printWidth: 100`, `singleQuote: true`, `trailingComma: all`. Run `npm run format:check` in CI. Run `npm run format:fix` to format the entire repo.
- **Server Actions & Non-Function Exports:** Files marked with `"use server"` must ONLY export `async` functions. Runtime values like Zod schema objects must be moved to a separate file (e.g., `lib/validations.ts`) to avoid "A 'use server' file can only export async functions" errors.
- **Prisma @ignore & Query Engine Panics:** Using `@ignore` on fields (like `password`) can cause the Prisma Query Engine to panic with "Server has closed the connection" if `findFirst` or `create` is called without an explicit `select` block that excludes those fields. Always use explicit `select` or raw SQL when working with models that have ignored fields.
- **Suspicious Dependency Auditing:** Before removing unused-looking dependencies like `boneyard-js`, check for usage in auto-generated or hidden folders (e.g., `bones/`). Restore if necessary to prevent build breakages.
- **Local Dev Orchestration:** Use the `Makefile` to manage the full Docker stack. `make dev` ensures that networking (Nginx), state (Postgres/Redis), and applications are correctly initialized in order.
- **Strict FormData Type Safety:** In Next.js Server Actions, always cast `formData.get()` results explicitly (e.g., `as string` or `as File`). TypeScript's `noEmit` check fails if `FormDataEntryValue` is passed directly to functions expecting specific types.
- **Zod Error Access Migration:** Standardized on `issues[0]` instead of the legacy `errors[0]` property when extracting validation error messages from Zod. This prevents runtime `undefined` errors and aligns with modern Zod patterns.
- **Supabase Pooler vs. Direct Connect:** When port 6543 (PgBouncer) fails with "Can't reach database server", update `.env.local` to port 5432 and remove `pgbouncer=true`. This is the most reliable way to restore local dev connectivity.
- **Automated RLS Policy Patching:** If the Supabase linter reports "RLS Enabled No Policy", use a dedicated SQL patch script (e.g., `fix_missing_rls_policies.sql`) to implement modular RBAC for all affected tables, ensuring multi-tenant isolation.
- **Monorepo Migration (Turborepo):** Haspataal has moved to a full Turborepo structure. All shared logic must reside in `packages/`. Apps in `apps/` must consume shared packages via workspace protocol (`*`). Never copy `lib/` or `types/` between apps. _(Implemented 2026-05-05)_
- **Strict Healthcare Linting:** ESLint is configured with healthcare-specific rules via `eslint-plugin-local-rules`. Direct Prisma access in pages/layouts is forbidden; use the service/core layer. Logging of PHI (patientId, phone, etc.) is blocked at the lint level. _(Implemented 2026-05-05)_
- **Clean Architecture Transition:** Core business logic is migrating to `@haspataal/core`. Use-cases must be pure logic classes that depend on repository interfaces, ensuring 100% testability without a database. _(Implemented 2026-05-05)_
- **PR & Security Guardrails:** All PRs must use the `PULL_REQUEST_TEMPLATE.md` and pass the CI test suite. Security checks are mandatory for any changes touching auth, PII, or schema. _(Implemented 2026-05-05)_
- **Developer Workflow (Husky/lint-staged):** Pre-commit hooks enforce Prettier formatting and ESLint rules. Commit messages must follow Conventional Commits and are validated via `commitlint`. _(Implemented 2026-05-05)_

- **Architectural Graphify Discovery:** Use `graphify` to map cross-module relationships. It identified an isolated "ghost" microservice (`medchat-ai-service`) and 55 `requireRole` guarded actions, helping bridge architectural knowledge gaps.
- **AI Microservice Orchestration:** Offload heavy clinical reasoning (Gemini 2.5) to dedicated services (FastAPI). The JS engine (`triage-engine.js`) now prioritizes this service with a local fallback (Gemini 2.0) to ensure high availability and performance.
- **Graphify Exclusions:** Always ignore `graphify-out/` in git to keep the repository clean of large AST/Knowledge Graph artifacts.
- **Sliding Window Rate Limiting (Redis):** Implemented an atomic Lua-backed sliding window rate limiter in `lib/rate-limit.ts` using `ioredis`. Wrapped critical Server Actions (`loginHospital`, `registerHospital`, etc.) using a generic `withRateLimit` Higher-Order Component. Note that `ioredis` is incompatible with Next.js Edge runtime, so API rate limit headers in `middleware.ts` require separate handling.
- **Optimized 13-Step Setup Wizard:** Consolidated the configuration flow into a linear dependency chain (Identity → Branches → Clinical Architecture → Staff → Doctors → OPD → Billing → Pharmacy → Diagnostics → Integrations → Retention → Marketplace → Activation). This resolves circular dependencies and merges redundant steps (Wards into Architecture, Notifications into Integrations).
- **Hardened Clinical Validation (Setup):** The activation engine now enforces deep property-level safety: (1) Mandatory Head Doctor assignments for IPD departments, (2) Block activation if expired batches exist in pharmacy stock, (3) Enforce at least one `HOSPITAL_ADMIN` role, and (4) Require full address/email for compliance.
- **Marketplace & Treasury Expansion:** Marketplace profiles now support cover images, galleries, and insurance panels (TPA tie-ups). Billing includes native HSN code mapping, automated invoice sequencing (Prefix + Series), and bank payout profiles.
- **ABDM/ABHA Integration Node:** Dedicated integration node for Ayushman Bharat Digital Mission (ABDM) onboarding, enabling hospital facility ID registration and consent-driven health record syncing.
- **Communications Hub Consolidation:** The standalone Notifications step has been merged into a unified "Communications & Nodes" hub. This hub uses a centralized `NotificationEventMapping` table to link clinical events (e.g., `APPOINTMENT_BOOKED`) to specific WhatsApp/SMS/Email templates, eliminating redundant provider configuration and improving transactional reliability. _(Implemented 2026-05-05)_
- **Marketplace Persistence & Media:** The Marketplace setup module is now fully hydrated from the `HospitalsMaster` table and supports rich media (cover images, galleries) and complex booking policies (cancellation strictness, deposits). All profile updates use a dedicated REST API to ensure data integrity before public listing. _(Implemented 2026-05-05)_
- **Dependency Hardening & Pinning:** Standardized on exact versions for all dependencies across the monorepo to ensure build reproducibility. Use the `node pin-versions.js` utility after adding new packages to strip carets (`^`) and tildes (`~`) based on the root `package-lock.json`. _(Implemented 2026-05-05)_
- **Workspace Vulnerability Resolution:** When `npm audit` reports vulnerabilities in workspace `node_modules` that `npm audit fix` fails to resolve, use a structured `overrides` block in the root `package.json`. Specifically, for `postcss` and `uuid` issues inside `next` and `bullmq`, we use explicit version overrides to force secure patches project-wide. _(Fixed 2026-05-05)_
- **Redis Client Standardization:** The project is strictly consolidated to `ioredis` for all caching, rate-limiting, and queue operations (`bullmq`). The standalone `redis` package is prohibited to avoid client fragmentation and compatibility issues with Next.js/Turborepo. _(Audited 2026-05-05)_
- **Monorepo Migration (Turborepo):** Haspataal has moved to a full Turborepo structure. All shared logic must reside in `packages/`. Apps in `apps/` must consume shared packages via workspace protocol (`*`). Never copy `lib/` or `types/` between apps. _(Implemented 2026-05-05)_
- **Strict Healthcare Linting:** ESLint is configured with healthcare-specific rules via `eslint-plugin-local-rules`. Direct Prisma access in pages/layouts is forbidden; use the service/core layer. Logging of PHI (patientId, phone, etc.) is blocked at the lint level. _(Implemented 2026-05-05)_
- **Clean Architecture Transition:** Core business logic is migrating to `@haspataal/core`. Use-cases must be pure logic classes that depend on repository interfaces, ensuring 100% testability without a database. _(Implemented 2026-05-05)_
- **PR & Security Guardrails:** All PRs must use the `PULL_REQUEST_TEMPLATE.md` and pass the CI test suite. Security checks are mandatory for any changes touching auth, PII, or schema. _(Implemented 2026-05-05)_
- **Developer Workflow (Husky/lint-staged):** Pre-commit hooks enforce Prettier formatting and ESLint rules. Commit messages must follow Conventional Commits and are validated via `commitlint`. _(Implemented 2026-05-05)_
- **PHI Protection (Logging):** Always use `@haspataal/logger`. It is configured to automatically redact sensitive fields (password, token, secret, authorization). Never use `console.log` for patient data; it violates PHI compliance and will be flagged by ESLint. _(Implemented 2026-05-05)_
- **Structured Health Monitoring:** Use the structured `/api/health` endpoint for Docker/K8s health checks. It validates DB (Prisma), Cache (Redis), and External Services (Supabase) connectivity, returning status codes 200 (healthy), 207 (degraded), or 503 (unhealthy). _(Implemented 2026-05-05)_
- **Performance Optimization (N+1 & Caching):** Eliminated N+1 query patterns in doctor and hospital fetching via Prisma `include` blocks. Parallelized independent agent dashboard queries using `Promise.all`. Implemented 1-hour ISR caching for public search routes and `revalidate: 0` for clinical dashboards to balance speed and data freshness. _(Implemented 2026-05-05)_
- **Sentry Error Monitoring:** Integrated `@sentry/nextjs` across all apps. Implemented a mandatory `beforeSend` hook to recursively scrub PHI (passwords, tokens, medicalHistory) before reporting. Standardized Server Actions with `withErrorMonitoring()` HOF to return sanitized `errorId` for patient support. _(Implemented 2026-05-05)_
- **Automated Quality Audit:** Created `scripts/quality-audit.ts` to verify 28 engineering standards across security, quality, structure, and excellence. Includes automated checks for plaintext passwords, test coverage (70%+), and compliance documentation. _(Implemented 2026-05-05)_
- **SessionUser Type Consolidation:** Consistently use the `SessionUser` interface from the root `@/types` for all server actions and dashboard layouts. This ensures type safety for `hospitalId` and RBAC checks. Missing exports or local redeclarations cause cascading build failures. _(Fixed 2026-05-06)_
- **Safe Zod Error Handling:** Always use optional chaining when accessing Zod issues (e.g., `validation.error.issues[0]?.message`). This prevents runtime "cannot read property message of undefined" errors in edge cases where validation fails but the issues array is unexpectedly shaped. _(Standardized 2026-05-06)_
- **Prisma Update Filtering:** When performing profile updates from a `Partial<T>` object, explicitly destructure out non-updatable fields like `id` and `phone` before passing the data to `prisma.update()`. This prevents "property does not exist in type" errors and accidental primary key mutations. _(Fixed in PrismaPatientRepository)_
- **Async Type Narrowing (Redis):** In async functions using singleton clients (like Redis), copy the client to a local constant before use. This helps TypeScript's control flow analysis maintain the "not-null" narrowing across `await` boundaries. _(Applied in rate-limit.ts)_
- **Dashboard Branch Safety:** Server-side `getActiveBranchId()` returns `string | null`. Dashboard layouts and the `BranchSwitcher` component must explicitly handle the `null` state to prevent hydration mismatches and typing errors. _(Hardened 2026-05-06)_
- **Monorepo Cleanup & Dev Target:** Following the Turborepo migration, legacy root directories (`app`, `lib`, `components`, etc.) were removed to prevent duplication and import errors. The root `npm run dev` script now correctly targets the `patient-portal` app (`patient-portal`) using Turborepo filters. Ensure `package.json` exists in each app for workspace recognition. _(Finalized 2026-05-07)_
- **Turbopack Persistence (Windows):** If `npm run dev` shows `Access is denied (os error 5)`, this is a known Turbopack issue on Windows. The server is still functional. To resolve, ensure the terminal has full permissions to the workspace or run as Administrator. _(Noted 2026-05-07)_
- **HMS UI Redesign:** Implemented a comprehensive Hospital Management System with modern medical aesthetic using shadcn/ui, Tailwind CSS, and Framer Motion. Features include patient management DataTable, appointment scheduling, electronic health records with tabs/accordions, inventory management with status badges, dark/light mode support, and full accessibility compliance. Located in the patient-portal app with modular component architecture. _(Implemented 2026-05-07)_
- **Stabilization & Simplification (Phase 2):** Simplified core utilities in `apps/patient-portal` to reduce external dependency overhead and improve runtime stability. This includes moving to a `SimpleLogger`, internalizing basic metrics, and implementing a lightweight session manager using `jose`. _(Implemented 2026-05-08)_
- **Internalized Local Types:** Migrated `patient-portal` to local TypeScript interfaces (`types.ts`) and a local Prisma singleton to isolate app logic from monorepo-level package drift during high-frequency development. _(Implemented 2026-05-08)_
- **Lightweight `cn` Utility:** Replaced `clsx` and `tailwind-merge` with a native `cn` filter in `lib/utils.ts` to reduce bundle size and eliminate CSS-in-JS hydration overhead in the patient portal. _(Implemented 2026-05-08)_
- **Local Event & Component Registry:** Introduced a lightweight `EventEmitter` service and a `bones/` registry in `patient-portal` to support decoupled component interaction and dynamic registration without the complexity of a full-scale event bus in early development. _(Implemented 2026-05-08)_
- **Next.js 15 Suspense & searchParams:** In Next.js 15, `searchParams` is passed as a Promise. Client Components should use `useSearchParams()` from `next/navigation` wrapped in a `<Suspense>` boundary. Using `use(searchParams)` inside a Client Component can cause Next.js to hang indefinitely on a `loading.tsx` skeleton. _(Fixed 2026-05-11)_
- **Tailwind CSS Variable Overrides:** When using HSL variables in Tailwind (e.g. `hsl(var(--primary))`), ensure that legacy CSS overrides do not define these variables using HEX formats (like `--primary: #2563eb`). Tailwind cannot parse `hsl(#2563eb)`, which silently results in transparent backgrounds and invisible text. _(Fixed 2026-05-11)_
- **CardContent Vertical Centering (shadcn/ui):** The `CardContent` component originally had `pt-0` baked into its base styles (designed for use below a `CardHeader`). This caused all standalone card content to stick to the top regardless of consumer padding. The fix was to remove `pt-0` from the base class in `components/ui/card.tsx` so each consumer controls their own padding. _(Root-fixed 2026-05-17)_
- **Standardized Dashboard Card Layout:** To achieve "perfect" visual synchronization across dashboard sections, use a rigid `grid-cols-[auto_1fr_auto]` structure within cards. This locks icons, text headers, and trailing chevrons onto identical horizontal axes across different card instances. _(Implemented 2026-05-11)_
- **Structured Logging Support:** The `SimpleLogger` in `patient-portal` now accepts objects as the first argument, enabling structured logging (e.g., `logger.error({ action, error })`) in server actions while maintaining compatibility with legacy string-based calls. _(Fixed 2026-05-12)_
- **Type Safety & Interface Relaxation:** Relaxed the `Doctor` and `Hospital` interfaces in `types.ts` by making several fields optional. This prevents "Property missing" casting errors when services return partial data or have slightly different field names than the database models. _(Hardened 2026-05-12)_
- **Service-to-Model Field Mapping:** Service methods in `services.ts` now explicitly map Prisma fields (`fullName`, `legalName`) to common application properties (`name`) before returning data. This ensures that UI components consuming these types always find the expected data regardless of underlying DB column names. _(Fixed 2026-05-12)_
- **Internalized Metrics API Alignment:** The `Counter` utility in `lib/metrics.ts` was updated to support the `.inc()` method and optional labels, bringing its API in line with standard `prom-client` patterns and resolving service-layer type errors. _(Fixed 2026-05-12)_
- **Project Documentation Alignment:** All architectural and design specifications have been consolidated in the `docs/` directory. This includes PRD, TRD, Backend Schema, UI/UX Brief, and Implementation Plans to ensure a single source of truth for engineering and design. _(Updated 2026-05-12)_
- **Hospital Login Normalization:** Mobile numbers in hospital login and registration MUST be normalized (e.g., using `.replace(/\D/g, '').slice(-10)`) before querying the database. This ensures that inputs with country codes or spaces match the stored records correctly. _(Fixed 2026-05-12)_
- **Hospital Login Field Mapping (Raw SQL):** Raw SQL queries for the `hospitals_master` table return fields in `snake_case` (e.g., `legal_name`, `display_name`). The login service must explicitly map these to the `name` property in the returned user object to prevent `undefined` session values. _(Fixed 2026-05-12)_
- **Environment Variable Overrides:** In a monorepo, app-level `.env` files (e.g., `apps/patient-portal/.env`) take precedence over root `.env`. Ensure critical variables like `DATABASE_URL` are synchronized to prevent "Invalid credentials" errors caused by connecting to the wrong database (e.g., localhost vs Supabase). _(Fixed 2026-05-12)_
- **UI/UX Audit — Patient Portal (Post-Audit Cycle 2):** Second-round audit of `apps/patient-portal` after prior fixes. Resolved remaining gaps: (1) BookingForm error state now shows retry button, (2) Profile logout fires a confirmation Dialog before terminating session, (3) Emergency SOS fetch checks `res.ok` and surfaces network failure banner, (4) MedChat realtimeSpecs badges use CSS hover tooltip instead of native `title`, (5) Login OTP helper now has an `Info` hover tooltip explaining dev mode behaviour, (6) Hardcoded `text-[8/9px]` and `font-black` abuse replaced with `text-[10px]` / `font-semibold` / `font-bold` in book/page.js, BookingForm.js, search/page.tsx, and login/page.js, (7) Sidebar active link uses `pl-[calc(0.75rem+3px)]` with persistent `border-l-[3px] border-transparent` on all items to eliminate layout shift when active class changes border colour, (8) Sidebar focus ring upgraded to `ring-4` for stronger keyboard a11y, (9) DoctorCard `User` fallback icon opacity fixed to 100 to match other icons, (10) Footer social icons replaced with inline SVG brand icons (LinkedIn, Twitter/X, WhatsApp) with correct hover colours and `aria-label`, (11) Quick Action grid and Specialities cards unified from `p-6` to `p-8`. _(Implemented 2026-05-17)_
- **Accessibility — BottomNav & Sidebar:** Added `aria-label` to all BottomNav links. Sidebar nav links use `focus-visible:ring-4 focus-visible:ring-blue-500`. Sidebar active link layout shift eliminated using `pl-[calc(0.75rem+3px)]` on every item so border-colour changes never reflow the text. _(Fixed 2026-05-17)_
- **Design System — Typography Standardization:** `text-[8px] font-black` migrated to `text-[10px] font-semibold` for labels; `font-black` reserved for hero headlines only. `tracking-widest` replaced with `tracking-wide` on small filter-section labels for readability. _(Standardized 2026-05-17)_
- **Lucide-react Brand Icons Removed:** `Facebook`, `Twitter`, `Instagram`, and `Linkedin` icons no longer exist in modern `lucide-react`. Replaced generic placeholder icons in FooterLinks with inline SVG brand icons for LinkedIn, Twitter/X, and WhatsApp. _(Fixed 2026-05-17)_
- **Emergency SOS Error Handling:** The `/api/emergency/sos` fetch now validates `res.ok` and surfaces a visible amber error banner when the network request fails, stopping the calling state and prompting the user to call 108 directly instead of silently failing on console only. _(Implemented 2026-05-17)_
- **Patient Portal — Logout Confirmation Dialog:** Profile page "Terminate Secured Session" button now triggers an `AlertTriangle`-flagged shadcn `Dialog` before submitting `patientLogout`, preventing accidental session termination on desktop and mobile. _(Implemented 2026-05-17)_
- **Clinic Tier Data Model (NEW):** The `HospitalsMaster` table now has `facilityType` (FacilityType enum: HOSPITAL/CLINIC), `clinicTier` (ClinicTier enum: SINGLE_DOCTOR/MULTI_SPECIALITY), `gstExempt` (boolean), and `operatingHours` (JSON). New tables: `clinic_profiles` (1:1 with HospitalsMaster), `patient_acquisitions`, `ai_documents`, `referral_trackings`, `clinic_follow_up_configs`. Backwards-compatible — existing hospital records default to `HOSPITAL`. _(Implemented 2026-05-20)_
- **Chronic Escalation Engine (NEW):** Patients with 2 or more consecutive missed CHRONIC_DISEASE follow-ups trigger a `chronic_escalation_alert` event. The `FollowUpWorker.checkChronicEscalation()` method inserts into `escalation_alerts` with an `ON CONFLICT (appointment_id, hospital_id) DO NOTHING` guard. The `EscalationWorker` dispatches WhatsApp → SMS fallback notifications every 15 minutes via `FOR UPDATE SKIP LOCKED` batch processing. Doctors acknowledge via `PATCH /v1/escalations/:id`. The escalation page is at `/hospital/escalations`. Backfill script: `lib/backfill-escalations.ts --dry-run --since YYYY-MM-DD`. _(Implemented 2026-05-20)_
- **Prisma Migration Drift — CREATE TYPE idempotency:** The `20240520_clinic_and_escalation` migration originally used bare `CREATE TYPE` statements without `IF NOT EXISTS`, causing failures when re-running or when the database had been `db push`'d. Fixed by wrapping each `CREATE TYPE` in a `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object ... END $$;` block. Also removed the redundant `20240520_clinic_tier` migration (overlapping DDL). Added `migration_lock.toml` (provider = "postgresql") so `prisma migrate deploy` can track applied migrations. Added `npm run migrate` script to root `package.json` for convenience. _(Fixed 2026-05-22)_
- **IST Half-Hour Offset in Notification Curfew:** The `evaluateCurfew()` function originally used `new Date()` (UTC) without accounting for the +30 minute IST half-hour offset. This caused the curfew boundaries (08:00–22:00 IST) to be evaluated as 07:30–21:30 UTC, leading to incorrect notification deferrals. Fix: adjust the UTC comparison to explicitly handle the IST +30 min offset. _(Fixed 2026-05-22)_
- **SQL Row / CamelCase Field Name Mismatch in Workers:** The `EscalationWorker` raw `SELECT` query returns columns in `snake_case` (e.g., `hospital_id`, `chronic_tag`), but the TypeScript code destructured the row using `camelCase` (e.g., `hospitalId`, `chronicTag`), causing all aliased fields to be `undefined`. This silently broke `EventService.publish` payloads and the escalation message template. Fix: use object renaming in destructuring (e.g., `hospital_id: hospitalId`) in `attemptEscalate` to align with the actual DB row shape returned by the Prisma raw query. _(Fixed 2026-05-24)_
- **Redis Mocking is Mandatory for Worker Unit Tests:** Tests invoking `EscalationWorker.processQueue()` must mock both `vi.mocked(redis).eval` and `evaluateCurfew`. A missing Redis mock triggers `MaxRetriesPerRequestError` from `ioredis`, which propagates, triggers the worker's outer `catch` block, and issues a `ROLLBACK` instead of the expected `COMMIT`. Tests also need to account for `BEGIN` and `SET LOCAL` queries when ordering `FakePgClient` result arrays. _(Fixed 2026-05-24)_
- **Redis Connection Error Log Suppression in Dev:** When Redis is not running locally, `apps/patient-portal/lib/redis.ts` (ioredis with lazyConnect) repeatedly emitted "❌ Redis connection error" + "⚠️  Redis is not available. Rate limiting will be disabled." on every reconnect attempt during `npm run dev`. Fixed by adding a module-level `redisConnectionErrorLogged` flag (reset on 'connect' success) so the unavailable state is announced only once per process. `rate-limit.ts` catch blocks now silently fallback (no per-request spam). This is expected graceful degradation — rate limiting uses in-memory fallback when Redis is absent. _(Fixed 2026-05-24)_
- **Hospital Onboarding Wizard Refactor (2026-05-24):** Extracted the full 14-stage hospital/clinic setup from the dashboard sidebar into a dedicated full-screen route `/hospital/setup` with its own minimal layout (no nav chrome). Introduced six new granular stage components (`wizard-hospital-identity`, `wizard-doctor-profile`, `wizard-department-setup`, `wizard-whatsapp-comms`, `wizard-billing-setup`, `wizard-type-result`) loaded via dynamic imports. Major refactors to `discovery-wizard.tsx`, `setup-wizard-auto.tsx`, staff/workflow components, services, actions, admin dashboards, and types to support clinic vs hospital branching, progressive disclosure, and mobile-first UX. The new route is now the canonical post-registration destination for HOSPITAL_ADMIN users.
- **Setup Verification + Go-Live Operational Layer (2026-05-24):** Added `verifySetupVerificationAction` (password/OTP re-auth gate before activation) and `getGoLiveDashboardDataAction` + `getPatientTimelineEventsAction` + `registerWalkInVisitAction`. Major enhancements to `discovery-wizard.tsx` (branching + progress) and complete rewrite of `go-live-dashboard.tsx` (live queue, payout calculator, specialist timeline, visit registration). Small supporting updates to dashboard layout, setup stage API, and services. Completes the post-onboarding operational surface for hospitals.
- **Prisma CLI Wrapper Must Use the Exported prepareSchema Function:** `scripts/prisma-cmd.js` originally assumed `require('./prepare-schema')` exposed a callable function, but `scripts/prepare-schema.js` only executed as a side-effect. Fixed by exporting `prepareSchema()` from `scripts/prepare-schema.js` and calling it explicitly from `scripts/prisma-cmd.js`. _(Fixed 2026-06-14)_
- **OTP Debug Logging Must Be Environment-Gated:** OTP values are sensitive and should never be logged by default. For local terminal troubleshooting only, add a guarded `LOG_OTP=1` + `NODE_ENV=development` log that writes a single `[OTP_DEV]` line to stdout with masked phone, channel, code, and expiry. _(Fixed 2026-06-14)_
- **Generated SQLite Schema Drift is Dangerous:** The `prepare-schema.js` script generates `packages/db/prisma/schema.sqlite.prisma` from the canonical Postgres schema whenever `DATABASE_PROVIDER=sqlite`. If this generated file is checked in and then the canonical schema changes, the generated file becomes stale and causes Prisma datasource validation errors or migration mismatches. Fix: treat `schema.sqlite.prisma` as a build artifact that must be regenerated at runtime, not committed. _(Fixed 2026-06-14)_
- **OTP Service Must Tolerate Unreachable Datasources:** In offline/resource-constrained deployments or when `DATABASE_PROVIDER=sqlite` is misconfigured, `prisma.otpCode.upsert()` throws `Invalid datasource` or connection errors that bubble up as `Failed to send OTP` to the user. Fix: wrap OTP writes/reads in try/catch, detect known Prisma datasource errors, and return a graceful fallback (`ok: false` with a `reason` string) instead of crashing the auth flow. _(Fixed 2026-06-14)_
- **Stale Generated Prisma Client Can Override Current Schema:** Regenerating the source schema is not enough if `node_modules/.prisma/client/schema.prisma` still contains an older datasource provider. A stale SQLite-generated client will keep failing with `provider = "sqlite"` even after `schema.sqlite.prisma` is deleted. Fix: run `npx prisma generate --schema packages/db/prisma/schema.prisma` or `node scripts/prisma-cmd.js generate` and verify `node_modules/.prisma/client/schema.prisma` shows `provider = "postgresql"`. _(Fixed 2026-06-14)_
- **SQLite Prisma Wrapper Must Normalize file: URLs:** When `DATABASE_PROVIDER=sqlite`, `scripts/prisma-cmd.js` must regenerate `schema.sqlite.prisma`, select it, and set `DATABASE_URL=file:<repo>/packages/db/prisma/dev.db` before invoking Prisma. Without this, SQLite validation fails with `URL must start with the protocol file:`. _(Fixed 2026-06-14)_
- **Singleton Prisma Import Path:** Services must import Prisma from `'../util/prisma-singleton'` (or equivalent project-root path), not from relative paths like `'../prisma'` or `'../../prisma'` that resolve to stale or non-existent modules and silently bind to an empty datasource. _(Fixed 2026-06-14)_
- **Vitest Path Resolution in Monorepos:** Running Vitest at the root uses the root configuration, which can cause Next.js path aliases (`@/*`) within app directories to resolve incorrectly. Create an app-specific `vitest.config.ts` to properly map Next.js aliases (`@/hooks`, `@/services`, `@haspataal/types`, etc.) to their respective workspace targets. _(Fixed 2026-06-16)_
- **DPDP Consent Checking Mocking:** When service layers enforce explicit patient consent checks (e.g., `checkConsent`), any appointment creation unit tests must ensure both `patient.findUnique` and `consent.findUnique` are mocked to return valid consent structures to avoid `CONSENT_REQUIRED` runtime crashes. _(Fixed 2026-06-16)_
- **Service Return Wrapper Contracts:** Ensure service layers align with the response schemas expected by the integration and actions layers (e.g., returning wrapper objects like `{ ok: true, value }` / `{ ok: false, code }` rather than raw throw statements for predictable business rule routing). _(Fixed 2026-06-16)_

---





## 📄 Project Documentation Index

The following documents provide detailed specifications for the Haspataal platform:

- [PRD.md](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/PRD.md) — Product Requirements Document.
- [TRD.md](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/TRD.md) — Technical Requirements Document.
- [UIUX_Design_Brief.md](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/UIUX_Design_Brief.md) — Visual design language and component library specs.
- [Backend_Schema.md](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/Backend_Schema.md) — Database schema and relationship mapping.
- [Implementation_Plan.md](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/Implementation_Plan.md) — Roadmap and phased execution strategy.
- [AppFlow.md](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/AppFlow.md) — User journey and navigation mapping.
- [OPENSPEC.md](./docs/OPENSPEC.md) — OpenSpec SDD integration guide (installation, workflow, maintenance).
- [AI Docs Service](services/ai-docs/main.py) — FastAPI microservice: OPD notes, discharge summaries, prescription drafting.
- [Escalation Alert Engine](workers/escalation.worker.ts) — Nightly worker that fires `CHRONIC_ESCALATION_REQUIRED` events when patients miss 2+ consecutive chronic follow-ups. Doctors review via `/hospital/escalations`. *(Implemented 2026-05-20)*


---

## 🤖 Agent Personality

- Be concise.
- Use "we".
- Prioritize event-driven decoupling.
