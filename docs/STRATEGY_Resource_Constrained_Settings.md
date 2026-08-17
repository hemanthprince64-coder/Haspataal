# Haspataal HMS 1 Roadmap
## Strategic Roadmap for Resource-Constrained Deployment — Benchmarked Against OpenMRS & Bahmni

---

## 1. Executive Summary

Haspataal is currently designed as a modern, cloud-first B2B2C Healthcare Operating System leveraging Next.js 15, PostgreSQL, Redis, BullMQ, Prisma, and a real-time chronic escalation engine. While this architecture provides exceptional scalability, low-latency performance, and rich UX in well-connected areas, deploying it in **resource-constrained settings**—such as rural clinics in low-and-middle-income countries (LMICs), mobile health clinics, or primary health centers (PHCs)—presents significant engineering and operational challenges:

1. **Network Connectivity**: Frequent power outages and internet down-times render cloud-only systems unusable.
2. **Bandwidth Limitations**: Heavy client-side JavaScript bundles and high-frequency API pooling degrade performance on 2G/3G networks or satellite connections.
3. **Hardware Capacity**: Rural clinics often operate on low-spec server hardware (e.g., dual-core Celeron CPUs, 4GB RAM) that cannot comfortably sustain a distributed containerized stack of PostgreSQL + Redis + BullMQ microservices.
4. **Data Standardization**: Healthcare reporting at public scales requires adherence to global standard concept dictionaries (ICD-11, LOINC, SNOMED-CT) and reporting frameworks (DHIS2, ABDM/FHIR), which are currently absent or abstract in Haspataal's custom database schema.

This document presents a **strategic roadmap** to adapt Haspataal into a resilient, offline-capable, and resource-optimized EMR platform. It benchmarks Haspataal's current stack against **OpenMRS** and **Bahmni**—the industry standards for global health deployments—and details specific architectural modifications to bridge the gaps while preserving Haspataal's unique competitive advantages (AI-assisted documentation, chronic care escalation engine, and unified patient portal).

---

## 2. Comparative Benchmarking: Haspataal vs. OpenMRS & Bahmni

The table below benchmarks Haspataal against OpenMRS (the core clinical platform) and Bahmni (the integrated clinic-in-a-box distribution built on OpenMRS, Odoo ERP, and OpenELIS lab) across critical resource-constrained criteria.

| Benchmarking Dimension | OpenMRS (Java Core) | Bahmni (OpenMRS + Odoo + OpenELIS) | Haspataal (Current Architecture) | Haspataal (Target Resource-Constrained Profile) |
| :--- | :--- | :--- | :--- | :--- |
| **Architectural Model** | Monolithic Java Spring web app, modular extension framework. | Multi-container system (OpenMRS API + Odoo + OpenELIS + HTML5 UI). | Next.js 15 Monorepo, PostgreSQL, Redis, BullMQ, Prisma. | Next.js Hybrid SSR/CSR, dual-mode queue, PostgreSQL/SQLite option. |
| **Offline-First Capabilities** | Built-in offline modules (Sync2 module utilizing CouchDB/PouchDB or custom serialization). | Bahmni Connect (offline-first PWA for field workers, syncing via REST APIs). | **None** (Requires active network connection to hit Next.js API routes). | **Hybrid Sync PWA**: Service Workers + Workbox + IndexedDB + CRDT conflict resolver. |
| **Bandwidth Consumption** | Low (mostly text-based UI, minimal client-side rendering engine). | Low-to-moderate (Bahmni Connect syncs small JSON deltas). | **High** (Next.js client-side bundle hydration, Sentry/PostHog trackers). | **Ultra-Low Bandwidth Mode**: Server-side React Server Components (RSC), disabled trackers, minimal JS. |
| **Hardware Overhead** | Low (can run on Raspberry Pi 4, 2GB RAM minimum). | Moderate-to-high (Odoo & OpenELIS require 8GB-16GB RAM for single-box deploy). | **High** (PostgreSQL, multiple Redis clients, BullMQ workers, Next.js Node server). | **Low Footprint Mode**: SQLite database (single file) or single pg instance, in-process queue (pg-boss/graphile). |
| **Data Standardization** | Excellent (OpenMRS Concept Dictionary - CIEL, SNOMED-CT, LOINC, ICD-10/11 maps). | Excellent (inherits OpenMRS Concept Dictionary; standard lab/pharmacy codes). | **Custom/Non-Standard** (Database entities use plain strings/enums without terminology maps). | **Concept Dictionary Layer**: Prisma models mapping fields to LOINC/SNOMED-CT; native FHIR JSONB formats. |
| **Form/Workflow Flexibility** | HTML Form Entry module, WYSIWYG Form Builders. | Bahmni Form Builder (dynamic JSON forms rendered dynamically). | **Static React Forms** (Hardcoded in Tailwind + shadcn/ui components). | **Dynamic JSON-to-Form Engine**: Offline-ready form engine rendering shadcn/ui from JSON schemas. |
| **Modular Modalities** | Limited to clinical EMR (requires extensions for lab/billing). | Complete (Clinical EMR + OpenELIS Lab + Odoo Pharmacy/Billing). | Core EMR (Clinical Care Plans, Appointments, Patient Portal). | **Unified Modular Monorepo**: Dedicated modules for lightweight Pharmacy, Labs, and Billing. |
| **Reportability / Export** | DHIS2 Integration Module, Reporting REST API. | Out-of-the-box DHIS2 mapping, custom JasperReports. | **Custom Analytics** (Supabase RLS dashboard and CSV exports). | **FHIR Adapter & DHIS2 Sync**: Native export to FHIR resources; automated DHIS2 aggregate reports. |
| **Localization & RTL** | Multilingual core, community translation packs, RTL support. | Multilingual (French, Spanish, Hindi, Arabic, RTL support). | **English Only** (Static UI text strings). | **Next-Intl + RTL Config**: Dynamic routing translations, CSS logical properties for RTL. |

---

## 3. Technical & Operational Recommendations

To transform Haspataal into an elite platform for resource-constrained clinics, we propose implementing targeted architectural wrappers, adapters, and fallback modes rather than re-writing the core engine. This ensures the cloud-first product remains cutting-edge while the offline-first/resource-constrained deployment acts as a configurable configuration.

```mermaid
graph TD
    subgraph Client Application (Browser / PWA)
        UI[shadcn/ui + Next.js App] --> |Reads/Writes| SyncEngine[Low-Bandwidth Sync Engine]
        SyncEngine --> |Offline Mode| IDB[(IndexedDB Local Cache)]
        SyncEngine --> |Online Mode| API[Next.js API Routes / RSC]
        Forms[Dynamic Form Engine] --> |Generates UI| UI
        LocalAI[Local WebLLM / ONNX] --> |Drafts OPD/Discharge| UI
    end

    subgraph local_server [Local Clinic Server (Single Box Deployment)]
        API --> |DB Queries| Prisma[Prisma Client]
        Prisma --> |Relational DB| pg[(PostgreSQL / SQLite)]
        InProcQueue[In-Process Job Queue: pg-boss] --> |Background Jobs| Prisma
        FHIR[FHIR Server Adapter] --> Prisma
    end

    subgraph central_cloud [Central Government / Health Cloud]
        pg --> |Asynchronous Replication| CloudDB[(Central Cloud DB)]
        pg --> |DHIS2 Report Export| DHIS2[National DHIS2 Instance]
        pg --> |ABDM Consent / Care Contexts| ABDM[ABDM FHIR Gateway]
    end
```

