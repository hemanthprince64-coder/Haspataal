
# Haspataal Admin Control Plane — Enterprise Design Spec

> Status: Implementation-ready design. Built on top of the **existing** foundation
> (monorepo: `apps/hospital-hms`, `apps/patient-portal`, `apps/admin-panel`;
> `packages/db` Prisma schema; `packages/auth` RBAC; `packages/events` bus;
> `cross-tenant-service.ts`). Nothing here redesigns those modules — it orchestrates them.

---

## 0. Guiding Philosophy

```
Hospital HMS      = runs ONE hospital         → Hospital Admin portal
Network Control   = runs MANY hospitals        → Network Admin portal
Platform Admin    = runs HASPTAAL itself       → Platform Admin portal
```

The Admin Control Plane is **not another dashboard**. It is the operating layer for the
platform. Three portals share one design system (`packages/ui`), one RBAC engine
(`packages/auth`), one schema (`packages/db`), and one event bus (`packages/events`) — but
each portal has a distinct **scope**, **navigation**, and **permission domain**.

| Portal | Primary persona | Data scope | Auth role |
|--------|----------------|-----------|-----------|
| Platform Admin (`apps/admin-panel`) | Haspataal employee | Cross-tenant (global) | `PLATFORM_ADMIN`, `SUPER_ADMIN` |
| Network Admin (`apps/network-admin`) | Chain ops lead | Hospitals in one network/org | `NETWORK_ADMIN` |
| Hospital Admin (`apps/hospital-hms/app/admin`) | Hospital admin | One `hospitalId` | `HOSPITAL_ADMIN` |

---

## 1. Current State Audit (what already exists — DO NOT redesign)

**Foundation (reuse as-is):**
- Multi-tenant via `hospitalId` FK segregation (no `auth.users`/`public` split — single shared DB).
- `packages/db/prisma/schema.prisma` ~5,400 lines, 180+ models.
- `packages/auth`: `requireAuth`, `requireRole`, `createRoleMiddleware`, `withPermission`, `tenantContextMiddleware`.
- `packages/events/src/index.ts`: `EventBus` singleton, `DomainEvent`, `EVENT_TYPES` (~30 events).
- `apps/hospital-hms/lib/services/cross-tenant-service.ts`: `NetworkOperationsService` (no-RLS Prisma) for safe cross-tenant ops.
- `apps/hospital-hms/lib/services/tenant-config.ts`: `TenantConfigService.isFeatureEnabled()` reads flags from `IntegrationConfig` where `provider='FEATURE_FLAGS'`.

**Existing models available to build on:**
- `HospitalsMaster` (`verificationStatus`, `accountStatus`, `isMultiBranch`, `specialities String[]`).
- `HospitalAdmin`, `HospitalRole`, `HospitalDepartment`, `HospitalBillingProfile`, `HospitalVerificationLog`.
- `Staff` (`role Role`, `permissions Json`), `Patient`, `DoctorMaster`, `Agent`, `UserAccount`, `AuthMethod`.
- `RolePermission` (`hospitalId, staffId?, role, module, action, allowed, conditions`).
- `AuditLog`, `EventLog`, `OutboxEvent` (only model with `tenantId`), `IntegrationConfig` (`hospitalId, provider, encryptedConfig, isActive, isLive, webhookUrl, webhookSecret`).
- `Department`, `Invoice`, `Branch`.

**Gaps this spec fills (new platform-layer models + three-portal routing):**
- No global `PlatformAdmin` / `Network` / `Organization` entities.
- No `FeatureFlag`, `Subscription`, `Plan`, `Invoice(platform)`, `ApiToken`, `WebhookSubscription`, `ConsentRecord`, `MasterData*` models.
- RBAC is hospital-scoped — need a **platform RBAC layer** (`PlatformPermission`) orthogonal to `RolePermission`.
- Existing `apps/admin-panel` is a **mock SPA** (`lib/data.js`, in-memory). Real backend must replace it.

---

## 2. Three-Portal Architecture

### 2.1 Platform Admin (`apps/admin-panel`) — Haspataal employees
Runs the SaaS: hospitals lifecycle, subscriptions, integrations, deployments, compliance,
global monitoring, feature flags, event bus console, security center, devops.

