# 🩺 CLAUDE.md - Project Haspataal

## 🎯 High-Level Mission

Haspataal is a multi-tenant hospital SaaS platform targeting India's tier-2 and tier-3 cities.
Reliability, data privacy (RLS), and sub-30s doctor UX are non-negotiable.

## ⚠️ Session Protocol (MANDATORY)

1. **READ FIRST:** At the start of every session or conversation, **always read this `MEMORY.md` file before doing any work.** No exceptions.
2. **UPDATE AFTER EVERY BUG FIX:** After fixing any bug, immediately add an entry to the **Knowledge Base** section below with the root cause and fix.
3. **NEVER REPEAT MISTAKES:** Before writing code, check the Knowledge Base for known pitfalls. If a past lesson applies, follow it.
4. **Accountability:** If a bug recurs that is already documented in the Knowledge Base, treat it as a critical failure and flag it.
5. **Mobile Validation:** All hospital-facing login and registration actions MUST validate mobile numbers using `MobileSchema` (min 10 digits) before proceeding to database queries.
6. **Auto-Login:** Successful hospital registration MUST automatically create a session and redirect the user to `/hospital/dashboard/setup` to ensure a frictionless onboarding experience.
7. **"commit" Command Workflow:** When the user says "commit", the agent MUST (in order): (a) run `git status` + `git diff --stat` to understand the changeset, (b) **update the Knowledge Base in `MEMORY.md`** with any new lessons from the session (this MUST happen BEFORE staging — no exceptions), (c) stage all changes with `git add -A` (this automatically includes the updated `MEMORY.md`), (d) generate a Conventional Commits message summarising the diff, (e) run `git commit`. MEMORY.md must always be part of the same commit as the code changes — never as a follow-up commit.

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
│   ├── db/                   ← @haspataal/db — Prisma client singleton
│   ├── types/                ← @haspataal/types — Shared domain types & Zod schemas
│   ├── auth/                 ← @haspataal/auth — Shared session/auth logic
│   ├── core/                 ← @haspataal/core — Clean Architecture Domain layer
│   └── config/               ← @haspataal/config — Shared lint/TS/Tailwind
├── services/
│   ├── auth/                 ← Auth microservice (Go/Node)
│   ├── gateway/              ← Express API Gateway
│   └── medchat/              ← AI Service
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
- **2026-07-02**: Turborepo Workspace and Next.js 15 Fixes. Turborepo `workspace:*` dependencies in package.json will break root `npm install` if not matched by proper workspace configurations. Used explicit versions (`*`) to fix. Also, in Next.js 15 API routes, dynamic `params` objects must be awaited (`const { id } = await context.params`) before usage. Prisma $queryRaw filters appending must be done gracefully using `Prisma.sql` array concatenation inside `Prisma.join` to avoid TS issues and syntax errors.
- **2026-07-02**: Prisma Type Access in API Seeders. When writing seeders or direct Prisma queries in Next.js routes, always ensure you are accessing properties that exist on the Prisma model schemas (`DoctorMaster`, `Patient`, `Appointment`). For example, `Patient` has `name` (not `firstName`/`lastName`), `DoctorMaster` uses `fullName`, and `Appointment` uses `slot` (not `time`). Failing to match the Prisma generated types will cause build-time `tsc` failures.
- **2026-07-02**: Search Indexer Refactoring. The search indexer API was updated to omit explicit document `id` passing (previously relying on `medicine-ID` prefixed strings). This broke the Postgres provider which depended on `id` for UPSERTs via `ON CONFLICT (id)`. Resolved by querying `findFirst` equivalent using `$queryRaw` based on `(entity_type, entity_id)` and performing manual `UPDATE` or `INSERT` using `gen_random_uuid()`. Additionally, secured the `hospital_id` insertion against string concatenation risks using proper `Prisma.sql` parameterization.
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
- **Prisma Schema Quote Compliance:** Prisma schemas strictly require double quotes `"` for string values in attributes like `@map()`, `@default()`, and `@relation()`. Using single quotes `'` results in `P1012` validation crashes. Ensure string literals in `schema.prisma` are uniformly wrapped in double quotes. _(Added 2026-06-30)_
- **Chainable Supabase Chaining Mock in Unit Tests:** Mocking Supabase query builders in Vitest can easily throw errors like `TypeError: ...eq is not a function` when chaining multiple operations. To solve this, design a custom `Promise` thenable mockup where all query builder methods (`select`, `insert`, `update`, `eq`, `order`, `is`, `single`) return the `Promise` instance itself, ensuring seamless compatibility with dynamic method chains. _(Added 2026-06-30)_
- **Vitest Alias Scoping in Monorepos:** Using a single global `@/` alias mapped to the monorepo root in Vitest configs will break tests inside nested apps that resolve `@/` to their local root. Create a dedicated workspace-scoped config file (e.g. `tests/vitest.config.ops.ts`) to correctly resolve package paths during test execution. _(Added 2026-06-30)_
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
- **Dependency Pruning (Hardening Pass):** On the `fix/harden-stability` branch, removed dead/duplicate dependencies from root and `hospital-hms` `package.json`: `@dnd-kit/*`, `@hookform/resolvers`, `@tanstack/react-table`, `framer-motion`, `redlock`, `sonner` (root); `bcrypt`/`@types/bcrypt`, `ioredis`, `jsonwebtoken` (hms — superceded by `bcryptjs` and `jose`). Unresolved modules in dead-code paths were cleaned simultaneously. _(Audited 2026-06-21)_
- **Dead Module Removal:** Deleted the root-level `modules/` folder (`billing`, `diagnostics`, `ipd`, `opd`, `pharmacy`) — these were standalone TS files duplicating logic that now lives in `@haspataal/core` and the HMS app. Also removed standalone services (`analytics.service.ts`, `anc-retention-notifier.ts`, `document.service.ts`, `hospital-config.service.ts`, `label.service.ts`, `migration.service.ts`, `prescription.service.ts`, `retention.service.ts`) that were unreferenced after the Turborepo migration. _(Cleaned 2026-06-21)_
- **Duplicate Return Block Bug (BillingForm + ReportActions):** Both `BillingForm.js` and `ReportActions.js` contained a second unreachable `return (...)` block after the component's closing `}` — leftover from a failed refactor merge. These caused ESLint parse errors and would break tree-shaking. Fixed by removing the orphaned blocks. _(Fixed 2026-06-21)_
- **Escalation Routes Moved to Worker:** `apps/patient-portal/app/api/v1/escalations/` API routes were deleted and the logic consolidated into `workers/escalation.worker.js` (JS, not TS) which runs as a standalone Node process. Escalation dispatch is now queue-driven, not request-driven. _(Refactored 2026-06-21)_
- **Gateway tsconfig Added:** `services/gateway/tsconfig.json` added to track the Express gateway TypeScript config explicitly in version control so `tsc -p services/gateway/tsconfig.json` is reproducible across environments. _(Added 2026-06-21)_
- **PyO3 Python 3.14 Compatibility:** When installing python tools/libraries like `headroom-ai` that use `pyo3-ffi` under Python 3.14, you MUST set the environment variable `PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1` during build/install to bypass python version compatibility limitations. _(Fixed 2026-06-22)_
- **Pino Pretty Worker Thread Crash in Next.js:** Using `pino.transport({ target: 'pino-pretty' })` in worker environments (like Next.js 15/Turbopack or custom workers) can lead to runtime crashes due to issues with worker thread instantiation inside pino. If pretty logging causes thread crashes, disable it or use native console transport in development. _(Fixed 2026-06-22)_
- **headroom CLI Pathing & Sandboxing:** When registering tools like `headroom` as an MCP server, ensure its executable is in the user's PATH (e.g., `C:\Users\heman\AppData\Roaming\Python\Python314\Scripts` on Windows). The MCP server communicates via stdio (stdin/stdout), which bypasses sandboxed network connectivity limitations that affect localhost HTTP proxies. _(Configured 2026-06-22)_
- **Next.js 15 'use server' Constraints:** Exporting Zod schemas (non-async values) alongside server actions in `"use server"` files triggers compile-time errors. Fixed by hoisting Zod schemas into a standalone `validations/` folder. _(Fixed 2026-06-23)_
- **ESLint Plugin References in Flat Config:** When overriding plugins in ESLint Flat Config, setting a plugin to `null` (e.g. `'@typescript-eslint': null`) triggers a configuration schema error. Omit it entirely from `plugins` object or map to an actual plugin object. _(Fixed 2026-06-23)_
- **TypeScript and ESLint Ignore Alignments:** When `tsconfig.json` excludes test directories (e.g. `"exclude": ["**/__tests__/**/*"]`), ESLint will fail to parse these files if they are not also ignored in `eslint.config.mjs` (due to `parserOptions.project` referencing `tsconfig.json`). Ensure test folders are explicitly ignored in ESLint configs. _(Fixed 2026-06-23)_
- **Conventional Commits Scope Validation:** Workspace commitlint rules enforce a specific set of allowed scopes: `[patient, hospital, admin, lab, agent, doctor, auth, gateway, db, infra, deps, ci, security]`. Non-compliant scopes (e.g. `settings`) will trigger pre-commit failures. _(Fixed 2026-06-23)_
- **JS to DB Weekday Offsets:** When mapping JavaScript's `Date.getDay()` (0-Sunday to 6-Saturday) onto custom schema weekly day values (e.g. Mon-Sun mapped to 1-7), always translate Sunday explicitly (0 to 7) to ensure exact schedule template matches during batch slot generation. _(Fixed 2026-06-23)_

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

