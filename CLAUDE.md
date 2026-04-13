# 🩺 CLAUDE.md - Project Haspataal

## 🎯 High-Level Mission
Haspataal is a healthcare application for patient management, appointment booking, and hospital discovery.
Reliability, data privacy, and clean UI are non-negotiable.

## ⚠️ Session Protocol (MANDATORY)
1. **READ FIRST:** At the start of every session or conversation, **always read this `CLAUDE.md` file before doing any work.** No exceptions.
2. **UPDATE AFTER EVERY BUG FIX:** After fixing any bug, immediately add an entry to the **Knowledge Base** section below with the root cause and fix.
3. **NEVER REPEAT MISTAKES:** Before writing code, check the Knowledge Base for known pitfalls. If a past lesson applies, follow it.
4. **Accountability:** If a bug recurs that is already documented in the Knowledge Base, treat it as a critical failure and flag it.

---

## 🏗️ Architecture

**Live Domains:**
- `haspataal.com` → Patient Portal (`:3000`) — `haspataal-com/`
- `doctor.haspataal.com` → Doctor Portal (`:3001`) — `haspataal-in/`
- `hospital.haspataal.com` → Hospital HMS (`:3002`) — `hospital-hms/`
- `admin.haspataal.com` → Admin Panel (`:3003`) — `haspataal-admin/`
- `api.haspataal.com` → API Gateway (`:4002`) — `api-gateway/`
- `auth.haspataal.com` → Auth Service (`:4001`) — `auth-service/`

```
Nginx (Load Balancer / Reverse Proxy)
│
├── Patient Portal    (Next.js, port 3000)
├── Doctor Portal     (Next.js, port 3001)
├── Hospital HMS      (Next.js, port 3002)
├── Admin Panel       (Next.js, port 3003)
│
├── API Gateway       (Express.js, port 4002)
│   ├── Rate limiting via Redis
│   ├── JWT RBAC middleware (requireAuth, requireRole, requireHospitalTenant)
│   ├── Redis Token Blacklist (for logout revocation)
│   └── Redlock for atomic appointment slot reservation
│
├── Auth Service      (Express.js, port 4001)
│   ├── /oauth/token  — Multi-role JWT issuance (patient, doctor, hospital_admin, staff)
│   └── /auth/logout  — Token blacklisting via Redis TTL
│
├── Redis             → Caching, rate-limiting, distributed locking
└── Supabase PostgreSQL → Primary database (accessed via Prisma ORM)
```

---

## 🛠 Tech Stack & Environment
- **Framework:** Next.js 16 (App Router) with React 19
- **Styling:** Tailwind CSS 3.4
- **ORM/DB:** Prisma 5 → Supabase (PostgreSQL)
- **Auth:** Custom JWT (`jsonwebtoken`) + Redis blacklisting + `bcryptjs`
- **Validation:** Zod 4
- **Logging:** Pino + pino-pretty
- **Caching:** Redis (`ioredis`), cache-aside pattern
- **Locking:** Redlock for distributed mutexes (appointment booking)
- **Queue:** BullMQ (Redis-backed)
- **Containerisation:** Docker Compose + Nginx
- **AI/LLM:** Google Generative AI SDK (`@google/generative-ai`)
- **DB Tooling:** Google MCP Toolbox for Databases (`toolbox.exe`)
- **Environment:** AntiGravity Agentic IDE
- **Package Manager:** npm

---

## 🧠 Recursive Memory & Learning (CRITICAL)
- **Self-Correction:** After every bug fix, identify the root cause. If it's a project-specific pattern, update this `CLAUDE.md` under the "Knowledge Base" section immediately.
- **Onboarding:** When I ask "What's the status?", review recent PRs and your internal history to provide a concise summary.

---

## 🚀 AntiGravity Workflow
- **Implementation Plan:** For any change involving >2 files, provide a bulleted "Implementation Plan" and wait for my "Go" before editing.
- **Verification:** Do not mark a task as "Done" until the change has been validated (lint, build, or browser test).

---