### 2.2 Network Admin (`apps/network-admin`) — NEW app
Runs a hospital chain (Apollo, Narayana, Aster). Cross-hospital assignment, hospital groups,
regional networks, parent orgs, central procurement, shared doctors/labs/PACS/billing,
cross-hospital analytics. Uses `NetworkOperationsService` for cross-tenant writes.

### 2.3 Hospital Admin (`apps/hospital-hms/app/admin`) — extend existing
Runs one hospital: departments, staff, billing policies, diagnostics config, local analytics,
hospital config. Already partially present (`app/admin`, `app/admin/audit`).

### 2.4 Shared shell
All three consume `packages/ui` (shadcn-style), `packages/auth` session, `packages/types`.
A `packages/admin-core` is introduced (see §10) to hold shared admin primitives:
`ScopeGate`, `PermissionGate`, `KpiCard`, `AuditTimeline`, `DataTable`, `CommandPalette`.

---

## 3. New Prisma Models (append to `packages/db/prisma/schema.prisma`)

```prisma
// ===================== PLATFORM IDENTITY =====================
enum AdminRole { PLATFORM_ADMIN NETWORK_ADMIN HOSPITAL_ADMIN }

model PlatformAdmin {
  id           String     @id @default(uuid())
  email        String     @unique
  name         String
  role         AdminRole  @default(PLATFORM_ADMIN)
  mfaEnabled   Boolean    @default(false)
  status       String     @default("ACTIVE") // ACTIVE | DISABLED
  lastLoginAt  DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  networkId    String?    // set when role = NETWORK_ADMIN
  permissions  Json?      @default("{}")
  sessions     AdminSession[]
  apiTokens    ApiToken[]
  @@map("platform_admins")
}

model AdminSession {
  id          String   @id @default(uuid())
  adminId     String   @map("admin_id")
  ip          String?
  userAgent   String?  @map("user_agent")
  deviceHash  String?  @map("device_hash")
  expiresAt   DateTime @map("expires_at")
  createdAt   DateTime @default(now())
  revokedAt   DateTime? @map("revoked_at")
  admin       PlatformAdmin @relation(fields: [adminId], references: [id], onDelete: Cascade)
  @@index([adminId])
  @@map("admin_sessions")
}

model ApiToken {
  id          String   @id @default(uuid())
  adminId     String   @map("admin_id")
  name        String
  hashedToken String   @map("hashed_token")
  scopes      String[] // e.g. ["hospital:read","event:replay"]
  lastUsedAt  DateTime? @map("last_used_at")
  expiresAt   DateTime? @map("expires_at")
  createdAt   DateTime @default(now())
  revokedAt   DateTime? @map("revoked_at")
  admin       PlatformAdmin @relation(fields: [adminId], references: [id], onDelete: Cascade)
  @@map("api_tokens")
}

// ===================== NETWORKS / ORGS =====================
model Network {
  id           String   @id @default(uuid())
  name         String
  parentOrgId  String?  @map("parent_org_id")
  region       String?
  ownerAdminId String?  @map("owner_admin_id")
  createdAt    DateTime @default(now())
  hospitals    HospitalsMaster[]
  admins       PlatformAdmin[]
  @@map("networks")
}

// Link table: hospital <-> network membership
model HospitalNetworkMembership {
  id          String   @id @default(uuid())
  hospitalId  String   @map("hospital_id")
  networkId   String   @map("network_id")
  role        String   @default("MEMBER") // MEMBER | HUB | SPOKE
  joinedAt    DateTime @default(now())
  hospital    HospitalsMaster @relation(fields: [hospitalId], references: [id], onDelete: Cascade)
  network     Network        @relation(fields: [networkId], references: [id], onDelete: Cascade)
  @@unique([hospitalId, networkId])
  @@map("hospital_network_membership")
}

// ===================== PLATFORM RBAC =====================
// Orthogonal to hospital-scoped RolePermission. Governs platform/network scope.
model PlatformPermission {
  id        String   @id @default(uuid())
  adminId   String   @map("admin_id")
  scope     String   // PLATFORM | NETWORK | HOSPITAL
  resource  String   // hospitals | subscriptions | flags | integrations ...
  action    String   // read | write | approve | suspend
  allowed   Boolean  @default(true)
  conditions Json?   @default("{}")
  admin     PlatformAdmin @relation(fields: [adminId], references: [id], onDelete: Cascade)
  @@unique([adminId, scope, resource, action])
  @@map("platform_permissions")
}

// ===================== FEATURE FLAGS =====================
model FeatureFlag {
  id           String   @id @default(uuid())
  key          String   @unique // e.g. "ai_scribe", "abdm_v2"
  name         String
  description  String?
  enabled      Boolean  @default(false)
  rolloutType  String   @default("GLOBAL") // GLOBAL | CANARY | BETA | OFF
  rolloutPct   Int      @default(0) @map("rollout_pct")
  betaHospitalIds String[] @map("beta_hospital_ids")
  createdBy    String   @map("created_by")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  history      FeatureFlagHistory[]
  @@map("feature_flags")
}

model FeatureFlagHistory {
  id        String   @id @default(uuid())
  flagId    String   @map("flag_id")
  changedBy String   @map("changed_by")
  prev      Json?
  next      Json?
  createdAt DateTime @default(now())
  flag      FeatureFlag @relation(fields: [flagId], references: [id], onDelete: Cascade)
  @@map("feature_flag_history")
}

// ===================== SUBSCRIPTIONS / SaaS =====================
model Plan {
  id           String   @id @default(uuid())
  name         String
  code         String   @unique // STARTER | GROWTH | ENTERPRISE
  priceMonthly Decimal  @map("price_monthly")
  priceAnnual  Decimal  @map("price_annual")
  quota        Json     // { beds, doctors, storageGb, aiCredits }
  features     String[]
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now())
  subs         Subscription[]
  @@map("plans")
}

model Subscription {
  id            String    @id @default(uuid())
  hospitalId    String    @unique @map("hospital_id")
  planId        String    @map("plan_id")
  status        String    @default("TRIAL") // TRIAL | ACTIVE | PAST_DUE | CANCELLED
  startDate     DateTime  @map("start_date")
  endDate       DateTime? @map("end_due")
  trialEndsAt   DateTime? @map("trial_ends_at")
  seatsUsed     Int       @default(0) @map("seats_used")
  usageMeters   Json?     @map("usage_meters") // { storageGb, aiCredits, apiCalls }
  createdAt     DateTime  @default(now())
  hospital      HospitalsMaster @relation(fields: [hospitalId], references: [id], onDelete: Cascade)
  plan          Plan          @relation(fields: [planId], references: [id])
  invoices      PlatformInvoice[]
  @@map("subscriptions")
}

model PlatformInvoice {
  id            String   @id @default(uuid())
  subscriptionId String  @map("subscription_id")
  number        String   @unique
  amount        Decimal
  tax           Decimal  @default(0)
  status        String   @default("UNPAID") // UNPAID | PAID | REFUNDED | FAILED
  periodStart   DateTime @map("period_start")
  periodEnd     DateTime @map("period_end")
  paidAt        DateTime? @map("paid_at")
  createdAt     DateTime @default(now())
  subscription  Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  @@map("platform_invoices")
}

// ===================== WEBHOOK / EVENT REGISTRY (platform) =====================
model WebhookSubscription {
  id           String   @id @default(uuid())
  name         String
  hospitalId   String?  @map("hospital_id") // NULL = platform-wide
  url          String
  secret       String
  eventTypes   String[] @map("event_types")
  isActive     Boolean  @default(true) @map("is_active")
  retryPolicy  Json?    @map("retry_policy")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deliveries   WebhookDelivery[]
  @@map("webhook_subscriptions")
}

model WebhookDelivery {
  id            String   @id @default(uuid())
  subscriptionId String  @map("subscription_id")
  eventId       String?  @map("event_id")
  statusCode    Int?     @map("status_code")
  attempts      Int      @default(0)
  nextRetryAt   DateTime? @map("next_retry_at")
  lastError     String?  @map("last_error")
  deliveredAt   DateTime? @map("delivered_at")
  createdAt     DateTime @default(now())
  subscription  WebhookSubscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  @@map("webhook_deliveries")
}

// ===================== CONSENT / COMPLIANCE =====================
model ConsentRecord {
  id           String   @id @default(uuid())
  hospitalId   String   @map("hospital_id")
  patientId    String   @map("patient_id")
  purpose      String   // CONSULT | RESEARCH | SHARING | MARKETING
  status       String   @default("GRANTED") // GRANTED | REVOKED | EXPIRED
  grantedAt    DateTime @default(now()) @map("granted_at")
  revokedAt    DateTime? @map("revoked_at")
  expiresAt    DateTime? @map("expires_at")
  artifactUrl  String?  @map("artifact_url") // signed consent PDF
  @@index([hospitalId, patientId])
  @@map("consent_records")
}

model DataExportRequest {
  id          String   @id @default(uuid())
  hospitalId  String?  @map("hospital_id")
  requestedBy String   @map("requested_by")
  type        String   // ERASURE | EXPORT | BREACH_REPORT
  status      String   @default("PENDING") // PENDING | PROCESSING | DONE | FAILED
  filters     Json?
  resultUrl   String?  @map("result_url")
  createdAt   DateTime @default(now())
  @@map("data_export_requests")
}

// ===================== MASTER DATA =====================
model MasterCode {
  id          String   @id @default(uuid())
  system      String   // ICD10 | LOINC | SNOMED | MEDICINE | CITY | STATE | INSURER
  code        String
  label       String
  parentCode  String?  @map("parent_code")
  extra       Json?
  @@unique([system, code])
  @@index([system])
  @@map("master_codes")
}

// ===================== UNIVERSAL SEARCH INDEX =====================
model SearchEntity {
  id          String   @id @default(uuid())
  kind        String   // hospital | doctor | patient | invoice | prescription | audit | event | report | user | config
  refId       String   @map("ref_id")
  hospitalId  String?  @map("hospital_id")
  tenantScope String   @default("PLATFORM") // PLATFORM | NETWORK | HOSPITAL
  title       String
  payload     Json?
  updatedAt   DateTime @updatedAt
  @@index([kind, hospitalId])
  @@index([title])
  @@map("search_entities")
}
```