- **commitlint Scope Enum:** The project enforces a strict `scope-enum` list: `[patient, hospital, admin, lab, agent, doctor, auth, gateway, db, infra, deps, ci, security]`. Multi-domain scopes like `billing,staff` are rejected by the commit-msg hook. When a commit touches multiple HMS sub-domains (billing, staff, OPD, etc.), use `hospital` as the single scope. Use `db` when the primary change is a Prisma schema update. _(Fixed 2026-06-24)_
- **OPD Triage Page Complexity:** The triage page (`hospital/dashboard/opd/triage/page.tsx`) is a high-density clinical screen. When extending it, keep patient vitals, queue status, and handoff controls in clearly separated sections to avoid cognitive overload for clinical staff. All state mutations (triage decisions, handoffs) must emit an event to `EventLog` before updating the UI optimistically. _(Implemented 2026-06-24)_
- **OPD Handoff API Pattern:** Handoff routes live under `api/hospital/opd/handoffs/`. They must validate the receiving department exists, is active, and has available bed capacity before persisting a handoff record. Return `409` if target department is at capacity to prevent silent over-admissions. _(Implemented 2026-06-24)_
- **Patient API Namespace:** All patient-facing data APIs live under `app/api/patient/`. Never expose hospital-internal fields (costPrice, margin, staffNotes) through this namespace. _(Implemented 2026-06-24)_
- **Payment Webhook Idempotency:** The payment webhook handler at `api/webhooks/payment/` must process events idempotently using the payment provider's `event_id` as a unique key (`ON CONFLICT DO NOTHING`). Without this, retried webhook deliveries (Razorpay/Stripe guarantee at-least-once) cause duplicate bill-paid records and inflated revenue dashboards. _(Implemented 2026-06-24)_
- **Slot Cleanup Worker:** `workers/slot-cleanup.worker.ts` reclaims expired appointment slots (status=PENDING older than TTL). It must run inside an RLS-scoped transaction (`SET LOCAL app.hospital_id`) per hospital batch to preserve tenant isolation. Use `FOR UPDATE SKIP LOCKED` to avoid contention with the booking flow. _(Implemented 2026-06-24)_
- **Setup Stage API — contactNumber Propagation:** `GET /api/hospital/setup/stage` had multiple early-return branches (stages 1, 4, 5, 7) that omitted `contactNumber` from the JSON response. The `DiscoveryWizard` component checks `if (!contactNumber)` before sending OTP, producing the "Contact number is not registered or missing" error. Fix: always include `contactNumber: hospital.contactNumber ?? ''` in every branch. Similarly, `dashboard/setup/page.tsx` was invoking `<DiscoveryWizard>` without passing `hospitalId` or `contactNumber` props — both must be threaded from the stage API response. _(Fixed 2026-06-24)_
- **Doctor Profile Page Simplification:** The `doctor/[id]/page.js` was over-engineered with redundant state and render complexity. When refactoring patient-facing doctor profile pages, keep a single `useEffect` data-fetch, derive UI state (availability, slots) inline rather than in separate state variables, and remove dead JSX branches eagerly. _(Refactored 2026-06-24)_
- **commitlint subject-case:** Commit subjects must be fully lowercase. Acronyms like `OPD`, `API`, `OTP` in the subject line trigger the `subject-case` rule and fail the commit-msg hook. Write subjects as `fix(hospital): otp contact number propagation in setup stage api`. Body lines are unrestricted. _(Fixed 2026-06-24)_
- **Diagnostics Document Upload (NEW):** Added `DiagnosticDocumentManager.tsx` component, `api/hospital/diagnostics/documents/` REST endpoints, `api/hospital/diagnostics/orders/[orderId]/` result management routes, and a `diagnostics/orders/` dashboard page. The Prisma schema was extended with `DiagnosticDocument` and `DiagnosticOrderResult` models. New packages were added to `package.json` for file handling. Always add new diagnostic sub-features under the `diagnostics/` namespace and link documents to their parent `DiagnosticOrder` via `orderId`. _(Implemented 2026-06-24)_
- **Prisma Schema Extension Protocol:** When adding new models (e.g., `DiagnosticDocument`), run `npx prisma generate` after schema changes and verify `postinstall` in `package.json` is present so clean installs build the updated client automatically. Commit `schema.prisma` and `package-lock.json` together — split commits between schema and lockfile cause deployment drift. _(Implemented 2026-06-24)_
- **Prisma Version Hoisting Bug:** Adding packages that transitively depend on `@prisma/client@latest` (e.g., `@prisma/instrumentation`) causes npm to hoist Prisma 7 to the root, silently overwriting the v5 client the codebase needs. Prisma 7 renamed `runtime/library.js` → `runtime/client.js` and broke `datasource url = env(...)` in schema files, so the `postinstall` generate fails and the app crashes with `Cannot find module '.../runtime/library.js'`. Fix: pin `@prisma/client` and `prisma` to `5.10.2` in root `package.json`, delete the auto-generated `prisma.config.ts` (Prisma 7 artifact), and re-run `npm install`. _(Fixed 2026-06-25)_
- **Next.js Dynamic Slug Conflict:** Next.js App Router requires all sibling dynamic segments at the same path level to use the same `[param]` name. Adding a new `[orderId]/` folder alongside an existing `[id]/` folder under the same parent causes a hard startup error: `You cannot use different slug names for the same dynamic path`. Merge all routes under the established param name (`[id]`), rename param references inside the handlers, then delete the conflicting folder using `-LiteralPath` in PowerShell (brackets `[` `]` are regex metacharacters and `Remove-Item` silently no-ops without it). _(Fixed 2026-06-25)_
- **Next.js Duplicate Page Conflict:** Next.js development server fails/warns if duplicate files resolve to the same route (e.g., `page.js` and `page.tsx`). Always delete the obsolete `.js` stub to ensure clean compilation and avoid hydration mismatch or routing conflicts. _(Fixed 2026-06-25)_
- **Next.js Worker Thread Crash & OTel/Prisma Externals:** Using `@prisma/instrumentation` (via `@sentry/node`) in Next.js projects can trigger a `Critical dependency` warning or worker thread crashes due to dynamic `require()` statements in `@opentelemetry/instrumentation`. Resolve by adding both packages to Webpack `externals` in `next.config.mjs` for server-side bundles. _(Fixed 2026-06-25)_
- **Stale Next.js Cache Worker Resolution:** During package version alignment or bundler config changes, Next.js can crash with a `Cannot find module` error in `vendor-chunks/lib/worker.js`. Resolve by deleting the `.next/` cache directory and restarting the development server to force a clean build. _(Fixed 2026-06-25)_
- **README Merge Conflict Resolution & Profile Creation:** Cleaned up git conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) in `README.md` from stashed/upstream changes, and introduced `profile-readme.md` as a personalized developer profile to ensure clean documentation and workspace continuity. _(Resolved 2026-06-28)_
- **Phase 1 Foundation Database & Type Schema:** Added database tables and TS interfaces for Doctor Identity (education, certifications, experience, verification), Patient Clinical Data (timeline, complaints, diagnosis, history, treatment, etc.), and Doctor Discovery. The `@haspataal/types` package serves as the shared type contract across the workspace. _(Implemented 2026-06-29)_
- **Public Patient Registration API Routing:** Public registration from the Patient Portal on the `/api/patients` route uses the `body.action === 'register'` conditional path to bypass staff role checks. It enforces strict Indian mobile validation (`/^[6-9]\d{9}$/`) and populates `patient`, `consent`, and `auditLog` tables. _(Implemented 2026-06-29)_
- **Shared Packages & Middleware Exports:** Created new shared packages `@haspataal/events` (Redis Stream event bus), `@haspataal/scheduler` (BullMQ cron engine), and `@haspataal/files` (secure storage). When adding helper modules like `authorization.ts` and `rate-limit.ts` to `@haspataal/auth`, ensure they are explicitly exported in the package's `index.ts`. _(Implemented 2026-06-29)_
- **Doctor Discovery Engine Isolation & Indexing:** Implemented a denormalized search index (`DoctorSearchIndex`) and a public profile model (`DoctorPublicProfile`) to isolate patient-facing doctor discovery. The Patient Portal queries these discovery tables exclusively to prevent direct reads on hospital-private schemas. _(Implemented 2026-06-29)_
- **Real-Time Availability Computation:** Implemented availability logic to compute doctor availability on-demand by combining weekly schedules, approved leaves, active holidays, and existing appointments. Results are cached in Redis (5-minute TTL) and persisted in `DoctorAvailability` to speed up checkout. _(Implemented 2026-06-29)_
- **Background Search Index Sync:** Integrated a background BullMQ queue (`search-index-refresh.js`) to asynchronously update search indices and public profiles when doctor master data, verification status, or hospital affiliations change. _(Implemented 2026-06-29)_
- **Named Relation Opposites in Prisma:** When defining named relation fields on a model (like `LabSample` having `collectedBy` and `verifiedBy` referencing `DoctorMaster` with distinct `@relation` names), Prisma requires corresponding opposite relation fields (e.g. `samplesCollected` and `samplesVerified` respectively) to be explicitly declared on the referenced model (`DoctorMaster`). If omitted, `prisma format` will auto-generate duplicate back-relation fields named after the model itself (i.e. `LabSample LabSample[]`), leading to compilation/validation errors. _(Fixed 2026-06-30)_
- **Workspace Package Dependencies:** When importing modules from workspace packages (like `@haspataal/events`) in an application, make sure the package is listed under the `dependencies` key in the application's `package.json` (e.g. `"@haspataal/events": "*"`). Omission will prevent Turborepo from finding the package and lead to webpack/module resolution failures. _(Fixed 2026-06-30)_
- **Nested Relative Import Paths:** In nested subdirectories (like `apps/hospital-hms/lib/services/`), be careful with relative import paths for local directory singletons. Importing from `../lib/prisma` from a folder that is already a sibling of `lib` elements will resolve incorrectly (resolving to `lib/lib/prisma`). Use correct parent traversal like `../prisma` and `../redis` to target files in the immediate parent directory. _(Fixed 2026-06-30)_
- **Clinical Timeline Engine Immutability & Versioning:** Clinical Timeline Engine events are immutable. To correct or void an event, write a new event with status `AMENDED` or `VOIDED` that references the original `amendedEventId`, keeping a ledger of previous states in `TimelineVersion`. _(Implemented 2026-06-30)_
- **Postgres FTS updates with Prisma**: Ingested events are searchable under 500ms using PostgreSQL `tsvector` with a GIN index. Since Prisma client lacks native tsvector generation during create, execute raw SQL `UPDATE` statements immediately after creation to compute the vector of title, subtitle, summary, and tags. _(Implemented 2026-06-30)_
- **Secure File Exports with Supabase Storage**: Patient data exports (PDF, JSON, FHIR R4 Bundle) are processed asynchronously via BullMQ and uploaded to Supabase Storage. File access is protected using 24-hour signed URLs to comply with DPDP and healthcare privacy regulations. _(Implemented 2026-06-30)_
- **Zod v4 Union JIT Compilation Bug in Vitest:** Zod v4 (pre-release) compiles schema validators dynamically at runtime using `eval` or `new Function` inside `zod/v4/core/doc.js`. When parsing union types like `z.string().datetime().or(z.date())` or `z.record(z.unknown())` under Vitest, this JIT compilation fails with `Cannot read properties of undefined (reading '_zod')` due to context/scope binding issues. Fix: avoid complex unions/records by using `z.custom` or `z.any` for dynamic fields, ensuring stable cross-version parsing in test runners. _(Fixed 2026-06-30)_
- **Hospital Operations Pharmacy return wrapper contract**: Preserving return types like `{ dispensedItems, totalAmount }` instead of only returning array values prevents breaking consumer layers (e.g. actions/billing integration layers) and test suite failures. _(Fixed 2026-06-30)_

