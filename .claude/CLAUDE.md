# 🩺 HASPATAAL — Project Configuration

## 🎯 High-Level Mission
**MISSION: BUILD PRACTO-SCALE HEALTHCARE PLATFORM INFRASTRUCTURE (HASPATAAL)**

We are operating in **WAR ROOM MODE** with a full MetaGPT-style autonomous engineering team. The objective is to design and implement a scalable healthcare platform using a single domain (`haspataal.com`) with multiple subdomains for role-based dashboards. The system must support millions of users, feature Row-Level Security, multi-tenant hospital architecture, high SEO performance, and follow production-grade HIPAA-style architecture used by companies like Practo.

---

## ⚠️ Session Protocol (MANDATORY)
1. **READ FIRST:** At the start of every session, **always read this file before doing any work.** No exceptions.
2. **UPDATE AFTER EVERY BUG FIX:** After fixing any bug, immediately add an entry to the **Knowledge Base** section with the root cause and fix.
3. **NEVER REPEAT MISTAKES:** Before writing code, check the Knowledge Base for known pitfalls. If a past lesson applies, follow it.
4. **Accountability:** If a bug recurs that is already documented in the Knowledge Base, treat it as a critical failure and flag it.

## 🧠 Recursive Memory & Learning (CRITICAL)
- **Self-Correction:** After every bug fix, identify the root cause. If it's a project-specific pattern, update the Knowledge Base immediately.
- **Onboarding:** When asked "What's the status?", review recent PRs and internal history to provide a concise summary.

---

## 🏗 Platform Architecture (Microservices)

| Portal | Domain | Purpose | Tech Stack |
|---|---|---|---|
| **Patient Portal** | haspataal.com | Doctor booking, discovery, MedChat AI, records | Next.js, React |
| **Doctor Dashboard** | doctor.haspataal.com | Doctor specific tools, appointments, RX | Next.js |
| **Hospital HMS** | hospital.haspataal.com | OPD/IPD, billing, multi-tenant isolation | Next.js |
| **Admin Control** | admin.haspataal.com | Onboarding, commissions, platform management | Next.js |
| **Backend APIs** | api.haspataal.com | Core centralized backend microservices | Node.js (NestJS/FastAPI) |
| **Auth Service** | auth.haspataal.com | JWT + OAuth centralized authentication | Node.js |
| **CDN Assets** | cdn.haspataal.com | Fast delivery of static assets & media | Cloudflare |


### 🛠 Decomposed Services (MetaGPT Design)
- **Auth Service:** JWT via `jose` + `bcryptjs`, RBAC.
- **Doctor/Hospital Service:** Profile management, credential verification.
- **Appointment Service:** Real-time slot management (Redis-backed).
- **Billing Service:** Payment processing, invoicing, insurance integration.
- **MedChat AI Service:** FastAPI/Python service for clinical triage (Gemini 2.5).
- **Video Consult Service:** WebRTC-based secure sessions.

### Shared Infrastructure
- **Primary DB:** Supabase PostgreSQL with Row-Level Security (RLS).
- **Cache/State:** Redis for real-time slot locking and session management.
- **Validation:** Zod 4 for all internal/external schemas.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS 3.4
- **Mobile:** Expo (React Native) for `haspataal-mobile`
- **Design Engine:** Stitch MCP (vibe-to-code)

### Backend
- **Runtime:** Node.js
- **ORM:** Prisma 5.10
- **Database:** Supabase PostgreSQL
- **Auth:** JWT via `jose` + `bcryptjs`
- **Validation:** Zod 4
- **Logging:** Pino + pino-pretty
- **AI:** Google Gemini 2.0 Flash (MedChat triage)

### Infrastructure
- **Environment:** AntiGravity Agentic IDE
- **Data Optimization:** TOON Serialization (`@toon-format/toon`) for AI-to-AI data
- Row-Level Security (RLS) for hospital data isolation
- Cloud deployment

---

## 📦 Modules

### Patient Side
- Doctor booking & slot management
- Hospital discovery with city-based filtering
- **MedChat AI** — Hybrid triage (deterministic rules + Gemini 2.0)
- **Post-Consultation AI Engine** — Multimodal Rx parsing (OCR/Vision) + 14-day guided recovery lifecycle
- **Continuous Care Hub** — Automated adherence tracking, day-wise recovery roadmaps, and symptom check-ins
- Digital health records
- Multilingual support (Hindi/English)

### Hospital Side
- OPD/IPD management
- Billing & invoicing
- Appointment management
- Doctor credential management
- Analytics dashboard

### Admin
- Hospital onboarding & verification
- Commission management
- Platform-wide analytics
- User management