> Note: `TenantConfigService.isFeatureEnabled` currently reads flags from
> `IntegrationConfig(provider='FEATURE_FLAGS')`. Migrate reads to the new `FeatureFlag`
> model; keep `IntegrationConfig` for per-hospital provider credentials only.

---

## 4. RBAC Matrix (Platform Layer)

Combines hospital `RolePermission` (hospital scope) with new `PlatformPermission` (platform/network scope).

| Resource | PLATFORM_ADMIN | NETWORK_ADMIN | HOSPITAL_ADMIN |
|----------|:---:|:---:|:---:|
| hospital:read (all) | ✅ | network only | own only |
| hospital:create | ✅ | ❌ | ❌ |
| hospital:verify | ✅ | ❌ | ❌ |
| hospital:suspend | ✅ | ❌ | ❌ |
| hospital:configure (own) | ✅ | ✅ | ✅ |
| user:manage (global) | ✅ | network | own |
| network:manage | ✅ | own | ❌ |
| subscription:read | ✅ | network | own |
| subscription:manage | ✅ | ❌ | ❌ |
| flag:read | ✅ | network | own |
| flag:write | ✅ | ❌ | ❌ |
| integration:read | ✅ | network | own |
| integration:write | ✅ | ❌ | own |
| event:replay | ✅ | ❌ | ❌ |
| audit:read (all) | ✅ | network | own |
| compliance:manage | ✅ | ❌ | own(PHI) |
| deploy:manage | ✅ | ❌ | ❌ |
| search:universal | ✅ | network | own |
| billing:reconcile | ✅ | ❌ | ❌ |

