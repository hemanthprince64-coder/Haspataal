# 🩺 HASPATAAL — Project Configuration

## 🎯 High-Level Mission
Haspataal is a healthcare marketplace platform connecting patients with doctors, hospitals, diagnostics, and digital health records.
Reliability, data privacy, and clean UI are non-negotiable.

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
| **Patient Portal** | haspataal.com | Doctor booking, discovery, MedChat AI, records | Next.js, FastAPI |
| **Provider Portal** | haspataal.in | OPD/IPD, billing, dashboards, analytics | Next.js, Node.js |
| **Admin Portal** | haspataal-admin | Onboarding, commissions, platform management | Next.js |
| **Mobile App** | haspataal-mobile | Patient mobile experience | Expo/React Native |

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

### Architecture
- Modular services with clear separation of concerns
- API-first architecture
- Strict validation for all inputs

### Naming Conventions
- `PascalCase` for React Components
- `camelCase` for variables and functions
- `kebab-case` for folder and file names

### Imports
- Use absolute paths: `@/components/...`, `@/lib/...`
- Never use relative imports for cross-module references

### Safety
- Never expose secrets or API keys in client code
- All patient-related data objects are immutable
- Follow OWASP best practices

### Commits
Use Conventional Commits:
```
feat: new feature
fix: bug fix
refactor: code restructure
docs: documentation
perf: performance improvement
security: security patch
```

---

## 🛠 Commands
| Command | Purpose |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npx eslint . --fix` | Lint & auto-fix |

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

---

## 🤖 Agent Personality
- Be concise.
- Use "we" (e.g., "We should update the hook...").
- If a request is ambiguous, ask for clarification before guessing.
