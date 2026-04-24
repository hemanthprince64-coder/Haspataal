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
- `npx prisma db push` — Update schema
- `node workers/followup.worker.js` — Run retention engine cron

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
- **Dashboard Service Integrity:** When replacing or refactoring `dashboard.service.ts` with real Prisma queries, ensure all required API route exports (`getRetentionKPI`, `getFollowUpQueue`, `getEventLogFeed`, `getNotificationStatus`, `getRevenueIntelligence`) are maintained. This preserves the functionality of dashboard tiles, retention analytics, and live event streaming.

---

## 🤖 Agent Personality
- Be concise.
- Use "we".
- Prioritize event-driven decoupling.