Enforcement: extend `packages/auth` with `requirePlatformRole(role)` and
`withPlatformPermission({scope, resource, action})`, mirroring `withPermission`.
`tenantContextMiddleware` stays for hospital scope; add `scopeContextMiddleware` that resolves
`req.scope` (`PLATFORM` | `NETWORK` | `HOSPITAL`) and `req.networkId`.

---

## 5. API Specification (Platform Admin)

Base prefix: `/api/platform/*`. Network: `/api/network/*`. Hospital: existing `/api/hospital/admin/*`.

```
GET    /api/platform/dashboard/executive          # KPIs, incident feed, version matrix
GET    /api/platform/hospitals                     # list (filter status/region/plan)
POST   /api/platform/hospitals                      # create hospital
GET    /api/platform/hospitals/:id
POST   /api/platform/hospitals/:id/verify           # license + ABDM verification
POST   /api/platform/hospitals/:id/activate
POST   /api/platform/hospitals/:id/suspend
POST   /api/platform/hospitals/:id/archive
POST   /api/platform/hospitals/:id/merge            # merge into target
GET    /api/platform/hospitals/:id/timeline
GET    /api/platform/users                          # global users
POST   /api/platform/users/bulk-invite
POST   /api/platform/users/bulk-disable
GET    /api/platform/networks                       # network admin
POST   /api/platform/networks
GET    /api/platform/subscriptions
POST   /api/platform/subscriptions/:id/invoice
GET    /api/platform/flags                           # feature flags
POST   /api/platform/flags                           # create
PATCH  /api/platform/flags/:key                     # enable/disable/canary/rollback
GET    /api/platform/integrations                   # webhook registry
POST   /api/platform/integrations/webhooks
POST   /api/platform/integrations/:id/rotate-secret
GET    /api/platform/events/live                     # SSE stream from EventBus
GET    /api/platform/events/catalog
POST   /api/platform/events/:id/replay
GET    /api/platform/events/dlq
GET    /api/platform/audit                           # audit center (immutable)
GET    /api/platform/compliance                      # DPDP/ABDM/consent
POST   /api/platform/compliance/export-request
GET    /api/platform/reporting                       # report builder
POST   /api/platform/reporting/scheduled
GET    /api/platform/ops                             # ops center (health, workers, DR)
GET    /api/platform/security                        # threat detection, blocked IPs
GET    /api/platform/ai                              # prompt mgmt, usage, costs
GET    /api/platform/cms                             # announcements, templates
GET    /api/platform/master-data/:system             # ICD10/LOINC/etc
GET    /api/platform/customer-success                # tickets, health score, NPS
GET    /api/platform/financial                       # revenue, reconciliation
GET    /api/platform/devops                          # deployments, env vars, secrets
GET    /api/platform/search?q=                       # universal search
```

