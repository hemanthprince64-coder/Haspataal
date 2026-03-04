# 🩺 CLAUDE.md - Project Haspataal

## 🎯 High-Level Mission
Haspataal is a healthcare application for patient management, appointment booking, and hospital discovery.
Reliability, data privacy, and clean UI are non-negotiable.

## ⚠️ Session Protocol (MANDATORY)
1. **READ FIRST:** At the start of every session or conversation, **always read this `CLAUDE.md` file before doing any work.** No exceptions.
2. **UPDATE AFTER EVERY BUG FIX:** After fixing any bug, immediately add an entry to the **Knowledge Base** section below with the root cause and fix.
3. **NEVER REPEAT MISTAKES:** Before writing code, check the Knowledge Base for known pitfalls. If a past lesson applies, follow it.
4. **Accountability:** If a bug recurs that is already documented in the Knowledge Base, treat it as a critical failure and flag it.

## 🛠 Tech Stack & Environment
- **Framework:** Next.js 16 (App Router) with React 19
- **Styling:** Tailwind CSS 3.4
- **ORM/DB:** Prisma 5 → Supabase (PostgreSQL)
- **Auth:** JWT via `jose` + `bcryptjs`
- **Validation:** Zod 4
- **Logging:** Pino + pino-pretty
- **Environment:** AntiGravity Agentic IDE
- **UI Engine:** Stitch MCP (for design-to-code)
- **Data Optimization:** TOON Serialization (`@toon-format/toon`) for AI-facing data
- **Package Manager:** npm

## 🧠 Recursive Memory & Learning (CRITICAL)
- **Self-Correction:** After every bug fix, identify the root cause. If it's a project-specific pattern, update this `CLAUDE.md` under the "Knowledge Base" section immediately.
- **Onboarding:** When I ask "What's the status?", review recent PRs and your internal history to provide a concise summary.

## 🚀 AntiGravity / Stitch Workflow
- **Vibe-to-Code:** Always use `stitch-mcp` to generate or "vibe" a UI mockup before writing frontend implementation.
- **Verification:** Do not mark a task as "Done" until you have opened the AntiGravity integrated browser and verified the UI/UX.
- **Implementation Plan:** For any change involving >2 files, provide a bulleted "Implementation Plan" and wait for my "Go" before editing.

## 📋 Coding Standards
- **Serialization:** Use **TOON** format for all AI-to-AI data exchanges to minimize token usage.
- **Naming:** `PascalCase` for Components, `camelCase` for variables, `kebab-case` for folder names.
- **Safety:** Treat all patient-related data objects as immutable.
- **Imports:** Use absolute paths (e.g., `@/components/...`) instead of relative paths.

## 🛠 Commands
- **Install:** `npm install`
- **Dev:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npx eslint . --fix`

## 📚 Knowledge Base (Lessons Learned)
> **Claude: You MUST update this section after every bug fix. Never skip this step.**

- **Prisma select/include conflict:** Never mix `select` and `include` on the same relation field in Prisma queries — use one or the other. *(Fixed in conversation 842dbe37)*
- **Logout flow:** Patient logout requires a dedicated server action that clears the JWT cookie; client-side only clearing is insufficient. *(Fixed in conversation 4c8aae98)*
- **Supabase RLS:** Row-Level Security policies must be audited when adding new tables or modifying access patterns — see `supabase_rls_audit_day11.sql` for reference.

---

## 🤖 Agent Personality
- Be concise.
- Use "we" (e.g., "We should update the hook...").
- If a request is ambiguous, ask for clarification before guessing.