- **tsvector / GIN Indexes in Prisma Monorepos:** Prisma cannot emit `GENERATED ALWAYS AS STORED` columns or `CREATE INDEX CONCURRENTLY` in its migration DSL. Map the column as `String? @map("search_vector")` in `schema.prisma` so the ORM can read it, then apply the actual `ALTER TABLE` and GIN index via a standalone SQL file in `packages/db/prisma/migrations/` executed manually through the Supabase SQL Editor. `CREATE INDEX CONCURRENTLY` cannot run inside a transaction block — split `ALTER TABLE` and each `CREATE INDEX` into separate SQL Editor runs if needed. Always document the manual step in `DEPLOYMENT.md`. _(Added 2026-07-01)_

- **Clinical Rules Engine (`@haspataal/rules`):** A configurable workflow automation package that acts as the "Clinical Brain" — eliminating hardcoded business logic. Located at `packages/rules/src/`. Exports: `RuleRegistry` (Prisma-backed CRUD + event lookup), `RuleCompiler` (stateless condition evaluator), `ExecutionEngine` (action dispatcher + `RuleExecution` logger). Workers in `workers/rules-worker.ts` run two BullMQ queues: `rules-execution` (concurrency 5, event-triggered) and `rules-scheduler` (concurrency 3, cron-triggered). API at `apps/hospital-hms/app/api/rules/route.ts` — admin-only (`POST /api/rules`, `GET /api/rules`). _(Implemented 2026-07-01)_