All routes run through `requirePlatformRole` + `withPlatformPermission`. Every mutation
writes an `AuditLog` (`entity`, `entityId`, `action`, `details`) and publishes a
`DomainEvent` to `packages/events`.

---

## 6. Event Catalog (new platform events, add to `EVENT_TYPES`)

```
hospital_created
hospital_verified
hospital_activated
hospital_suspended
hospital_archived
hospital_merged
flag_changed            // { key, enabled, rolloutType, rolloutPct }
subscription_created
subscription_renewed
subscription_past_due
invoice_generated
invoice_paid
invoice_failed
webhook_registered
webhook_delivery_failed
webhook_secret_rotated
platform_user_invited
platform_user_disabled
consent_granted
consent_revoked
data_export_requested
data_erased
deploy_started
deploy_completed
deploy_rolled_back
security_alert_raised
rate_limit_triggered
ip_blocked
backup_completed
restore_completed
dr_drill_executed
```

Event bus integration: `EventBus.publish(...)` after DB commit; `OutboxEvent` sink +
`outbox-relay.worker.ts` for at-least-once delivery; `WebhookDelivery` tracks retries; DLQ =
`event_logs` with `status='DLQ'`.

---

## 7. Module → IA → Screens (Platform Admin)

Each module below is a left-nav section in `apps/admin-panel`. Full per-module detail
(Business Purpose, Personas, Layout, DB, API, Events, Permissions, Validation, Audit,
Notifications, Errors, Security, Offline, Perf, Analytics, Edge Cases, QA, Acceptance)
is generated by the sub-agent build-out (see §12). This table is the IA spine.

