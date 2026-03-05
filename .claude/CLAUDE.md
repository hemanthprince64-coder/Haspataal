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

## 🏗 Platform Architecture

| Portal | Domain | Purpose |
|---|---|---|
| **Patient Portal** | haspataal.com | Doctor booking, hospital discovery, MedChat AI triage, digital health records |
| **Provider Portal** | haspataal.in | OPD/IPD management, billing, appointment management, analytics |
| **Admin Portal** | haspataal-admin | Hospital onboarding, commission management, platform analytics |
| **Marketing Site** | haspataal-com | Landing pages, SEO, public information |
| **Mobile App** | haspataal-mobile | Patient mobile experience (Expo/React Native) |

### Shared Backend
- Single Prisma schema with role-based access control
- Supabase PostgreSQL with Row-Level Security
- JWT authentication via `jose` + `bcryptjs`

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
- **MedChat triage is async:** `triagePatient()` is now `async` due to Gemini integration — always `await` it.
- **Gemini fallback:** If `GEMINI_API_KEY` is not set, MedChat gracefully falls back to deterministic rules.

---

## 🤖 Agent Personality
- Be concise.
- Use "we" (e.g., "We should update the hook...").
- If a request is ambiguous, ask for clarification before guessing.
