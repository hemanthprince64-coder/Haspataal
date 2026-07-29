# System Architecture

## Overview
Haspataal is a modern, monorepo-based healthcare management system consisting of multiple frontend applications, backend microservices, shared packages, and databases.

## System Overview

```
┌───────────────────────────────────────────────────────────────┐
│                     API Gateway                               │
│                  (gateway.haspataal.com)                      │
└─────────────┬─────────────────────────┬─────────────────────────┘
              │                         │                         │
              ▼                         ▼                         ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│      Patient Portal     │ │     Doctor Workspace    │ │     Hospital HMS        │
│    (patient-portal)     │ │     (doctor-app)        │ │    (hospital-hms)       │
│   Next.js 14 App Router  │ │   Next.js 14 App Router  │ │   Next.js 14 App Router   │
└─────────────┬─────────────┘ └─────────────┬─────────────┘ └─────────────┬─────────────┘
              │                             │                             │
              └───────────────────────────────┼───────────────────────────────┘
                                              │
                                    Platform Services
                                              │
┌───────────────────────────────────────────────────────────────────────────────┐
│ Auth (Identity)  │ Tenant          │ Workflow         │ Scheduler       │      │
│ Notifications    │ Search          │ Audit            │ Analytics       │      │
│ AI Engine        │ Billing         │ Storage          │ Events (Bus)    │      │
│ Configuration    │ CDS Layer       │ Cache Manager    │ Master Data     │      │
└───────────────────────────────────────────────────────────────────────────────┘
                                              │
                                    PostgreSQL + Redis
```

## Technology Stack
- **Monorepo Management**: Turborepo (Node.js & npm workspaces)
- **Frontend Portals**: Next.js 15/14 App Router, React 19/18, Tailwind CSS, Radix UI, lucide-react
- **Backend Framework**: Next.js API Routes & Server Actions, BullMQ queue engine, Redis
- **Database Layer**: PostgreSQL via Prisma ORM, Supabase Storage
- **Authentication**: JWT/jose-based sessions with custom cookie verification
- **Monitoring & Errors**: Sentry, PostHog

## Component Layers

### Shared Packages
| Package | Purpose | Location |
|---------|---------|----------|
| `@haspataal/auth` | Authentication, RBAC, security | `packages/auth/` |
| `@haspataal/db` | Prisma client, schema | `packages/db/` |
| `@haspataal/events` | Redis Stream event bus | `packages/events/` |
| `@haspataal/scheduler` | BullMQ cron engine | `packages/scheduler/` |
| `@haspataal/files` | S3/R2 file storage | `packages/files/` |
| `@haspataal/types` | Shared TypeScript types | `packages/types/` |

### Applications
| App | Port | Purpose |
|-----|------|---------|
| patient-portal | 3001 | Patient-facing portal |
| admin-panel | 3002 | Platform administration |
| hospital-hms | 3000 | Hospital management system |

## Domain Model

### Core Domains
1. **Identity & Access** - Users, roles, permissions, sessions
2. **Clinical** - Appointments, visits, prescriptions, labs, EMR
3. **Billing** - Invoices, payments, insurance
4. **Communication** - Notifications, SMS, WhatsApp, email
5. **Discovery** - Doctor search, hospital search, availability
6. **Analytics** - Reports, dashboards, KPIs

## Shared Services

### Authentication Service
- **JWT Generation**: HS256/RS256 tokens
- **OTP Service**: SMS/WhatsApp/email OTP
- **Session Management**: Cookie-based with refresh
- **MFA Support**: TOTP, SMS fallback

### Event Bus
- **Technology**: Redis Streams (ioredis)
- **Pattern**: Publish-subscribe
- **Events**: PatientRegistered, AppointmentBooked, LabResultReady
- **Durability**: Persistent streams

### Workflow Engine
- **Technology**: State machines with audit
- **Patterns**: Generic workflow executor
- **Events**: State transition events
- **Recovery**: Dead letter queues

### Scheduler
- **Technology**: BullMQ cron
- **Jobs**: Credential expiry, retention alerts, follow-ups
- **Monitoring**: Queue dashboard

### Search Service
- **Indexing**: DoctorSearchIndex table
- **Queries**: Specialty, location, availability, ratings
- **Updates**: Real-time on profile changes

### Configuration Service
- **Scope**: Global, hospital, department, doctor
- **Storage**: Database-backed
- **Cache**: Redis with TTL

## Microservice Boundaries