| # | Module | Nav section | Key screens |
|---|--------|-------------|-------------|
| 1 | Executive Dashboard | Overview | KPI grid, incident feed, version matrix, worker/queue health, live activity |
| 2 | Hospital Management | Hospitals | List, Create wizard, Verify, Timeline, Branding, Departments, Subscription, API keys |
| 3 | User & Identity | Users | Global users, role matrix, MFA, sessions, API tokens, bulk import/disable |
| 4 | Network Admin | Networks | Groups, regional networks, ownership, shared doctors/labs/PACS/billing |
| 5 | Subscription & SaaS | Billing | Plans, invoices, renewals, coupons, quota, metering, revenue |
| 6 | Feature Flag Center | Flags | List, enable/disable, canary, beta hospitals, rollback, migration status |
| 7 | Integration Hub | Integrations | Webhook registry, ABDM/FHIR/HL7/WhatsApp/SMS/PG/TPA, retry/DLQ, secret rotation |
| 8 | Event Bus Console | Events | Live stream (SSE), replay, DLQ, schema registry, catalog, consumers |
| 9 | Audit Center | Audit | PHI access, role/perm changes, exports, failed logins, timeline viewer (immutable) |
| 10 | Compliance Center | Compliance | DPDP, ABDM, consent, retention, erasure, cert expiry, encryption status |
| 11 | Reporting Center | Reports | Builder, saved/scheduled, CSV/Excel/PDF/encrypted, export queue + audit |
| 12 | Operations Center | Ops | Hospital/queue/offline status, Redis/DB/workers/cron, backup/restore, DR readiness |
| 13 | Security Center | Security | Threat detection, rate limits, blocked IPs, session hijack, token revocation |
| 14 | AI Administration | AI | Prompt mgmt, model select, usage, costs, guardrails, KB, agent registry |
| 15 | Content Management | CMS | Announcements, help center, email/WhatsApp/SMS/push templates, policy/terms |
| 16 | Master Data | Master Data | ICD-10/LOINC/SNOMED, medicines, departments, cities, insurers, vendors |
| 17 | Customer Success | Success | Tickets, health score, onboarding, training, NPS, renewal risk |
| 18 | Financial Control | Finance | Platform/hospital revenue, commission, settlements, reconciliation, outstanding |
| 19 | DevOps | DevOps | Deployments (blue/green, canary), DB migrations, env vars, secrets, health checks |
| 20 | Universal Search | (command palette) | Global search across all entities |

---

## 8. Folder Structure

```
apps/
  admin-panel/                 # PLATFORM_ADMIN portal (upgrade mock → real)
    app/
      (platform)/              # layout with ScopeGate scope=PLATFORM
        dashboard/page.tsx
        hospitals/{page,create,[id]/{overview,timeline,branding,departments,subscription,apikeys}}/...
        users/...
        networks/...
        billing/...
        flags/...
        integrations/...
        events/...
        audit/...
        compliance/...
        reports/...
        ops/...
        security/...
        ai/...
        cms/...
        master-data/...
        success/...
        finance/...
        devops/...
        search/...
      api/platform/...         # route handlers (§5)
    lib/{session,permissions,services}.ts
  network-admin/               # NETWORK_ADMIN portal (NEW)
    app/(network)/...
    app/api/network/...
    lib/{session,permissions,services}.ts
  hospital-hms/                # extend app/admin (HOSPITAL_ADMIN)
    app/admin/...
packages/
  admin-core/                  # shared admin primitives
    src/{ScopeGate,PermissionGate,KpiCard,AuditTimeline,DataTable,CommandPalette,usePlatformQuery}.tsx
```

---

## 9. Component Tree (Platform Admin shell)

```
<PlatformLayout>                      // sidebar nav (modules §7), topbar, scope switcher
  <ScopeGate scope="PLATFORM">        // redirects if role lacks platform scope
    <RouteSection module="hospitals">
      <HospitalList>
        <DataTable columns=... filter=... />
        <BulkActionBar />
      </HospitalList>
      <HospitalDetail>
        <TabBar>[Overview|Timeline|Verify|Branding|Departments|Subscription|APIKeys]</TabBar>
        <HospitalTimeline source=event_logs />
        <VerifyWorkflow />            // license + ABDM step machine
      </HospitalDetail>
    </RouteSection>
    ...
  </ScopeGate>
</PlatformLayout>
<CommandPalette />                     // Universal Search (module 20)
```

---