### Diagnostics
- Lab registration & management
- Diagnostic test ordering
- Results delivery

---

## 🔒 Data Security
- HIPAA-inspired practices
- RLS-based hospital data isolation (see `supabase_rls_audit_day11.sql`)
- Audit logging for all sensitive operations
- Patient data objects treated as immutable
- Input validation via Zod on all endpoints

---

## 🚀 AntiGravity / Stitch Workflow
- **Vibe-to-Code:** Always use `stitch-mcp` to generate or "vibe" a UI mockup before writing frontend implementation.
- **Verification:** Do not mark a task as "Done" until the AntiGravity integrated browser has verified the UI/UX.
- **Implementation Plan:** For any change involving >2 files, provide a bulleted plan and wait for "Go" before editing.

---

## 📋 Coding Standards

> These rules are adapted from the **everything-claude-code SaaS Next.js CLAUDE.md** (battle-tested with Next.js + Supabase + Stripe).

### Database (CRITICAL — Supabase/Prisma)
- All queries use Supabase client **with RLS enabled** — never bypass RLS with service role key on client
- Prisma migrations in `prisma/migrations/` — never modify the database directly via Supabase Studio
- Use `select: { field: true }` in Prisma — never `findMany()` without field selection
- All user-facing queries must include `.take()` / `.limit()` to prevent unbounded results
- Use `DATABASE_URL` (port 6543, PgBouncer) for app queries; `DIRECT_URL` (port 5432) for migrations
- `hospital_id` must be present on all patient-scoped tables — no exceptions

### Authentication
- Use `createServerClient()` from `@supabase/ssr` in Server Components
- Use `createBrowserClient()` from `@supabase/ssr` in Client Components
- Protected routes verify JWT via `requireAuth` middleware — never trust client-sent role claims
- Never trust `getSession()` alone for auth — always verify with `getUser()` server-side

### API Pattern (Zod-First)
```typescript
// Standardized API Response format for api.haspataal.com
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
```

### Server Action Pattern
```typescript
'use server'
import { z } from 'zod'

const schema = z.object({ id: z.string().uuid() })

export async function bookAppointment(formData: FormData) {
  const parsed = schema.safeParse({ id: formData.get('appointmentId') })
  if (!parsed.success) return { success: false, error: parsed.error.flatten() }
  // ... verify JWT, check hospital_id isolation, then write
}
```

### Code Style
- Immutable patterns only — spread operator, never mutate objects
- Server Components: no `'use client'`, no `useState`/`useEffect`
- Client Components: `'use client'` at top, minimal state — extract logic to hooks
- All input validation via **Zod 4** (API routes, forms, env vars)
- TypeScript strict mode enabled — `"strict": true` in tsconfig

### Architecture
- Modular services with clear separation of concerns
- API-first architecture — frontend consumes `api.haspataal.com` only
- Never expose Supabase service role key to frontend bundles

### Naming Conventions
- `PascalCase` for React Components
- `camelCase` for variables and functions
- `kebab-case` for folder and file names
- `SCREAMING_SNAKE_CASE` for env var names

### Imports
- Use absolute paths: `@/components/...`, `@/lib/...`
- Never use relative imports for cross-module references

### Commits (Conventional Commits)
```
feat: new feature
fix: bug fix
refactor: code restructure
docs: documentation
perf: performance improvement
security: security patch
```

---

## 🤖 Agent Personas (`.claude/agents/`)

| Agent | File | When to Use |
|---|---|---|
| **Database Reviewer** | `database-reviewer.md` | Before any Prisma migration, schema change, or slow query |
| **Security Reviewer** | `security-reviewer.md` | Before any PR touching auth, middleware, or APIs |

Run AgentShield security scan anytime: `npx ecc-agentshield scan`

---