### Recommendation 3.1: Offline-First Capabilities (PWA + IndexedDB + Workbox)
* **PWA Service Worker**: Implement a service worker using Workbox to cache static assets (Next.js JS/CSS chunks, Google Fonts, SVGs) locally.
* **IndexedDB Local Storage**: Integrate Dexie.js or RxDB as a client-side database wrapper. Store:
  * Patient demographic records
  * Appointments for the next 7 days
  * Active Care Journeys (Escalations)
  * Dynamic Clinical Forms (JSON format)
* **Sync Protocol**:
  * **Asymmetric Offline Queue**: When offline, client mutations (e.g., creating clinical notes, completing appointments) are serialized as events (e.g., `PATIENT_MUTATION_CREATED`) and stored in an IndexedDB Outbox.
  * **Network Resilience**: A background synchronization task checks for network availability and replays the outbox events sequentially to the server endpoint `/api/sync/replay`.
  * **Conflict Resolution**: Implement a Last-Write-Wins (LWW) mechanism backed by client-side timestamps and user verification overrides for clinical data conflicts.

### Recommendation 3.2: Low-Bandwidth Mode (SSR/RSC & Asset Optimization)
* **RSC Over Client Components**: Leverage Next.js Server Components to do the heavy lifting on the server, sending pre-rendered HTML instead of massive JS bundles to the client. This reduces initial page load times on weak connections.
* **Tracker Curfew**: Disable heavy telemetry and tracking scripts (Sentry, PostHog, Google Analytics) when the client detects low network speed via the Network Information API (`navigator.connection.effectiveType`).
* **Optimized Image & Document Loading**: Automatically serve low-resolution placeholder SVGs for patient avatars and compress file uploads (e.g., diagnostic PDFs or clinic logos) on the client side before transmission.

### Recommendation 3.3: Low-Spec Hardware Support (Single-Server Footprint)
* **Redis/BullMQ Optionality**:
  * Create a modular **Job Queue Adapter interface** (`QueueService`).
  * In cloud/enterprise mode, compile with the standard `BullMQ` + `Redis` implementation.
  * In resource-constrained/local mode, swap the adapter to use `pg-boss` (PostgreSQL-based queue) or an in-process memory queue (e.g., `graphile-worker` or in-memory queues), removing the Redis service requirement entirely.
* **Database Swapping**: Maintain compatibility with SQLite via Prisma for extremely low-spec hardware (under 2GB RAM), while optimizing PostgreSQL for single-node installations by tuning configuration properties (e.g., reducing `shared_buffers`, `max_connections`, and worker processes).

### Recommendation 3.4: Concept Dictionary Layer
* **Prisma Schema Additions**: Introduce a `Concept` and `ConceptMap` database schema structure mapping clinical records to standardized codes:
  ```prisma
  model Concept {
    id          String       @id @default(uuid())
    name        String       // e.g., "Hypertension"
    description String?
    mappings    ConceptMap[]
    observations Observation[]
  }

  model ConceptMap {
    id          String   @id @default(uuid())
    conceptId   String
    concept     Concept  @relation(fields: [conceptId], references: [id])
    source      String   // e.g., "SNOMED-CT", "LOINC", "ICD-11"
    code        String   // e.g., "38341003"
    displayName String?
  }
  ```
* **Metadata Seeding**: Pre-seed the system with the **CIEL (Columbia International eHealth Laboratory)** concept dictionary subset, enabling standardized definitions for diagnoses, lab tests, and medications.

### Recommendation 3.5: Clinical Workflow Flexibility (Dynamic Forms Engine)
* **JSON-to-Form Parser**: Move away from hardcoded forms. Implement a JSON-schema-driven form engine utilizing `react-hook-form` and `zod`. 
* **Custom Form Builder**: Enable clinic administrators to upload form templates (JSON schemas) mapping input fields to standardized concepts. The frontend renders these schemas dynamically inside shadcn/ui wrappers:
  ```json
  {
    "formId": "opd-triage-v1",
    "title": "OPD Triage Form",
    "fields": [
      {
        "id": "systolic_bp",
        "label": "Systolic Blood Pressure",
        "type": "number",
        "conceptCode": "8480-6",
        "conceptSource": "LOINC",
        "validation": { "min": 50, "max": 250 }
      }
    ]
  }
  ```

### Recommendation 3.6: FHIR Compliance & ABDM Integration
* **FHIR Converter Utility**: Write an adapter layer translating Prisma models into standard HL7 FHIR (Fast Healthcare Interoperability Resources) JSON format:
  * `Patient` model ➡️ FHIR `Patient` resource
  * `Appointment` model ➡️ FHIR `Appointment` resource
  * `CareJourney` model ➡️ FHIR `CarePlan` resource
  * `Prescription`/`ClinicalRecord` models ➡️ FHIR `Encounter` and `Observation` resources
* **ABDM Gateways**: Integrate these FHIR objects with the Ayushman Bharat Digital Mission (ABDM) interfaces, enabling smooth consent flows and Health Information Provider (HIP) / Health Information User (HIU) capabilities.

### Recommendation 3.7: DHIS2 & Aggregate Reporting
* **Aggregate Reporting Worker**: Implement a scheduler (using the configured QueueService) to run nightly queries on clinical records (e.g., counting malaria cases by age group and gender).
* **DHIS2 API Client**: Push these aggregate figures directly to the national DHIS2 instance using the DHIS2 Web API (Data Value Sets endpoint) or export them as standard ADX (Aggregate Data Exchange) XML files for manual upload in air-gapped zones.

### Recommendation 3.8: SMS & Feature Phone Support
* **Curfew & Channel Escalation**: Haspataal's current curfew system restricts notification hours. Expand this system to support multi-channel routing:
  * High-priority escalations (e.g., `CHRONIC_ESCALATION_REQUIRED`) bypass curfews and route via interactive, multi-part SMS if push notifications/emails fail.
  * Implement an SMS gateway driver (Msg91 or Twilio) that handles asynchronous delivery receipts.
* **Interactive SMS (USSD/SMS Triage)**: Allow patient follow-ups via simple feature phones. The system sends a status query (e.g., "Are you experiencing shortness of breath? Reply YES or NO") and parses patient text responses to update Care Journey status tags asynchronously.

### Recommendation 3.9: Print-Friendly Offline Workflows
* **CSS Print Styling**: Optimize all clinical outputs (Prescriptions, Discharge Summaries, Lab Slips, Appointment Cards) with `@media print` CSS rules.
* **Zero-Screen Operations**: Enable a layout mode optimized for rapid dot-matrix printing or thermal receipt printing—common in rural clinics to minimize paper and power consumption.

### Recommendation 3.10: Adapting Haspataal's Unique Features
* **Chronic Escalation Engine**:
  * **Asynchronous Coordinator**: When a clinic server operates offline, escalations are calculated locally based on IndexedDB events. Assigning a central doctor is queued; the local doctor is marked as the primary reviewer until connection is restored.