- **Rules Engine — Condition Operators:** `RuleCompiler.evaluateCondition()` supports: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `not_in`, `contains`, `between`. Fields are resolved from `RuleContext` via dot-notation (e.g. `age.months` → `context.event.age.months`). All conditions in `conditionJson` must pass (`AND` logic — `Array.every`). _(Implemented 2026-07-01)_

- **Rules Engine — Action Types:** `ExecutionEngine.executeAction()` dispatches to 6 handlers: `create_timeline` (writes `TimelineEvent`), `send_notification` (queues to `notificationQueue`), `update_record` (dynamic Prisma model update — **see safety risk below**), `call_api` (external HTTP fetch), `assign_task` (creates `Task` record), `escalate` (creates `Escalation` + a HIGH `TimelineEvent`). All results logged to `RuleExecution` with `executionTimeMs`. _(Implemented 2026-07-01)_

- **Rules Engine — Task Status (2026-07-01):** Schema models (`Rule`, `RuleExecution`, `RuleSchedule`) ✅. `RuleRegistry` ✅. `RuleCompiler` ✅. `ExecutionEngine` ✅. BullMQ workers ✅. **Pending (❌):** `RuleValidator` (task 2.3), notification/follow-up/booking action handlers (tasks 3.1–3.4), execute/simulate API routes (task 5.3), Admin UI rule builder (tasks 6.1–6.3). Do not assume the engine is production-complete.

