# Haspataal - Technical Requirements Document (TRD)

## 1. Tech Stack Overview

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend Framework** | Next.js 16.1.6 (App Router) | Modern React SSR, SEO-friendly, excellent DX, built-in optimizations |
| **UI Library** | React 19.2.3 | Latest features, concurrent mode, server components |
| **Language** | TypeScript 5.9.3 | Type safety, better DX, catches errors early |
| **Styling** | Tailwind CSS 3.4.19 | Utility-first, fast development, responsive design |
| **UI Components** | Radix UI + shadcn/ui | Accessible, unstyled primitives with custom design system |
| **State Management** | Redux Toolkit + React-Redux | Predictable state, excellent devtools, scalable |
| **Form Handling** | React Hook Form 7.73.1 | Performance, minimal re-renders, great UX |
| **Validation** | Zod 4.3.6 | Type-safe schema validation, integrates with RHF |
| **Database ORM** | Prisma 5.10.2 | Type-safe DB access, migration management, excellent DX |
| **Database** | PostgreSQL (via Supabase) | Relational, ACID-compliant, healthcare data integrity |
| **Authentication** | jose (JWT) + custom implementation | Full control over auth flow, stateless sessions |
| **API Layer** | Next.js API Routes + tRPC (planned) | Serverless functions, type-safe APIs |
| **Real-time** | Supabase Realtime (optional) | Live updates for appointments, notifications |
| **Job Queue** | BullMQ + Redis | Background processing (emails, notifications, ABDM callbacks) |
| **Logging** | pino + pino-pretty | Structured logging, JSON output for aggregation |
| **Error Tracking** | Sentry | Error monitoring, performance tracking |
| **Charts/Analytics** | Recharts + Chart.js | Client-side data visualization |
| **Analytics** | PostHog | Product analytics, user behavior tracking |
| **Deployment** | Docker + docker-compose | Consistent environments, easy deployment |
| **Infrastructure** | AWS / GCP (TBD) | Cloud hosting with high availability |
| **CI/CD** | GitHub Actions | Automated testing, linting, deployments |
| **Testing** | Vitest + Playwright | Unit tests + E2E tests |
| **Code Quality** | ESLint + Prettier + Husky | Consistency, pre-commit checks |
| **Monorepo** | Turborepo | Build orchestration, caching, concurrent execution |

## 2. Frontend Architecture

### Project Structure (Monorepo)

```
haspataal/
├── apps/
│   ├── patient-portal/      # Next.js app for patients
│   ├── hospital-portal/     # Next.js app for hospitals
│   └── admin-portal/        # Next.js app for admins
├── packages/
│   ├── ui/                  # Shared shadcn/ui components
│   ├── db/                  # Prisma client & database utilities
│   ├── auth/                # Authentication logic & middleware
│   ├── types/               # TypeScript type definitions
│   ├── config/              # Environment & app configs
│   └── utils/               # Shared utilities (date formatting, etc.)
├── services/
│   ├── api-gateway/         # API aggregation layer
│   ├── auth-service/        # Authentication microservice
│   └── medchat-service/     # AI chat service for medical queries
└── docs/                    # Project documentation
```

### Key Frontend Patterns

#### Server vs Client Components
- Use Server Components by default for data fetching
- Only use Client Components when interactivity needed (`"use client"`)
- Streaming UI for loading states
- Suspense boundaries for error boundaries

#### State Management Strategy
- **Redux**: Global state (auth, user profile, notifications)
- **Server State**: SWR / TanStack Query for API data
- **Local UI State**: `useState` / `useReducer` for component-level
- **Form State**: React Hook Form (uncontrolled for performance)

#### Authentication Flow
```
1. Patient Login (Phone OTP)
   - POST /api/auth/request-otp → generate OTP, send via SMS
   - POST /api/auth/verify-otp → verify, create JWT session
   - Set secure HTTP-only cookie
   - Redirect to patient dashboard

2. Hospital Login (Email + Password)
   - POST /api/auth/login → verify bcrypt hash, create session
   - Set session cookie
   - Redirect to hospital dashboard

3. Middleware Protection
   - middleware.ts inspects cookies
   - Redirects unauthenticated users to login
   - Refreshes tokens when needed
```

## 3. Backend Architecture

### API Design Principles
- RESTful endpoints with consistent naming
- Resource-based URLs (e.g., `/api/appointments`, `/api/doctors`)
- Standard HTTP verbs (GET, POST, PATCH, DELETE)
- JSON request/response bodies
- Proper HTTP status codes
- Rate limiting on auth and public endpoints

### Core API Endpoints

#### Patient APIs
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/auth/request-otp` | POST | Send OTP to phone | Public |
| `/api/auth/verify-otp` | POST | Verify OTP, create session | Public |
| `/api/patients/profile` | GET/PATCH | Get/update patient profile | Patient |
| `/api/doctors` | GET | List/search doctors | Public |
| `/api/doctors/:id` | GET | Get doctor details | Public |
| `/api/appointments` | GET/POST | List/create appointments | Patient |
| `/api/appointments/:id` | PATCH/DELETE | Reschedule/cancel | Patient |
| `/api/care-journeys` | GET | Patient's care journeys | Patient |

#### Hospital APIs
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/auth/login` | POST | Hospital admin login | Public |
| `/api/auth/logout` | POST | Invalidate session | Hospital |
| `/api/hospital/doctors` | GET/POST | List/add doctors | Hospital |
| `/api/hospital/appointments` | GET | All hospital appointments | Hospital |
| `/api/hospital/appointments/:id` | PATCH | Update appointment status | Hospital |
| `/api/hospital/staff` | GET/POST | Manage staff | Hospital |
| `/api/hospital/care-journeys` | GET/POST | Manage care journeys | Hospital |
| `/api/hospital/reports` | GET | Analytics & reports | Hospital |

