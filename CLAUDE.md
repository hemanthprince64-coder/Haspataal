# Haspataal Platform: AI Agent Guide

This document describes the Haspataal healthcare platform, its architecture, and the commands for AI models and coding agents working in this codebase.

---

## Platform Overview

Haspataal is a multi-tenant healthcare platform with separate portals for Patients, Doctors, Hospitals, and Admins. It is built on a Next.js monorepo with a Node.js microservice backend.

**Live Domains:**
- `haspataal.com` → Patient Portal (`:3000`)
- `doctor.haspataal.com` → Doctor Portal (`:3001`)
- `hospital.haspataal.com` → Hospital HMS (`:3002`)
- `admin.haspataal.com` → Admin Panel (`:3003`)
- `api.haspataal.com` → API Gateway (`:4002`)
- `auth.haspataal.com` → Auth Service (`:4001`)

---

## Architecture

```
Nginx (Load Balancer / Reverse Proxy)
│
├── Patient Portal    (Next.js, port 3000) → haspataal-com/
├── Doctor Portal     (Next.js, port 3001) → haspataal-in/
├── Hospital HMS      (Next.js, port 3002) → hospital-hms/
├── Admin Panel       (Next.js, port 3003) → haspataal-admin/
│
├── API Gateway       (Express.js, port 4002) → api-gateway/
│   ├── Rate limiting via Redis
│   ├── JWT RBAC middleware (requireAuth, requireRole, requireHospitalTenant)
│   ├── Redis Token Blacklist (for logout revocation)
│   └── Redlock for atomic appointment slot reservation
│
├── Auth Service      (Express.js, port 4001) → auth-service/
│   ├── /oauth/token  — Multi-role JWT issuance (patient, doctor, hospital_admin, staff)
│   └── /auth/logout  — Token blacklisting via Redis TTL
│
├── Redis             → Caching, rate-limiting, distributed locking
└── Supabase PostgreSQL → Primary database (accessed via Prisma ORM)
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS |
| Backend | Express.js (API Gateway + Auth Service) |
| Database | Supabase PostgreSQL via Prisma ORM 5.10 |
| Auth | Custom JWT via `jsonwebtoken`, Redis blacklisting |
| Caching | Redis (`ioredis`), cache-aside pattern |
| Locking | Redlock for distributed mutexes |
| Queue | BullMQ (Redis-backed) |
| Containerisation | Docker Compose + Nginx |
| AI/LLM | Google Generative AI SDK |
| DB Tooling | Google MCP Toolbox for Databases (`toolbox.exe`) |

---

## Common Commands

### Root (Next.js Patient Portal)
```bash
npm run dev       # Start patient portal on :3000
npm run build     # Production build
npm run lint      # ESLint
```

### Auth Service
```bash
cd auth-service
node index.js     # Start auth service on :4001
```

### API Gateway
```bash
cd api-gateway
node index.js     # Start gateway on :4002
```

### Database
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push schema to database
npx prisma db push

# Explore database visually
npx prisma studio

# Run MCP Toolbox for AI-driven SQL queries
.\toolbox.exe --config tools.yaml --stdio
.\toolbox.exe --config tools.yaml --ui     # Visual UI on :5000
```

### Audit Scripts
```bash
node scripts/audit.js             # Doctor KYC audit
node scripts/audit_isolation.js   # Multi-tenant isolation audit
node scripts/validate-env.js      # Environment variable validation
```

---

## Key Design Patterns

### JWT RBAC
All protected routes use middleware chain:
```js
requireAuth → requireRole('hospital_admin') → requireHospitalTenant → handler
```
Roles: `patient`, `doctor`, `hospital_admin`, `staff`, `super_admin`

### Multi-Tenancy
Hospital data is scoped by `hospitalId` at every query level. `requireHospitalTenant` middleware enforces that `req.user.hospitalId === req.params.id`.

### Distributed Slot Locking
Appointment booking uses Redlock:
```
lock:slot:{doctorId}:{scheduledAt}:{slot}
```
Lock TTL is 10 seconds. Prevents race conditions on concurrent bookings.

### Token Revocation
On logout, the JWT is stored in Redis with TTL = remaining `exp` time:
```
blacklist:{token} → 1
```
Every request checks redis before verifying the JWT signature.

### Environment Validation
`scripts/validate-env.js` uses Zod schema validation. Both `auth-service` and `api-gateway` call `validateEnv()` on startup and exit with a descriptive error if variables are missing.

---

## MCP Toolbox Configuration

The MCP Toolbox (`toolbox.exe`) is pre-configured in `tools.yaml` to connect to the Supabase PostgreSQL database.

Available tools:
- `list-tables` — Lists all tables in the `public` schema
- `execute-query` — Execute arbitrary SQL (read/write)

To integrate with an IDE or AI client, add to your MCP config:
```json
{
  "mcpServers": {
    "haspataal-db": {
      "command": "C:\\Users\\heman\\.gemini\\antigravity\\scratch\\haspataal\\toolbox.exe",
      "args": ["--config", "tools.yaml", "--stdio"]
    }
  }
}
```

---

## Prisma Schema Highlights

Key models in `prisma/schema.prisma`:
- `Patient` — Patient accounts, profiles, care journeys
- `DoctorMaster` — Doctor registration, KYC, professional history
- `HospitalsMaster` — Hospital registration, verification
- `DoctorHospitalAffiliation` — Many-to-many doctor ↔ hospital
- `Appointment` — Bookings with Redis-protected slot uniqueness
- `CareJourney` — Continuous care engine, recovery tracking
- `NudgeSchedule` — Automated patient nudges

---

## Security Notes

- **KYC Enforcement**: Doctors with `kycStatus: PENDING` and `accountStatus: ACTIVE` are automatically flagged and suspended by `scripts/fix_audit.js`
- **Password Policy**: All new passwords must satisfy `common/validation.js` rules (8+ chars, upper, lower, number, special)
- **CORS**: Origins are strictly allowlisted in `api-gateway/index.js`
- **Rate Limits**: API Gateway applies 100 req/15min general limit, 5 req/min on sensitive endpoints