## 10. Route Structure (Platform Admin — `apps/admin-panel/app/(platform)`)

```
/               → redirect /dashboard
/dashboard
/hospitals
/hospitals/create
/hospitals/[id]
/hospitals/[id]/timeline
/hospitals/[id]/verify
/hospitals/[id]/branding
/hospitals/[id]/departments
/hospitals/[id]/subscription
/hospitals/[id]/apikeys
/users
/users/[id]
/networks
/networks/[id]
/billing
/billing/invoices
/flags
/integrations
/integrations/webhooks/[id]
/events
/events/dlq
/audit
/compliance
/reports
/ops
/security
/ai
/cms
/master-data
/success
/finance
/devops
/search
```

---

## 11. Offline Behaviour

- Admin portals are **operator consoles**, not field tools — **no offline-first requirement**.
- Exception: `CommandPalette` and last-loaded KPI snapshot cached in `localStorage` for
  read-only viewing during brief disconnects (patient-portal pattern: `offline-rbac.ts`).
- All writes require connectivity; mutations fail fast with a clear "reconnecting" banner.
- Cross-tenant ops must never be retried blindly — `NetworkOperationsService` already
  audit-logs both phases; replay safety via idempotency keys on `transferId`.

---

## 12. Build-Out Plan (sub-agent delegation)

Because this is 20 modules × 17 artifacts, implement via parallel sub-agents, each owning a
portal slice and writing to `apps/admin-panel`, `apps/network-admin`, `packages/admin-core`,
and `packages/db` migrations. Each sub-agent must:
1. Read the relevant existing model(s) in `packages/db/prisma/schema.prisma`.
2. Reuse `packages/auth` middleware (extend, don't fork).
3. Emit `AuditLog` + `DomainEvent` on every mutation.
4. Add a Prisma migration for any new model from §3.
5. Follow `packages/ui` (shadcn) conventions and `zod` validation.

Suggested agent split:
- **Agent A** — Platform shell + Executive Dashboard + Universal Search + `packages/admin-core`.
- **Agent B** — Hospital Management + User/Identity + Network Admin + Subscription/SaaS.
- **Agent C** — Feature Flags + Integration Hub + Event Bus Console + DevOps.
- **Agent D** — Audit + Compliance + Security + Reporting.
- **Agent E** — Ops + AI Admin + CMS + Master Data + Customer Success + Financial.

---

## 13. Testing Strategy

- **Unit**: zod schemas, RBAC `withPlatformPermission` decision logic, flag rollout math.
- **Integration** (`vitest`): API routes with seeded `HospitalsMaster`, assert `AuditLog` +
  `OutboxEvent` written; assert `PlatformPermission` enforced (403 on scope violation).
- **Event**: replay `DomainEvent` through `outbox-relay.worker` → assert `WebhookDelivery` state.
- **E2E** (`playwright`): Platform Admin login → verify hospital → suspend → audit trail visible.
- **Security**: `PLATFORM_ADMIN` cannot act on a hospital outside granted scope; secret rotation
  invalidates old webhook signatures; immutability of `audit_logs` (no update/delete route).

---

## 14. Production Readiness Checklist

- [ ] `FeatureFlag` migration applied; `TenantConfigService` migrated off `IntegrationConfig`.
- [ ] `PlatformPermission` enforced on every `/api/platform/*` + `/api/network/*` route.
- [ ] All 20 modules emit `AuditLog` + `DomainEvent`.
- [ ] Webhook deliveries retry with backoff; DLQ surfaced in Integration Hub.
- [ ] `audit_logs` has no UPDATE/DELETE path (immutable); WORM backup verified.
- [ ] MFA enforced for `PLATFORM_ADMIN` via `AdminSession`.
- [ ] Secret rotation endpoint re-signs webhooks with new `secret`.
- [ ] DR drill (`backup_completed`/`restore_completed` events) green in Ops Center.
- [ ] Rate limiting + IP block in Security Center wired to gateway.
- [ ] Universal Search indexed `SearchEntity` for all 11 entity kinds.
- [ ] Three portals share `packages/admin-core`; no duplicated RBAC logic.
- [ ] Load test: executive dashboard KPIs < 800ms p95 via read-replica/read-model.
```
