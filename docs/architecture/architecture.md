---\nversion: 2.0\nowner: Haspataal Engineering\nlast_updated: 2026-08-04\nstatus: Active\n---\n
# Architecture Overview

## Monorepo Structure

The project uses Turborepo with npm Workspaces.

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

## Domain Layer (Clean Architecture)

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

## Core Design Philosophy

- **Single Source of Truth:** `EventLog` table. Every write in HMS emits an event.
- **Event Bus:** Dual-write to PostgreSQL (`EventLog`) and Redis Streams for async processing.
- **Multi-Tenancy:** Strict Row-Level Security (RLS) on EVERY table using `current_setting('app.hospital_id')`.
- **Inter-Module Communication:** No direct calls. Modules communicate purely via events.

## Tech Stack & Environment

- **Framework:** Next.js (App Router) / Express.js
- **Build System:** Turborepo + npm Workspaces
- **Styling:** Tailwind CSS + Shadcn UI (`@haspataal/ui`)
- **ORM/DB:** Prisma 5 (`@haspataal/db`) / Raw `pg` Pool for RLS-scoped transactions
- **Auth:** `jose` JWT RBAC + Multi-tenant hospital isolation
- **Observability:** Shared Pino structured logging (`@haspataal/logger`), Sentry, Prometheus metrics (`prom-client`).
- **Notifications:** WhatsApp Business API + SMS Gateway
- **AI:** Gemini (Triage & OCR)

## Key Design Patterns

### RLS Transaction Wrapper
Always wrap DB calls in transactions that set local tenant contexts:
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