- **Rules Engine — RLS:** Apply `003_rules_rls.sql` manually in Supabase SQL Editor. Policy: `hospital_id IS NULL OR hospital_id = current_setting('request.hospital_id')::uuid`. Global rules have `hospitalId = null` and are visible to all tenants. Hospital-scoped rules are strictly tenant-isolated. Never bypass via raw SQL without setting the RLS context variable first. _(Implemented 2026-07-01)_

- **Rules Engine — `update_record` Safety Risk:** The `update_record` action resolves the Prisma model via `this.prisma[payload.table]` — a dynamic accessor from JSON. Before enabling in production, validate `table` against a strict allowlist (e.g. `['patient', 'appointment', 'followUp']`) to prevent unauthorized record mutation via a crafted rule payload. _(Risk identified 2026-07-01)_

- **Unified Notification Engine (`@haspataal/notify`):** Multi-channel notification package at `packages/notify/src/`. Channels: `SMS`, `WHATSAPP`, `EMAIL`, `PUSH`, `IN_APP`. Priority tiers: `EMERGENCY` → `CRITICAL` → `HIGH` → `NORMAL` → `LOW` → `BACKGROUND`. `NotificationEngine.enqueue()` routes to a priority-keyed BullMQ queue via `NotificationRouter`. Retry attempts by priority: EMERGENCY=10, CRITICAL=5, HIGH/NORMAL=3, LOW/BACKGROUND=1. Backoff is exponential (1s for EMERGENCY, 5s otherwise). `workers/notification-worker.ts` runs per-channel workers (concurrency 10 each) with `ProviderFailover` wrapping each adapter. _(Implemented 2026-07-01)_