## 📋 Coding Standards
- **Naming:** `PascalCase` for Components, `camelCase` for variables, `kebab-case` for folder names.
- **Safety:** Treat all patient-related data objects as immutable. Never expose PII in logs.
- **Imports:** Use absolute paths (e.g., `@/components/...`) instead of relative paths.
- **Multi-Tenancy:** All hospital-scoped queries MUST filter by `hospitalId`. Never fetch cross-tenant data.

---

## 🛠 Commands

### Root (Patient Portal)
```bash
npm run dev       # Start patient portal on :3000
npm run build     # Production build
npm run lint      # ESLint
```

### Auth Service
```bash
cd auth-service && node index.js     # Start on :4001
```

### API Gateway
```bash
cd api-gateway && node index.js      # Start on :4002
```

### Database
```bash
npx prisma generate       # Regenerate Prisma client after schema changes
npx prisma db push        # Push schema to Supabase
npx prisma studio         # Visual DB explorer
```

### MCP Toolbox (AI Database Queries)
```bash
.\toolbox.exe --config tools.yaml --stdio   # MCP server mode
.\toolbox.exe --config tools.yaml --ui      # Visual UI on :5000
```

### Audit Scripts
```bash
node scripts/audit.js             # Doctor KYC audit
node scripts/audit_isolation.js   # Multi-tenant isolation audit
node scripts/validate-env.js      # Environment variable validation
node scripts/fix_audit.js         # Remediate KYC inconsistencies
```

---

## 🔑 Key Design Patterns

### JWT RBAC
Middleware chain on protected routes:
```js
requireAuth → requireRole('hospital_admin') → requireHospitalTenant → handler
```
Roles: `patient`, `doctor`, `hospital_admin`, `staff`, `super_admin`

### Token Revocation (Logout)
On logout, JWT is stored in Redis until its natural expiry:
```
blacklist:{token} → 1  (with TTL = remaining exp seconds)
```

### Distributed Slot Locking
Appointment booking uses Redlock to prevent race conditions:
```
lock:slot:{doctorId}:{scheduledAt}:{slot}  (TTL: 10s)
```

### Environment Validation
`scripts/validate-env.js` uses Zod. Both services call `validateEnv()` on startup.

### MCP Toolbox
`tools.yaml` configures two tools:
- `list-tables` — Schema discovery
- `execute-query` — Arbitrary SQL against the Supabase DB

---

## 📚 Knowledge Base (Lessons Learned)
> **Claude: You MUST update this section after every bug fix. Never skip this step.**

- **Prisma select/include conflict:** Never mix `select` and `include` on the same relation field in Prisma queries — use one or the other. *(Fixed in conversation 842dbe37)*
- **Logout flow:** Patient logout requires a dedicated server action that clears the JWT cookie; client-side only clearing is insufficient. *(Fixed in conversation 4c8aae98)*
- **Supabase RLS:** Row-Level Security policies must be audited when adding new tables or modifying access patterns — see `supabase_rls_audit_day11.sql` for reference.
- **AccountStatus enum:** The valid values in the Prisma schema are `ACTIVE`, `SUSPENDED`, `INACTIVE` — NOT `DEACTIVATED`. Using an invalid enum value throws a `PrismaClientValidationError`. *(Fixed in conversation 3ecc8175)*
- **Auth middleware async:** `requireAuth` middleware must be declared `async` if it uses `await` inside (e.g., Redis blacklist check). Without `async`, the `await` throws a SyntaxError at load time. *(Fixed in conversation 3ecc8175)*
- **Prisma scripts need dotenv:** Standalone Node scripts that use Prisma directly must call `require('dotenv').config()` before instantiating `PrismaClient`, otherwise `DATABASE_URL` is not found. *(Fixed in conversation 3ecc8175)*
- **DoctorMaster KYC/AccountStatus mismatch:** Doctors can end up with `kycStatus: PENDING` but `accountStatus: ACTIVE` — run `scripts/audit.js` and `scripts/fix_audit.js` periodically to detect and remediate. *(Discovered in conversation 3ecc8175)*

---

## 🤖 Agent Personality
- Be concise.
- Use "we" (e.g., "We should update the hook...").
- If a request is ambiguous, ask for clarification before guessing.