* **AI Docs Service (OPD/Discharge Summaries)**:
  * **Hybrid LLM Execution**:
    * **Online Mode**: Hit the cloud LLM API for deep clinical summarization.
    * **Offline Mode (Local Engine)**: Load a quantized clinical model (e.g., `Llama-3-8B-Instruct-q4` or `gemma-2b-it`) in-browser using **WebLLM (WebGPU)** or trigger a local **Ollama** container running on the clinic server.
    * **Sync-Deferral Mode**: Queue the raw audio transcripts or physician shorthand notes in the IndexedDB sync outbox, processing the summaries when the clinic reconnects.

---

## 4. Haspataal HMS 1 Roadmap — Full-Ecosystem Phased Implementation

> *The original roadmap addressed only core clinical workflows (appointments, patient records, AI/escalation). A [full codebase audit](#appendix-a-26-feature-inventory) identified **26 major production features** whose offline/low-spec/resource-constrained behavior was completely undefined — including retention funnels, pharmacy inventory, ward management, financial settlements, granular RBAC, marketplace discovery, slot booking engines, and more. This revised roadmap integrates all 26 features alongside the [Bihar Gap Analysis](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/GAP_ANALYSIS_Resource_Constrained_Bihar.md) findings into a comprehensive 32-week plan.*

A phased approach reduces technical risk. Each phase builds on the previous one's infrastructure:

```
  Phase 1: Infrastructure         Phase 2: Offline Core           Phase 3: Clinical Ecosystem      Phase 4: Field Hardening
  Foundation (Wk 1–6)             & UX (Wk 7–14)                 & Compliance (Wk 15–24)          & Frontier (Wk 25–32)
 ┌─────────────────────────────┐ ┌─────────────────────────────┐ ┌─────────────────────────────┐ ┌─────────────────────────────┐
 │ • QueueService Abstraction  │ │ • PWA + Workbox Cache       │ │ • Concept Dictionary / CIEL │ │ • Local AI Engine           │
 │ • SQLite / Light pg Mode    │ │ • IndexedDB + Dexie.js      │ │ • FHIR Adapter + ABDM HIP   │ │ • Interactive SMS / USSD    │
 │ • docker-compose.local.yml  │ │ • Asymmetric Sync Outbox    │ │ • DHIS2 Aggregate Worker    │ │ • Thermal / Dot-Matrix CSS  │
 │ • Transactional Outbox →    │ │ • RSC + Tracker Curfew      │ │ • Offline Billing + UPI QR  │ │ • Offline Escalation Engine │
 │   pg-boss adaptation        │ │ • i18n (Hindi / Bhojpuri)   │ │ • Pharmacy & Drug Stock     │ │ • Marketplace Offline Cache │
 │ • Circuit Breaker Offline   │ │ • Voice Input (Web Speech)  │ │ • IPD / Wards / Bed Mgmt    │ │ • Agent / CMO Portals Sync  │
 │ • RBAC Offline Permission   │ │ • Smart Slot (Local Lock)   │ │ • Retention Engine Offline  │ │ • Consultant Settlement     │
 │   Cache                     │ │ • Waitlist (Local Mode)     │ │ • Follow-Up Workers (local) │ │   Batch Export              │
 │ • Clinic Operational Profile│ │ • No-Show Recovery (Local)  │ │ • Care Journeys Offline     │ │ • TTS Prescription Readback │
 │ • JSON Dynamic Form Engine  │ │ • Hospital Setup Wizard     │ │ • MedChat Triage (Local)    │ │ • Data Migration Wizard     │
 │ • OPD Config (Token Mode)   │ │   Offline Bootstrap         │ │ • Dept Handoff / Patient    │ │   Offline Import            │
 │                             │ │ • Notification Template     │ │   Flow Offline              │ │                             │
 │                             │ │   Offline Queueing          │ │ • Internal Referral Tracker │ │                             │
 │                             │ │ • Dashboard KPI Local Cache │ │ • Billing Wallet Offline    │ │                             │
 │                             │ │                             │ │ • PMJAY Claim Formats       │ │                             │
 └─────────────────────────────┘ └─────────────────────────────┘ └─────────────────────────────┘ └─────────────────────────────┘
  Features: #11 #18 #19 #23 #25   Features: #3 #9 #10 #15 #16 #17  Features: #1 #2 #4 #5 #6 #7     Features: #14 #22 #24 #26
  + infra foundations              + offline core ops                #8 #20 #21 + compliance          + AI/SMS/print/field ops
```

---

### Phase 1: Infrastructure Foundation — Immediate Survival (Weeks 1–6)

> **Goal**: Make Haspataal physically runnable on a Bihar PHC's refurbished desktop (2–4 GB RAM). Adapt the infrastructure-level patterns (outbox, circuit breaker, RBAC, OPD config) for Redis-free, single-server operation. Every subsequent phase depends on this foundation.

**Gap Analysis Reference**: [Section 3.2 — Device & Hardware Constraints](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/GAP_ANALYSIS_Resource_Constrained_Bihar.md)

#### 1A. Core Infrastructure (Existing Roadmap Items)

| # | Milestone | Source | Bihar Context |
|:---:|:---|:---|:---|
| 1.1 | **`docker-compose.local.yml` profile**: Single-box Docker Compose targeting 2–4 GB RAM. Tune PostgreSQL (`shared_buffers=128MB`, `max_connections=20`, `work_mem=2MB`). Remove Redis and BullMQ containers. | Infra Gap (🔴 Critical) | Bihar PHCs run on donated Core 2 Duo machines with 2 GB RAM. |
| 1.2 | **`QueueService` Interface + `PgBossQueueAdapter`**: Refactor `lib/queue.js` and `lib/infrastructure/queues.ts` into a common `QueueService` interface. Provide `BullMQQueueAdapter` (cloud) and `PgBossQueueAdapter` (local) toggled by `QUEUE_DRIVER=pg-boss`. | Infra Gap (🔴 Critical) | Eliminates Redis dependency, reclaiming ~500 MB idle RAM. |
| 1.3 | **SQLite Prisma Provider (Env-Switched)**: Support `sqlite` via `DATABASE_PROVIDER` env flag with migration compatibility shims (no enums, no arrays). | Infra Gap (🔴 Critical) | SQLite reduces idle RAM to ~400 MB for sub-2 GB machines. |
| 1.4 | **JSON Dynamic Form Engine**: Schema-to-component mapper using `react-hook-form` + `zod` rendering shadcn/ui from JSON schemas in `/public/forms/`. | Dynamic Forms (🟠 High) | Lets Bihar NHM push government forms (ANC, TB screening) without code changes. |

#### 1B. Feature Adaptations — Infrastructure-Level Features (#11, #18, #19, #23, #25)

| # | Feature | Codebase Location | Resource-Constrained Adaptation |
|:---:|:---|:---|:---|
| F-18 | **Transactional Outbox Pattern** | `lib/infrastructure/outbox-worker.ts` | Currently relays events from a PostgreSQL outbox table to BullMQ. **Adapt**: When `QUEUE_DRIVER=pg-boss`, the outbox relay writes directly to pg-boss job tables instead of BullMQ, removing the Redis dependency while preserving exactly-once delivery guarantees. In SQLite mode, implement a lightweight polling relay that reads the outbox table every 5 seconds and executes handlers in-process. |
| F-19 | **Circuit Breaker Pattern** | `lib/infrastructure/circuit-breaker.ts` | Protects external service calls (SMS, Razorpay, ABDM). **Adapt**: In offline/low-bandwidth mode, the circuit breaker should default to **OPEN state** for all cloud-dependent services (Razorpay, Sentry, PostHog, cloud AI). Queues failed requests into the sync outbox for retry when online. Add a local fallback registry: e.g., if SMS circuit is open, log the message locally for batch-send on reconnect. |
| F-11 | **Granular RBAC** | `RolePermission`, `HospitalRole`, `Staff` models, `lib/auth/requireRole.ts` | 9 roles (SUPER_ADMIN → PATIENT) with module-action permissions. **Adapt**: On login sync, cache the user's full permission matrix in IndexedDB. Offline permission checks read from this cache. When a new staff member is created offline, assign a default role (RECEPTIONIST) locally; full permission assignment defers to sync. Add a `lastSyncedAt` timestamp to detect stale permission caches (>24h = warn user). |
| F-23 | **Clinic Operational Profile** | `ClinicOperationalProfile` model | Captures clinic-specific operational data. **Adapt**: This becomes the **deployment mode configuration source**. Add fields: `deploymentMode` (CLOUD / LOCAL / HYBRID), `primaryLanguage`, `offlineEnabled`, `printerType` (THERMAL_80MM / DOT_MATRIX / LASER / NONE), `paymentModes` (CASH / UPI / RAZORPAY), `networkProfile` (BROADBAND / 3G / 2G / OFFLINE). All feature toggles read from this profile at startup. |
| F-25 | **OPD Configuration (Token Mode)** | `OpdConfig` model | Token mode, FIFO smart slots, overbooking, no-show policies, emergency reserves. **Adapt**: OPD config is critical for daily clinic operations. Cache the full `OpdConfig` in IndexedDB on sync. Token sequence generation must work offline using a local auto-increment counter. When sync resumes, reconcile token numbering with the server (server-authoritative, local tokens get remapped if conflicts detected). |

**Phase 1 Deliverables**:
- [ ] `docker-compose.local.yml` starts on a 2 GB RAM machine
- [ ] `QUEUE_DRIVER=pg-boss` swaps the queue engine; all existing workers function identically
- [ ] `DATABASE_PROVIDER=sqlite` generates a working SQLite database with seed data
- [ ] Outbox relay works with pg-boss (no Redis)
- [ ] Circuit breaker defaults to OPEN for cloud services when offline
- [ ] RBAC permission matrix caches in IndexedDB
- [ ] `ClinicOperationalProfile` drives deployment mode toggles
- [ ] OPD token generation works offline with local sequence
- [ ] Sample JSON form (`opd-triage-v1.json`) renders correctly

**Gaps Closed**: 🔴 Low-Spec Hardware (§3.3) · 🟠 Dynamic Forms (§3.5) · Features #11, #18, #19, #23, #25 adapted

---

### Phase 2: Offline Core & UX — Operational Resilience (Weeks 7–14)

> **Goal**: Enable a Bihar PHC to remain **100% operational** during 6–12 hour power/internet outages. Adapt the operational features that clinic staff interact with hourly — slot booking, waitlists, no-show recovery, notification templates, hospital setup, and dashboards — for fully offline use. Close the 3 remaining 🔴 Critical gaps (offline, bandwidth, i18n).

**Gap Analysis Reference**: [Section 3.1 — Connectivity & Power](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/GAP_ANALYSIS_Resource_Constrained_Bihar.md) · [Section 3.3 — Language & Digital Literacy](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/GAP_ANALYSIS_Resource_Constrained_Bihar.md)

#### 2A. Core Offline & UX (Existing Roadmap Items)

| # | Milestone | Gap Addressed | Severity |
|:---:|:---|:---|:---:|
| 2.1 | **PWA + Workbox Service Worker**: Pre-cache static assets and form schemas. Stale-while-revalidate for API routes. | Offline-First (§3.1) | 🔴 Critical |
| 2.2 | **IndexedDB Client-Side Database (Dexie.js)**: Mirror `Patient`, `Appointment`, `Visit`, `CareJourney`, `Observation`, `Bed`, `DrugStock`, `Invoice` tables locally. Selective sync on login. | Offline-First (§3.1) | 🔴 Critical |
| 2.3 | **Asymmetric Sync Outbox + `/api/sync/replay`**: Offline mutations stored as timestamped events. LWW conflict resolution with manual review UI. | Offline-First (§3.1) | 🔴 Critical |
| 2.4 | **Low-Bandwidth Mode (RSC + Tracker Curfew)**: Detect 2G/EDGE via Network Information API. Disable PostHog/Sentry. Force RSC rendering. | Low-Bandwidth (§3.2) | 🔴 Critical |
| 2.5 | **i18n Framework (`next-intl`)**: Hindi (`hi`) and Bhojpuri (`bho`) locale packs. CSS logical properties for RTL readiness. | Localization (i18n) | 🔴 Critical |
| 2.6 | **Voice-Based Form Input (Web Speech API)**: Microphone button on form fields for Hindi speech-to-text transcription. | Low Literacy | 🟠 High |

#### 2B. Feature Adaptations — Daily Operations Features (#3, #9, #10, #15, #16, #17)

| # | Feature | Codebase Location | Resource-Constrained Adaptation |
|:---:|:---|:---|:---|
| F-15 | **Smart Slot Booking Engine** | `lib/infrastructure/slot-engine.ts` | Uses Redlock (Redis distributed locking) and SERIALIZABLE transactions. **Adapt**: In local mode, replace Redlock with a PostgreSQL advisory lock (`pg_advisory_xact_lock`) or SQLite WAL-mode exclusive write lock. For offline PWA booking, use an optimistic client-side reservation with a 15-minute hold; conflicts resolved on sync replay. Idempotency keys continue to work via IndexedDB deduplication. |
| F-16 | **Waitlist Service** | `lib/infrastructure/waitlist-service.ts` | Priority-based waitlists with auto-notify. **Adapt**: Cache the active waitlist in IndexedDB. Offline additions get a local priority score. When a slot opens (via no-show or cancellation), the local engine auto-promotes the top waitlisted patient. Notification is queued in the outbox for SMS delivery on reconnect. |
| F-17 | **No-Show Recovery Service** | `lib/infrastructure/no-show-service.ts` | Auto-identifies no-shows after grace period; frees slots. **Adapt**: The no-show scanner runs as a pg-boss scheduled job (or in-process timer in SQLite mode). Grace period and slot-freeing logic execute entirely locally. Freed slots feed into the local waitlist auto-promotion engine. No-show statistics sync to the central dashboard on reconnect. |
| F-10 | **Notification Template Engine** | `NotificationTemplate`, `NotificationEventMapping`, `services/notification.service.ts` | Template-driven multi-channel delivery (WhatsApp/SMS/Email) with curfew awareness. **Adapt**: Cache all `NotificationTemplate` records and `NotificationEventMapping` rules in IndexedDB on sync. When events fire offline (e.g., appointment confirmed), render the template locally and store the rendered message + channel + recipient in the sync outbox. On reconnect, the outbox replays through the appropriate channel gateway (Msg91/Twilio/Resend). Curfew logic runs locally using the device clock. |
| F-3 | **Hospital Setup Wizard** | `lib/setup/completion-engine.ts`, `components/setup-wizard/`, `components/onboarding/` | 12-step onboarding wizard. **Adapt**: The setup wizard must work **fully offline** for initial clinic bootstrapping — a Bihar PHC being set up for the first time may not have internet. All 12 steps (identity → branches → departments → staff → doctors → OPD → billing → pharmacy → diagnostics → integrations → retention → marketplace) save to local database. The completion engine tracks progress locally. On first sync, the full hospital profile uploads to the central server. Mark integration-dependent steps (ABDM, payment gateways) as "deferred — requires connectivity". |
| F-9 | **Analytics, Dashboards & KPIs** | `services/dashboard.service.ts`, `services/analytics.service.ts` | Bed occupancy, appointment stats, revenue tracking, conversion rates, retention KPIs. **Adapt**: Implement a **local analytics cache** that computes daily KPIs from IndexedDB data (today's appointments, revenue, bed occupancy, no-show rate). Display a "Local Data — Last Synced: [timestamp]" badge on the dashboard. Full historical analytics and cross-clinic comparisons only available when online. The event-driven analytics worker runs via pg-boss locally, computing aggregates on a nightly schedule. |

**Phase 2 Deliverables**:
- [ ] App installs as a PWA and loads fully from cache when offline
- [ ] Patient registration, appointment creation, and slot booking work offline
- [ ] Waitlist auto-promotes when slots freed by no-show recovery
- [ ] Notification templates render locally; messages queue for batch send on reconnect
- [ ] Hospital setup wizard completes all 12 steps offline for new clinic bootstrapping
- [ ] Local dashboard shows today's KPIs from IndexedDB data
- [ ] Conflict resolution UI for manual merges on sync
- [ ] PostHog/Sentry auto-disable on 2G; page loads <200 KB
- [ ] Full Hindi and Bhojpuri locale packs
- [ ] Voice input functional on Chrome Android for Hindi

**Gaps Closed**: 🔴 Offline-First (§3.1) · 🔴 Low-Bandwidth (§3.2) · 🔴 Localization (i18n) · Features #3, #9, #10, #15, #16, #17 adapted

---

### Phase 3: Clinical Ecosystem & Compliance (Weeks 15–24)

> **Goal**: Adapt all clinical and financial features for offline operation. Achieve mandatory ABDM/FHIR/DHIS2 compliance. This is the largest phase because it covers the richest part of Haspataal's ecosystem: retention funnels, follow-up workers, care journeys, MedChat triage, pharmacy/drug stock, IPD/wards, comprehensive billing, department handoffs, and internal referrals.

**Gap Analysis Reference**: [Section 3.5 — Government Compliance](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/GAP_ANALYSIS_Resource_Constrained_Bihar.md) · [Section 3.6 — Payment & Billing](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/GAP_ANALYSIS_Resource_Constrained_Bihar.md)

#### 3A. Compliance & Standards (Existing Roadmap Items)

| # | Milestone | Gap Addressed | Severity |
|:---:|:---|:---|:---:|
| 3.1 | **Concept Dictionary** (`Concept` + `ConceptMap` Prisma Models) — CIEL seed with Bihar disease burden (malaria, kala-azar, TB, ANC). | Concept Dictionary (§3.4) | 🟠 High |
| 3.2 | **FHIR Converter Adapter + ABDM HIP Gateway** — Replace `lib/abdm.js` stub. Prisma-to-FHIR mappers. Consent flows. | FHIR / ABDM (§3.6) | 🔴 Critical |
| 3.3 | **DHIS2 Aggregate Reporting Worker** — Nightly scheduled job counting clinical events by age/gender/district. ADX XML export for air-gapped clinics. | DHIS2 Reporting (§3.7) | 🟠 High |
| 3.4 | **Offline-Capable Billing with UPI QR + Cash Logging** — Cash transactions, UPI QR generation, Razorpay removal for local mode. | Offline Billing (§3.6) | 🟡 Medium |
| 3.5 | **PMJAY Claim Format Support** — Standard e-claim format with ABHA IDs and procedure codes. Batch export. | ABDM / Insurance (§3.6) | 🟡 Medium |

#### 3B. Feature Adaptations — Clinical & Operational Features (#1, #2, #4, #5, #6, #7, #8, #20, #21)

| # | Feature | Codebase Location | Resource-Constrained Adaptation |
|:---:|:---|:---|:---|
| F-1 | **Patient Retention Engine** | `services/retention.service.ts`, `apps/patient-portal/app/api/hospital/retention/...` | Automated follow-up scheduling across care pathways (Pregnancy, Pediatrics, Chronic Disease, General) with retention KPIs and revenue attribution. **Adapt**: Cache active retention rules and pathway definitions in IndexedDB. The retention scheduler runs as a local pg-boss cron job computing which patients are due for follow-up based on their pathway stage. Follow-up appointments are auto-generated locally. Revenue attribution metrics compute locally and sync to the central analytics dashboard. In offline mode, pathway rules are deterministic — no cloud dependency. |
| F-2 | **Follow-Up System with Workers** | `workers/followup.worker.ts`, `FollowUp`/`FollowUpPlan` models | Nightly scan for due/missed follow-ups; triggers chronic escalation when thresholds crossed. **Adapt**: The `followup.worker.ts` must run via the `QueueService` abstraction (pg-boss locally). Nightly scan queries the local database for overdue follow-ups. When escalation thresholds are crossed, queue `CHRONIC_ESCALATION_REQUIRED` events locally. The escalation is computed and assigned to the local doctor immediately (see Phase 4 offline escalation). Central specialist assignment defers to sync. |
| F-4 | **Care Journeys & Recovery Tracking** | `lib/services/care-lifecycle.ts`, `CareJourney`, `RecoveryStep`, `MedicationPlan` models | 14-day recovery steps, medication plans, red flags, nudge schedules, check-ins. **Adapt**: Sync the patient's active `CareJourney` with all `RecoveryStep` and `MedicationPlan` records to IndexedDB. Check-in recording works offline (timestamped observations). Red flag detection rules execute locally — if a patient reports a red flag symptom during an offline check-in, trigger a local alert to the attending doctor. Nudge schedule reminders queue in the notification outbox for SMS delivery on reconnect. |
| F-5 | **MedChat Triage Engine** | `lib/medchat/triage-engine.js`, `lib/medchat/symptoms-db.js`, `services/medchat/main.py` | Deterministic clinical triage with red flag detection, pediatric rules, seasonal patterns, jailbreak protection. **Adapt**: The triage engine is **deterministic** (rule-based, not LLM-dependent), making it ideal for offline use. Bundle `symptoms-db.js` (symptom database) and `triage-engine.js` (rule engine) as cached PWA assets. Triage runs entirely client-side. The Python service (`main.py`) is only needed for advanced ML-based pattern matching — skip in offline mode. Triage results write to IndexedDB and sync when online. Seasonal pattern data syncs weekly when connectivity is available. |
| F-6 | **Pharmacy & Drug Stock Management** | `DrugStock`, `Supplier`, `PharmacyDispense` models, `app/api/hospital/pharmacy/...` | Drug stock tracking, batch/expiry alerts, supplier management, dispensing workflows. **Adapt**: Mirror `DrugStock` and `PharmacyDispense` tables in IndexedDB. Stock decrements on dispensing are immediate and local. Batch/expiry alert checks run as a local pg-boss daily cron. **Critical offline behavior**: Stock levels are authoritative locally — if two terminals dispense the same drug offline, sync reconciliation uses the sum of decrements (additive merge, not LWW) to compute the correct remaining stock. Supplier management is cloud-only (syncs when available). Low-stock alerts render locally based on configurable thresholds in `ClinicOperationalProfile`. |
| F-7 | **IPD / Wards / Bed Management** | `Bed`, `Unit`, `Admission`, `Department` models, `app/api/hospital/ipd/...` | Bed/ward tracking (GENERAL, ICU, NICU, PRIVATE, SEMI_PRIVATE, EMERGENCY), admissions, discharges. **Adapt**: Cache the full bed map (typically <200 beds for a PHC/small hospital) in IndexedDB. Admissions, transfers, and discharges update the local bed map immediately. Bed occupancy KPI computes locally for the dashboard. **Conflict risk**: Two terminals admitting to the same bed offline — resolve on sync by flagging the conflict and requiring manual reassignment by a NURSE or HOSPITAL_ADMIN role. |
| F-8 | **Comprehensive Billing & Wallet** | `Bill`, `Invoice`, `InvoiceLineItem`, `Wallet`, `PaymentGateway` models | Invoice generation, multi-gateway payments, GST, line-item taxes, patient wallet. **Adapt**: Invoice generation and line-item computation (including GST calculations) work fully offline using locally cached tax rates. Payment recording in offline mode supports CASH and UPI-QR only (Razorpay/Stripe require connectivity — circuit breaker auto-opens). Patient wallet balance tracks locally with a "pending sync" badge. Wallet top-ups via online gateways queue for processing on reconnect. All invoice PDFs generate locally using the dynamic form engine's PDF renderer. |
| F-20 | **Department Handoff / Patient Flow** | `DepartmentHandoff` model | Tracks patient movement: Reception → Triage → Consultation → Lab → Pharmacy → Billing → Discharge. **Adapt**: The handoff chain is a critical real-time workflow in busy clinics. Mirror the `DepartmentHandoff` table in IndexedDB. Each station (Reception terminal, Lab terminal) updates the patient's current stage locally. Use a simple polling mechanism (30-second interval from IndexedDB) to update the patient flow board on other terminals in the same local network. On sync, handoff timestamps reconcile with the server. |
| F-21 | **Internal Referral Tracker** | `InternalReferral` model | Inter-departmental and inter-doctor referrals with priority and status. **Adapt**: Referrals created offline store in IndexedDB with status `PENDING_SYNC`. The receiving doctor sees the referral on their local terminal immediately (local network polling). Priority levels (URGENT, ROUTINE, STAT) drive local notification alerts. On sync, referral records upload to the central server for cross-facility visibility. |

**Phase 3 Deliverables**:
- [ ] Concept Dictionary seeded with Bihar-relevant CIEL terms
- [ ] ABDM HIP gateway handles consent and pushes FHIR bundles
- [ ] DHIS2 nightly export runs and submits aggregate reports
- [ ] Cash billing and UPI QR generation work fully offline
- [ ] PMJAY claim documents generate from completed encounters
- [ ] Retention engine schedules follow-ups offline using cached pathway rules
- [ ] Follow-up worker runs nightly via pg-boss; triggers local escalation on threshold breach
- [ ] Care journey check-ins and red flag detection work offline
- [ ] MedChat triage runs entirely client-side from cached symptom database
- [ ] Drug stock decrements on dispensing are immediate and local; sync uses additive merge
- [ ] Bed admissions/discharges update the local bed map; conflicts flagged on sync
- [ ] Invoice generation with GST works offline; Razorpay/Stripe circuit-broken
- [ ] Patient flow board updates across local terminals via polling
- [ ] Internal referrals visible immediately on local network

**Gaps Closed**: 🟠 Concept Dictionary · 🔴 FHIR/ABDM · 🟠 DHIS2 · 🟡 Offline Billing · Features #1, #2, #4, #5, #6, #7, #8, #20, #21 adapted

---

### Phase 4: Field Hardening & Frontier Operations (Weeks 25–32)

> **Goal**: Reach the 60%+ of Bihar patients on feature phones, adapt AI and chronic escalation for fully disconnected operation, optimize print workflows, and adapt the remaining ecosystem features — marketplace discovery, agent/CMO portals, consultant settlements, and data migration — for resource-constrained deployments.

**Gap Analysis Reference**: [Section 3.4 — Feature Phone Penetration](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/GAP_ANALYSIS_Resource_Constrained_Bihar.md) · [Section 3.7 — Thermal Printing](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/GAP_ANALYSIS_Resource_Constrained_Bihar.md)

#### 4A. Core Field Hardening (Existing Roadmap Items)

| # | Milestone | Gap Addressed | Severity |
|:---:|:---|:---|:---:|
| 4.1 | **Interactive SMS Engine (Msg91 / Twilio)**: Two-way SMS with structured response parsing. Templates for appointments, medication reminders, symptom surveys. | SMS / Feature Phone (§3.8) | 🟠 High |
| 4.2 | **USSD Triage Fallback**: Appointment booking and symptom check-ins from feature phones without data. | SMS / Feature Phone (§3.8) | 🟠 High |
| 4.3 | **Thermal Receipt CSS (80mm ESC/POS)**: `@media print` for OPD slips, prescriptions, billing receipts (with UPI QR), appointment cards, discharge summaries. Hindi/Bhojpuri support. | Print Workflows (§3.9) | 🟡 Medium |
| 4.4 | **Dot-Matrix Print Layout**: 132-column profile for multi-part discharge summaries and lab reports. Monospace fonts, ASCII borders. | Print Workflows (§3.9) | 🟡 Medium |
| 4.5 | **Offline Chronic Escalation Engine**: Compute escalation scores locally from IndexedDB. Local doctor as primary reviewer; central specialist assignment deferred to sync. | Offline Escalation (§3.10) | 🟠 High |
| 4.6 | **Local AI Documentation Fallback (WebLLM / Ollama)**: Hybrid routing — cloud Gemini (online), local Ollama (server), sync-deferral (offline queue). | Offline AI Docs (§3.10) | 🟠 High |
| 4.7 | **TTS Prescription Readback**: `SpeechSynthesis` API with Hindi voice packs. "Read Aloud" button on prescriptions. | Accessibility / Literacy | 🟡 Medium |

#### 4B. Feature Adaptations — Ecosystem & Oversight Features (#14, #22, #24, #26)

| # | Feature | Codebase Location | Resource-Constrained Adaptation |
|:---:|:---|:---|:---|
| F-14 | **Marketplace & Discovery** | `PatientAcquisition` model, `app/api/marketplace/...` | Hospital/doctor listings with ranking scores, fees, online booking, patient acquisition tracking. **Adapt**: The marketplace is inherently a cloud-connected, multi-hospital feature. **For local mode**: Cache a read-only snapshot of nearby hospitals and doctors (within the district) in IndexedDB during sync. Patients can browse the cached directory and bookmark doctors offline. Actual cross-hospital booking queues in the sync outbox. Patient acquisition tracking events (how a patient found this clinic) log locally and batch-upload on sync. In fully offline-only deployments (single PHC), the marketplace module is disabled via `ClinicOperationalProfile.deploymentMode`. |
| F-22 | **Consultant Settlement** | `ConsultantSettlement` model | Automated consultant payment calculations with revenue share and settlement periods. **Adapt**: Settlement computation is a back-office financial function that does not need real-time connectivity. **Local mode**: Accumulate revenue share data from locally recorded invoices and consultations. Run a weekly pg-boss job that computes settlement amounts per consultant using the cached revenue share rules. Generate settlement reports as printable PDFs (using the thermal/dot-matrix print templates). Actual disbursement (bank transfer) is cloud-only — queue for processing on sync. Export settlement data as CSV for manual bank upload in fully air-gapped clinics. |
| F-24 | **Data Migration Wizard** | `components/migration-wizard/...` | Legacy data import with column mapping, validation, and progress tracking. **Adapt**: This is **critical for Bihar PHC onboarding** — clinics transitioning from paper registers or legacy software need to import patient histories. **Offline adaptation**: The migration wizard must work entirely offline since the new clinic may not have internet during setup. Support CSV/Excel import with local column-mapping UI. Validation rules run client-side (duplicate detection, format checks, required fields). Progress tracking saves to IndexedDB. Imported records feed into the local database immediately. On first sync, the migrated dataset uploads to the central server. Add a Bihar-specific import template for the standard NHM patient register format. |
| F-26 | **Agent / CMO Portals** | `app/(agent)/...`, `components/cmo-dashboard/...` | Commission-based agent portal and Chief Medical Officer multi-hospital oversight. **Adapt**: **Agent Portal**: Agents operate in the field with unreliable connectivity. Cache the agent's assigned hospital list, commission rules, and patient referral history in IndexedDB. New patient referrals log locally. Commission calculations run locally using cached rules. Settlement reports sync on reconnect. **CMO Dashboard**: The CMO oversees multiple hospitals — this is inherently a connected, cloud-aggregated view. **Partial offline**: Cache the last-synced KPI snapshot for each hospital (today's patient count, bed occupancy, revenue). Display a "Last Synced: [timestamp]" badge. Full drill-down analytics require connectivity. Alert thresholds (e.g., bed occupancy >90%) trigger local CMO notifications from the cached data. |

**Phase 4 Deliverables**:
- [ ] Two-way SMS flow: appointment confirmation sent, patient reply parsed, Care Journey updated
- [ ] USSD session allows appointment booking from a feature phone
- [ ] OPD slip and prescription print correctly on 80mm thermal receipt paper in Hindi
- [ ] Dot-matrix discharge summary renders on 132-column continuous paper
- [ ] Chronic escalations compute locally during offline periods and sync correctly
- [ ] AI documentation falls back to local Ollama or sync-deferral mode
- [ ] Hindi TTS reads prescriptions aloud
- [ ] Marketplace directory browsable offline from cached district data
- [ ] Consultant settlement reports generate locally as printable PDFs; CSV export for air-gapped banks
- [ ] Data migration wizard imports Bihar NHM patient register CSVs fully offline
- [ ] Agent portal tracks referrals and commissions offline
- [ ] CMO dashboard shows cached multi-hospital KPI snapshots with staleness badges

**Gaps Closed**: 🟠 SMS/Feature Phone · 🟡 Print Workflows · 🟠 Offline Escalation · 🟠 Offline AI · Features #14, #22, #24, #26 adapted

---

### Appendix A: 26-Feature Inventory — Phase Assignment Summary

All 26 major features identified in the codebase audit are mapped to their roadmap phase and their specific resource-constrained adaptation strategy:

| # | Feature | Phase | Adaptation Strategy |
|:---:|:---|:---:|:---|
| 1 | Patient Retention Engine | **P3** | Local pg-boss cron runs pathway rules; follow-ups auto-generated offline |
| 2 | Follow-Up System with Workers | **P3** | `followup.worker.ts` runs via QueueService; escalation triggers locally |
| 3 | Hospital Setup Wizard | **P2** | All 12 steps work offline; integration steps marked "deferred" |
| 4 | Care Journeys & Recovery Tracking | **P3** | Sync active journeys to IndexedDB; red flags detect locally |
| 5 | MedChat Triage Engine | **P3** | Deterministic rules + symptom DB cached as PWA assets; runs client-side |
| 6 | Pharmacy & Drug Stock Management | **P3** | Local stock tracking; additive merge for dispensing conflicts on sync |
| 7 | IPD / Wards / Bed Management | **P3** | Full bed map in IndexedDB; admission conflicts flagged on sync |
| 8 | Comprehensive Billing & Wallet | **P3** | Offline invoicing with GST; CASH/UPI only; Razorpay circuit-broken |
| 9 | Analytics, Dashboards & KPIs | **P2** | Local KPI cache from IndexedDB; "Last Synced" badge on dashboard |
| 10 | Notification Template Engine | **P2** | Templates cached locally; rendered messages queue in sync outbox |
| 11 | Granular RBAC | **P1** | Permission matrix cached in IndexedDB; offline checks from cache |
| 14 | Marketplace & Discovery | **P4** | Read-only district cache; cross-hospital booking via sync outbox |
| 15 | Smart Slot Booking Engine | **P2** | Advisory lock replaces Redlock; optimistic PWA reservations |
| 16 | Waitlist Service | **P2** | Local waitlist in IndexedDB; auto-promote on slot open |
| 17 | No-Show Recovery Service | **P2** | Local pg-boss scan; freed slots feed waitlist auto-promotion |
| 18 | Transactional Outbox Pattern | **P1** | Relay targets pg-boss instead of BullMQ; SQLite polling fallback |
| 19 | Circuit Breaker Pattern | **P1** | Default OPEN for cloud services offline; failed requests → sync outbox |
| 20 | Department Handoff / Patient Flow | **P3** | Local handoff chain with 30s polling across terminals on LAN |
| 21 | Internal Referral Tracker | **P3** | Local referrals with `PENDING_SYNC` status; local network visibility |
| 22 | Consultant Settlement | **P4** | Weekly local computation; printable PDF reports; CSV for bank upload |
| 23 | Clinic Operational Profile | **P1** | Becomes deployment-mode config source (CLOUD/LOCAL/HYBRID) |
| 24 | Data Migration Wizard | **P4** | Fully offline CSV/Excel import; Bihar NHM register template |
| 25 | OPD Configuration (Token Mode) | **P1** | Cached locally; offline token sequence with sync reconciliation |
| 26 | Agent / CMO Portals | **P4** | Agent: offline referral/commission tracking. CMO: cached KPI snapshots |

---

### Cumulative Closure Summary

| Phase | Weeks | Infrastructure Gaps Closed | Features Adapted | Total Milestones |
|:---:|:---:|:---|:---:|:---:|
| **Phase 1** | 1–6 | 🔴 Low-Spec Hardware · 🟠 Dynamic Forms | #11, #18, #19, #23, #25 | 9 |
| **Phase 2** | 7–14 | 🔴 Offline · 🔴 Bandwidth · 🔴 i18n | #3, #9, #10, #15, #16, #17 | 12 |
| **Phase 3** | 15–24 | 🔴 FHIR/ABDM · 🟠 Concepts · 🟠 DHIS2 · 🟡 Billing | #1, #2, #4, #5, #6, #7, #8, #20, #21 | 14 |
| **Phase 4** | 25–32 | 🟠 SMS · 🟡 Print · 🟠 Escalation · 🟠 AI | #14, #22, #24, #26 | 11 |
| **Total** | **32 weeks** | **All 12 gap dimensions + 26 features** | **26 / 26** | **46 milestones** |

> After Phase 4 completion, all gap dimensions from the [Bihar Gap Analysis](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/GAP_ANALYSIS_Resource_Constrained_Bihar.md) are resolved **and** every production feature in the Haspataal codebase has a defined offline/low-spec behavior.

---

## 5. Total Cost of Ownership (TCO) & Deployment Architecture

Deploying in resource-constrained areas requires minimizing both initial capital expenditure (CapEx) and ongoing operational expenditure (OpEx). The Bihar gap analysis underscores that **there is no budget for cloud subscriptions** at rural PHCs — the deployment model must be local-first with optional cloud sync.

### 5.1 Local Clinic Deployment Profile (Bihar PHC)
To host Haspataal locally on a budget clinic server (e.g., refurbished desktop, Intel NUC, or mini-PC):

* **Hardware Specs**:
  * CPU: 2–4 Cores (Intel Core 2 Duo minimum / Celeron / Core i3 or ARM Cortex-A72).
  * RAM: 2 GB minimum (SQLite mode) / 4 GB recommended (PostgreSQL mode).
  * Storage: 128 GB SSD (SSDs are critical to avoid DB corruption during Bihar's frequent sudden power losses).
  * Power: **UPS backup (mandatory)** — protects local database consistency during Bihar's 6–12 hour power cuts. A 600VA UPS (~₹2,500) provides 30–45 minutes of graceful shutdown time.
* **Software Footprint**:
  * OS: Ubuntu Server 24.04 LTS (Optimized minimal kernel).
  * Run-time: Single-node Docker deployment via `docker-compose.local.yml`.
  * Services: Haspataal Node Server (Next.js), PostgreSQL 16 DB (pg-boss for job queues, **no Redis container**).
  * Total RAM consumed at idle: **~400 MB** (SQLite mode) / **~900 MB** (PostgreSQL mode) — compared to ~3.2 GB for the full enterprise stack.
* **Network**: Operates fully offline. Syncs via mobile hotspot or 3G dongle when available (even once per day is sufficient for DHIS2 reports and ABDM data exchange).

### 5.2 Operations & Maintenance (O&M) Cost Breakdown (Comparison)
Below is an estimated monthly cost comparison for running a network of **50 rural clinics** under various models:

| Cost Center | Cloud-Only Haspataal (Current) | Local/Cloud Hybrid Haspataal (Proposed) | Bahmni / OpenMRS (Standard Deploy) |
| :--- | :--- | :--- | :--- |
| **Connectivity Cost** | High ($50/mo per clinic for dedicated fiber/satellite to ensure uptime). | Low ($10/mo per clinic; simple mobile hotspot/3G sync fallback). | Low ($10/mo per clinic; local operation, async cloud sync). |
| **Server Hosting (Cloud)** | High ($300/mo for heavy centralized RDS, Redis, ECS cluster). | Low ($50/mo for a simple central database to receive aggregated sync packets). | Low ($80/mo for centralized reporting and synchronization servers). |
| **Local Server Hardware** | None (client-only terminals). | Very Low ($150 one-time CapEx per clinic for refurbished desktop + ₹2,500 UPS). | Moderate ($400 one-time CapEx per clinic for beefier servers running Odoo + OpenELIS + Java). |
| **Maintenance & Support** | Low (centralized updates, no local systems to manage). | Low-Moderate (automated remote script updates via SSH tunnel when online; local Docker image pulls). | High (frequent localized patching, complex JVM memory tuning, multiple UI portals). |
| **SMS/USSD Costs** | None (no SMS integration). | Low ($30/mo for 50 clinics × ~100 SMS/clinic via Msg91 bulk pricing). | None (no built-in SMS). |
| **Total Est. Operational Cost (Monthly)** | **~$2,800 / month** | **~$640 / month** *(excluding one-time hardware amortizations)* | **~$1,200 / month** *(due to higher local system overhead & O&M complexity)* |

### 5.3 Bihar Deployment Cost Estimate (INR)
For a **pilot of 10 Bihar PHCs** (government-funded):

| Item | Unit Cost (INR) | Qty | Total (INR) |
|:---|:---|:---:|:---|
| Refurbished Desktop (Core 2 Duo, 4GB RAM, 128GB SSD) | ₹8,000 | 10 | ₹80,000 |
| UPS 600VA | ₹2,500 | 10 | ₹25,000 |
| Thermal Receipt Printer (58/80mm USB) | ₹2,000 | 10 | ₹20,000 |
| 3G USB Dongle + 1GB/day data plan (annual) | ₹3,600/yr | 10 | ₹36,000 |
| Central Cloud Server (sync hub, DHIS2 relay) | ₹4,000/mo | 1 | ₹48,000/yr |
| SMS Gateway (Msg91, ~1,000 SMS/clinic/month) | ₹2,400/yr | 10 | ₹24,000/yr |
| **Total Year-1 Cost** | | | **₹2,33,000** (~$2,780 USD) |

> For comparison, a Bahmni pilot for 10 clinics would cost approximately ₹4,50,000–₹6,00,000 in Year 1 due to heavier hardware requirements and more complex local administration.

---

## 6. Conclusion

The **Haspataal HMS 1 Roadmap** represents a comprehensive 32-week plan to transform Haspataal from a cloud-first urban SaaS into a **full-ecosystem, offline-capable Healthcare Operating System** viable for resource-constrained deployments.

The original strategy addressed only core clinical workflows (appointments, patient records, AI/escalation). This roadmap expands the scope to cover **all 26 major production features** — including retention funnels, pharmacy inventory, ward management, financial settlements, granular RBAC, marketplace discovery, slot booking engines, MedChat triage, department handoffs, and CMO oversight portals — with defined offline/low-spec behavior for each.

### What the roadmap delivers:

| Phase | Weeks | What it achieves |
|:---:|:---:|:---|
| **Phase 1** | 1–6 | Makes Haspataal physically runnable on Bihar's existing hardware (2 GB RAM, no Redis). Adapts infrastructure-level features (outbox, circuit breaker, RBAC, OPD config) for single-server operation. |
| **Phase 2** | 7–14 | Survives 6–12 hour connectivity blackouts. Adapts daily operational features (slot booking, waitlists, no-shows, setup wizard, dashboards, notifications) for fully offline use. Hindi/Bhojpuri localization. |
| **Phase 3** | 15–24 | Achieves ABDM/FHIR/DHIS2 compliance. Adapts the full clinical ecosystem (retention, follow-ups, care journeys, triage, pharmacy, IPD, billing, patient flow, referrals) for offline operation with Bihar-specific sync strategies. |
| **Phase 4** | 25–32 | Reaches feature-phone patients via SMS/USSD. Adapts offline AI, chronic escalation, marketplace, settlements, data migration, and CMO/agent portals for fully disconnected field operations. |

### By the numbers:
- **46 milestones** across 4 phases
- **26 / 26 features** adapted for resource-constrained operation
- **12 / 12 gap dimensions** from the [Bihar Gap Analysis](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/docs/GAP_ANALYSIS_Resource_Constrained_Bihar.md) fully resolved
- **~₹2.3 lakh** total Year-1 cost for a 10-clinic Bihar pilot
- **~400 MB** idle RAM footprint in SQLite mode (vs. ~3.2 GB current enterprise stack)

Crucially, Haspataal will surpass both OpenMRS and Bahmni by offering a unified modern interface, an automated chronic care escalation system that works offline, offline-deferrable AI clinical documentation, voice-based input for low-literacy operators, deterministic MedChat triage that runs entirely client-side, and a dramatically lower TCO — establishing Haspataal as the next-generation Healthcare Operating System for both urban centers and rural frontiers across India.