#### Admin APIs
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/admin/hospitals` | GET | List all hospitals | Admin |
| `/api/admin/hospitals/:id/approve` | PATCH | Approve hospital | Admin |
| `/api/admin/dashboard` | GET | Platform metrics | Admin |
| `/api/admin/users` | GET | User management | Admin |

### Error Handling
```typescript
// Standard error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ...field errors... }
  }
}
```

### Rate Limiting
- Authentication endpoints: 5 requests / 15 minutes per IP
- General APIs: 100 requests / minute per user
- Admin APIs: 500 requests / minute per admin

## 4. Database Architecture

### Database Choice: PostgreSQL (Supabase)

**Why PostgreSQL:**
- ACID compliance for transactional integrity
- Excellent for relational healthcare data
- JSON support for flexible fields
- Row-level security (RLS) for multi-tenancy
- Full-text search capabilities
- Strong ecosystem and tooling

### Connection Strategy
- Supabase connection pooling (PgBouncer)
- Serverless function connections (Next.js API routes)
- Prisma as ORM with connection management
- Redis for session storage and caching

## 5. Security Architecture

### Authentication & Authorization
- JWT tokens with short expiry (1 hour)
- Refresh token rotation
- Secure, HTTP-only cookies
- CSRF protection
- Password hashing with bcrypt (cost factor 12)
- OTP via SMS with 5-minute expiry

### Data Protection
- Row-Level Security (RLS) policies in Supabase
- Service role key only used server-side
- No PHI in client-side code
- Encryption at rest (Supabase manages)
- TLS 1.3 in transit

### Infrastructure Security
- Docker container isolation
- Environment variables for secrets
- `.env.local` excluded from git
- Audit logging for all data access
- Regular dependency vulnerability scanning

## 6. Performance & Scalability

### Frontend Optimizations
- Next.js Image component for optimized images
- Font optimization with `next/font`
- Code splitting with dynamic imports
- Static generation where possible
- Client-side caching (SWR)

### Backend Optimizations
- Database indexing on foreign keys and search fields
- Query optimization (avoid N+1 with Prisma includes)
- Redis caching for session data
- Efficient pagination (cursor-based for large datasets)
- Connection pooling

### Infrastructure Scaling
- Horizontal pod autoscaling (Kubernetes / Docker Swarm)
- Database read replicas for analytics queries
- CDN for static assets (CloudFlare / CloudFront)
- Load balancer with health checks

## 7. Monitoring & Observability

### Application Monitoring
- **Sentry** - Error tracking with stack traces and user context
- **PostHog** - Product analytics with event tracking
- **Custom Metrics** - Prometheus client for application metrics

### Infrastructure Monitoring
- **Logs** - Structured JSON logs via pino, aggregated in ELK/Sentry
- **Health Checks** - `/health` endpoint for liveness/readiness
- **Database Monitoring** - Supabase dashboard + custom queries

### Alerting
- Critical errors → Slack/PagerDuty
- Performance degradation → Email
- Database downtime → SMS

## 8. Development Workflow

### Branch Strategy
- `main` - Production-ready
- `develop` - Integration branch
- Feature branches: `feature/<name>` → PR to `develop`
- Hotfix branches: `hotfix/<name>` → PR to `main` + `develop`

### Code Quality
- ESLint with Next.js and TypeScript rules
- Prettier for formatting
- Husky + lint-staged for pre-commit checks
- Conventional Commits for changelog generation
- PR review required (at least 1 reviewer)

### CI/CD Pipeline
1. **Commit** → GitHub push
2. **Lint & Type Check** → ESLint + TypeScript
3. **Unit Tests** → Vitest
4. **Build Check** → Next.js build
5. **E2E Tests** → Playwright (on staging)
6. **Deploy** → Automatic to staging (PR), manual to production

## 9. Third-Party Integrations

| Service | Purpose | Implementation |
|---------|---------|----------------|
| **Supabase** | Auth + Database + Storage | @supabase/supabase-js SDK |
| **SMS Provider** | OTP delivery | Twilio / AWS SNS / Msg91 (India) |
| **Email Service** | Notifications, receipts | Resend / AWS SES |
| **Analytics** | Product analytics | PostHog |
| **Error Tracking** | Error monitoring | Sentry |
| ** Charts** | Data visualization | Recharts / Chart.js |
| **Push Notifications** | Mobile engagement | Firebase Cloud Messaging (FCM) |

## 10. Infrastructure & Deployment

### Development
- Docker Compose for local stack
- Local PostgreSQL + Redis
- Hot reload with Next.js dev server

### Staging
- Docker containers
- Separate Supabase project (staging)
- Automated CI/CD deployments

### Production
- Kubernetes / ECS / Cloud Run (TBD)
- Managed PostgreSQL (RDS / Supabase Prod)
- Redis cluster for sessions and caching
- CDN for static assets
- SSL/TLS termination at load balancer
- Database backups: Daily + WAL archiving

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-12  
**Owner**: Haspataal Engineering Team