### Modular Monolith Structure
- Single deployable with modular codebase
- Shared database (PostgreSQL)
- Separate business logic modules
- Independent package deployment capability

### Domain Separation
```
packages/
├── auth/           # Authentication & Authorization
├── db/             # Database schema & client
├── events/         # Event bus singleton
├── scheduler/      # Job scheduling
├── files/          # File storage
├── types/          # Shared types
└── queue/          # Background jobs
```

## API Gateway

### Gateway Responsibilities
- Centralized JWT verification
- Rate limiting (sliding window)
- Trace ID injection
- Circuit breakers
- Request routing

### Middleware
- `authorizationMiddleware` - Role-based access
- `rateLimitMiddleware` - Request throttling
- `csrfMiddleware` - CSRF protection
- `cspMiddleware` - Content Security Policy

## Database Architecture

### Primary Database
- **PostgreSQL 15** via Supabase
- **Connection**: Connection pooling
- **Backups**: Daily automated
- **Replication**: Primary + read replicas

### Cache Layer
- **Redis 7** via Upstash
- **Uses**: Session cache, rate limiting, event bus
- **TTL**: Configurable per use case

## Security Architecture

### Defense in Depth
1. **Network**: HTTPS enforced, CORS restricted
2. **Application**: Input validation, RBAC, rate limiting
3. **Data**: RLS, encryption, audit logs
4. **Monitoring**: Sentry, audit trails

### Compliance
- **DPDP Act**: Consent management, data portability
- **HIPAA**: PHI protection (readiness)
- **OWASP**: API security top 10 compliance

## Future Architecture

### Planned Enhancements
- **Kubernetes**: Container orchestration
- **GraphQL API**: Alternative to REST
- **Microservices Split**: Auth, Billing, Notifications as services
- **Event Sourcing**: Full audit trail
- **CQRS**: Separate read/write models
- **Multi-region**: DR and low latency

### Six-Engine Integration (In Progress)
- **Configuration Engine**: Extracted as a Control Plane with Redis caching.
- **Timeline Engine**: Immutable clinical events mapped via `PlatformEvent`.
- **Rules Engine**: Idempotent execution with circular loop protection.
- **Notification Engine**: Robust fallback and delivery queuing.
- **Journey Engine**: Event-driven pathway progression.
- **Search Engine**: Decoupled asynchronous indexing.
- **Integration Runtime**: Formalized via `PlatformEvent`, `PlatformCommand`, and `PlatformQuery` in `packages/platform-contracts`.

## Content from ARCHITECTURE_REPORT.md

# ARCHITECTURE REPORT

> Repo: https://github.com/hemanthprince64-coder/Haspataal.git

## Structure: Multi-Project (NOT monorepo — no workspaces)

| Project              | Type               | Port | Framework                 |
| -------------------- | ------------------ | ---- | ------------------------- |
| **Root (haspataal)** | Primary App        | 3000 | Next.js 16.1.6 + React 19 |
| **haspataal-in**     | Provider Portal    | 3001 | Next.js                   |
| **haspataal-admin**  | Admin Portal       | 3002 | Next.js                   |
| **haspataal-com**    | Marketing Site     | 3000 | Next.js                   |
| **haspataal-mobile** | Patient Mobile App | N/A  | Expo (React Native)       |

## Root App Tech Stack

| Tech       | Version             |
| ---------- | ------------------- |
| Next.js    | 16.1.6              |
| React      | 19.2.3              |
| Prisma     | 5.10.0              |
| TypeScript | 5.9.3               |
| Auth       | jose (JWTs)         |
| Logging    | pino + pino-pretty  |
| Validation | zod 4.3.6           |
| DB         | Supabase PostgreSQL |

## Root App Route Groups

| Group        | Routes                                                                |
| ------------ | --------------------------------------------------------------------- |
| `(patient)`  | `/`, `/login`, `/hospitals`, `/book`, `/profile`, `/search`           |
| `(hospital)` | `/hospital/*` (login, register, dashboard, billing, doctors, reports) |
| `(hospital)` | `/lab/*` (register, dashboard)                                        |
| `(agent)`    | `/agent/*` (login, register, dashboard)                               |
| `(doctor)`   | `/doctor/register`                                                    |
| `admin`      | `/admin`, `/admin/dashboard`, `/admin/dashboard/hospitals`            |

## Shared Code

- `common/` — shared services.js
- `prisma/schema.prisma` — single schema for root app
- `lib/` — services.ts, auth utilities, prisma client