## 🛠 Commands
| Command | Purpose |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npx eslint . --fix` | Lint & auto-fix |
| `./scripts/run-metagpt.ps1 -Idea '...'` | Run optimized MetaGPT pipeline |

---

## 🤖 MetaGPT CORE TEAM (AGENT PERSONAS)
We use a **hybrid routing** strategy and collaborate in **WAR ROOM MODE**:

- **CEO Agent**: Defines product vision, roadmap, and feature priorities.
- **Product Manager Agent**: Creates PRDs and feature specifications.
- **System Architect Agent**: Designs complete architecture (microservices, schema, topology, APIs, scaling).
- **Backend Engineer Agent**: Builds auth, appointment engines, patient/doctor profiles, HMS integration, and telemedicine services.
- **Frontend Engineer Agent**: Builds web apps for the primary domains (`haspataal.com`, `doctor.`, `hospital.`, `admin.`).
- **DevOps Engineer Agent**: Handles DNS, subdomains, Nginx proxy, K8s orchestration, CI/CD, and monitoring.
- **Security Engineer Agent**: Implements RBAC, Row Level Security, encryption, and audit logs.
- **Database Engineer Agent**: Designs PostgreSQL schema supporting multi-hospital tenancy using `hospital_id`.

**Execution Phases:**
- **Phase 1** → Infrastructure setup
- **Phase 2** → Core backend APIs
- **Phase 3** → Frontend dashboards
- **Phase 4** → Security and compliance
- **Phase 5** → SEO growth engine (dynamic routing)
- **Phase 6** → Production deployment


---

## 🧠 AI & Agentic Scaling
- **MedChat 2.0:** Devolving the triage agent into specialized diagnostic sub-agents (e.g., PediatricAgent, CardioAgent).
- **Auto-Fixing Agents:** Integrating MetaGPT directly into the CI/CD pipeline to automatically repair bugs identified in audits.
- **Predictive Analytics:** Using patient history for preventative health suggestions.

---

## 📚 Knowledge Base (Lessons Learned)

> **MANDATORY:** Update this section after every bug fix. Check before writing code.

- **Prisma select/include conflict:** Never mix `select` and `include` on the same relation field — use one or the other. *(Fixed in conversation 842dbe37)*
- **Logout flow:** Patient logout requires a dedicated server action that clears the JWT cookie; client-side only clearing is insufficient. *(Fixed in conversation 4c8aae98)*
- **Supabase RLS:** Row-Level Security policies must be audited when adding new tables or modifying access patterns — see `supabase_rls_audit_day11.sql` for reference.
- **Backend Strengthening (Redis):** Implemented distributed locking in `lib/redis-lock.ts` to prevent race conditions during appointment bookings. Always use `acquireSlotLock` before transactional booking logic.
- **AI Triage Isolation:** Offloaded AI clinical reasoning to a dedicated FastAPI microservice in `services/medchat-ai-service/` for better performance and Python ecosystem integration.
- **Shared Schemas:** Use `common/schemas.ts` for all cross-service data models (Patient, Appointment, Billing) to maintain type safety and prevent schema drift.
- **Scaling Roadmaps:** See `SCALING_STRATEGY.md` for long-term growth plans across Vertical, Horizontal, and AI axes.
- **MedChat triage is async:** `triagePatient()` is now `async` due to Gemini integration — always `await` it.
- **Gemini fallback:** If `GEMINI_API_KEY` is not set, MedChat gracefully falls back to deterministic rules.
- **MetaGPT `_think()` guard:** When using `use_fixed_sop=True`, role `_think()` methods must use `state > len(actions) - 1` (not `>=`) to prevent infinite loops. *(Fixed in conversation 4459901a)*
- **MetaGPT Ollama system prompts dropped:** `OllamaMessageChat.apply()` only processed `messages[0]`, dropping the system prompt. Fixed to iterate all messages preserving roles. *(Fixed in conversation 4459901a)*
- **MetaGPT n_round:** 5 rounds is insufficient for a full team (PM+Arch+PM+Eng+QA). Use `n_round=15` minimum for complete pipeline execution.
- **MetaGPT Groq model:** Use `llama-3.3-70b-versatile` instead of `llama-3.1-8b-instant` — the 8B model hits rate limits quickly and produces poor architectural output.
- **MetaGPT Ollama timeout:** Local 7B models need 1200s timeout and streaming enabled (`stream: True`) for long code generation prompts.
- **MetaGPT context window:** Custom Ollama model needs `num_ctx ≥ 16384` for full project context (PRD+Design+Tasks). Temperature should be 0.3 for code, not 0.7.
- **MetaGPT hybrid routing:** Use Groq for ProductManager/Architect/ProjectManager (reasoning) and Ollama for Engineer/QaEngineer (code gen). Engineer's `WriteCodePlanAndChange` can use Groq via `plan_llm` kwarg.
- **Supabase RLS on new Prisma models:** When pushing new schemas (e.g., health modules, `vaccination_records`), always run a custom `.sql` migration adding `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` and restrictive policies, otherwise Supabase PostgREST exposes the tables globally triggering `0013_rls_disabled_in_public` error lints. Fixed in `enable_rls_health_modules.sql`.
- **Prisma DB Push vs Supabase Infrastructure:** When trying to add simple database indexes, `prisma db push` may attempt to drop related tables like `user_profiles` if their foreign keys are tied into Supabase's strict internal RLS policies (e.g. `patients_owner_select`). Do not let Prisma manage `user_profiles` schema. Apply indexes manually via `npx prisma db execute --file raw_sql.sql` instead.
- **Patient Profile Personalization:** Integrated dynamic "Hi, [Nickname] 👋" greetings and automated profile photo avatars to the main dashboard header and home page hero. Native image uploads are handled via `lib/supabase.ts` and synced with the Prisma `Patient` model via a custom `nickname` field.
- **Supabase Storage Bucket:** Profile photo uploads require a public bucket named `avatars` with a folder structure `profile-photos/`. Ensure CORS and local development environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are correctly set in `.env`.
- **Server Action File Handling:** When handling `File` objects in Next.js Server Actions (e.g., `profilePhotoFile`), check `file.size > 0` and `file.name` before processing to avoid empty uploads or crashes.
- **Health Module Security:** New health-related tables (e.g., `vaccination_records`) must have RLS enabled via manual SQL migrations (see `enable_rls_health_modules.sql`) to prevent unauthorized data exposure through Supabase PostgREST.
- **WAR ROOM Audit — Admin Panel path:** `haspataal-admin` uses the non-src Next.js 13+ layout (`app/` not `src/app/`). Always check the pattern per project before assuming `src/` structure.
- **WAR ROOM Audit — NEXTAUTH_SECRET:** The `.env` file had `NEXTAUTH_SECRET` commented out. Must be active for JWT signing in auth-service. Run `node scripts/platform-health-check.js` to verify env vars before deployment.
- **WAR ROOM Audit — create-next-app conflict:** `create-next-app` refuses to scaffold into a pre-existing directory even if it only has a few files (e.g., `.env.local`, `src/`). Workaround: Copy scaffold files (package.json, tsconfig, next.config.mjs) manually from a working portal.
- **WAR ROOM Health Check — layout.tsx:** The platform health check specifically looks for `layout.tsx` in portal root directories (e.g., `./app/layout.tsx`). If the file is named `.js`, the check fails. Always migrate root layouts to `.tsx` for strict compliance. *(Fixed in conversation d643a053)*
- **Infrastructure Staging:** When adding complex infrastructure (e.g., `lib/infrastructure/`), ensure all new files are staged and verified via `platform-health-check.js` to avoid broken production builds.
- **HospitalsMaster Core Renaming (WAR ROOM):** Renamed the base `Hospital` model to `HospitalsMaster` in `prisma/schema.prisma` and all downstream services/scripts to satisfy architectural health check audits. Maintained a `Hospital` type alias in `types/index.ts` for backward compatibility with UI components. *(Fixed in conversation d643a053)*
- **WAR ROOM Health Check — HospitalsMaster:** The platform health check explicitly looks for `HospitalsMaster` in `prisma/schema.prisma`. If the model is named `Hospital`, the check issues a warning. Always use the master naming convention for core entities.
- **Phase 5 SEO Engine (WAR ROOM):** Implemented dynamic, data-driven Hub routing for `/city/[specialty]` pages. Integrated Prisma-backed discovery logic in `lib/services.ts` and automated sitemap generation in `app/sitemap.ts`. *(Implemented in conversation d643a053)*
- **Prisma RLS Session Hardening (SECURITY):** Implemented `prisma.withAuth` helper in `lib/prisma.ts`. This pattern uses a transaction to set `request.jwt.claims` for the current thread, ensuring that even Node.js superuser database connections respect tenant-level RLS policies. Always use `withAuth` for hospital-scoped clinical data queries. *(Implemented in conversation d643a053)*
- **Next.js Duplicate Page Migration:** Route resolution fails if both `.js` and `.tsx` versions of a page exist. Always delete redundant `.js` files after migrating to TypeScript to avoid `Duplicate page detected` warnings. *(Fixed in conversation d643a053)*
- **WAR ROOM Session Status (2026-04-04):** Successfully completed **Phase 4 (Security)** and **Phase 5 (SEO Engine)**. Resolved duplicate Next.js page warnings. All 64/64 health checks remain **PASS**. Environment is ready for Stage 6 / Production deployment.
- **Continuous Care AI Engine (2026-04-05):** Architected and deployed a 14-day recovery lifecycle engine. Replaced static summaries with a dynamic "Recovery Roadmap" that predicts day-wise symptoms and improvement markers. Integrated multimodal vision (Gemini 1.5 Flash) for Rx OCR and added an interactive "Medication Checklist" and "Symptom Check-in" system to the patient home page to drive adherence and re-consultation conversion.
- **Service Layer Design (Care Lifecycle):** Created `CareLifecycleService` and `ContinuousCareHub` component. Used the database as a "Virtual Job Queue" for scheduling 14-day recovery nudges without external Redis dependencies.


---

## 🤖 Agent Personality
- Be concise.
- Use "we" (e.g., "We should update the hook...").
- If a request is ambiguous, ask for clarification before guessing.