- **Notify — Adapters:** `TwilioSMSAdapter` (env: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`), `MetaWhatsAppAdapter` (env: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`), `ResendEmailAdapter` (env: `RESEND_API_KEY`), `PushNotificationAdapter`, `InAppNotificationAdapter`. All implement the `ChannelAdapter` interface (`deliver(notification): Promise<ProviderResponse>`). Wrap every adapter in `ProviderFailover` in the worker for automatic retry on provider failure. _(Implemented 2026-07-01)_

- **Notify — Curfew (10 PM–8 AM IST):** Non-critical notifications (NORMAL, LOW, BACKGROUND) MUST NOT be dispatched between 22:00 and 08:00 IST. Apply IST half-hour offset (+30 min) when computing boundaries from UTC — see existing MEMORY.md lesson on `IST Half-Hour Offset`. EMERGENCY and CRITICAL bypass the curfew entirely. _(Reminder 2026-07-01)_

- **Notify — RLS Migration:** Apply `db/migrations/004_notification_rls.sql` manually via Supabase SQL Editor after schema deploy. The notification tables (`notifications`, `notification_deliveries`, `notification_templates`) require explicit RLS scoped by `hospital_id`. _(Implemented 2026-07-01)_

- **Windows Prisma DLL Lock during Generation:** Running processes that load the Prisma client (e.g. background workers or Next.js dev servers) lock the query engine DLL (`query_engine-windows.dll.node`) on Windows. This causes `prisma generate` or `prisma db push` to fail with `EPERM: operation not permitted, unlink`. To resolve, terminate any running Node processes using the Prisma client before regenerating. _(Added 2026-07-01)_

- **tsx/esbuild JSON Reserved Word Bug:** `tsx`/`esbuild` attempts to export all keys from imported `.json` files as named exports. If a JSON file contains keys that are JS reserved keywords (such as `function` in `ioredis`'s commands JSON), this results in a `SyntaxError: Unexpected token 'function'`. Workaround: Run scripts that import these modules via `ts-node` with standard compiler options rather than `tsx`. _(Added 2026-07-01)_

- **Prisma Relations in Care Journeys:** Explicitly declare Prisma `@relation` fields on both sides of care journey entities (`JourneyInstance`, `JourneyMilestone`, `JourneyTask`, `JourneyRisk`, `JourneyTemplate`) in `schema.prisma` to allow `include` queries without throwing compilation errors. _(Added 2026-07-01)_

- **Prisma JSON Bounds in Workers:** When passing object properties to Prisma's `InputJsonValue` fields (like `metadata` or `fhirMapping`), `Record<string, unknown>` is rejected due to index signature incompatibilities. Explicitly cast these objects `as any` to satisfy Prisma's strict JSON type bounds when mapping dynamic event payloads. _(Added 2026-07-02)_

- **Notification Schema Adherence:** `Notification` records in Prisma do not have a `payload` column; they use `variables` and `metadata` (both JSON). Worker updates and ExecutionEngine payloads must target `metadata` rather than injecting undocumented fields, to satisfy Prisma schema constraints. _(Added 2026-07-02)_

---


## 🤖 Agent Personality

- Be concise.
- Use "we".
- Prioritize event-driven decoupling.


