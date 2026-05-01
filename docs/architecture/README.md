# Haspataal Platform — Architecture Documentation

## C4 Level 1: System Context

The system context shows the Haspataal platform, its users, and the external systems it integrates with.

```mermaid
C4Context
    title Haspataal Platform — System Context (C4 Level 1)

    Person(patient, "Patient", "Books appointments, manages health records, receives care pathways")
    Person(doctor, "Doctor", "Manages appointments, writes prescriptions, views patient history")
    Person(hospitalAdmin, "Hospital Admin", "Configures hospital, manages staff, views analytics")
    Person(labAdmin, "Lab/Diagnostics Admin", "Manages diagnostic catalog, processes lab orders")
    Person(agent, "Field Agent", "Onboards hospitals and patients in tier-2/3 cities")
    Person(superAdmin, "Platform Admin", "Approves hospitals, monitors system health, manages platform")

    System(haspataal, "Haspataal Platform", "Multi-tenant hospital SaaS for India's tier-2/3 cities")

    System_Ext(supabase, "Supabase PostgreSQL", "Primary database with Row-Level Security")
    System_Ext(redis, "Redis + BullMQ", "Caching, rate limiting, event streams, job queues")
    System_Ext(gemini, "Google Generative AI", "MedChat triage, prescription OCR, care journey generation")
    System_Ext(abdm, "ABDM/ABHA Sandbox", "Ayushman Bharat Digital Health ID integration (planned)")
    System_Ext(whatsapp, "WhatsApp Business API", "Patient notifications, appointment reminders")
    System_Ext(sms, "SMS Gateway", "OTP delivery, fallback notifications")
    System_Ext(razorpay, "Razorpay", "Payment processing for consultations (planned)")

    Rel(patient, haspataal, "Books appointments, views records", "HTTPS")
    Rel(doctor, haspataal, "Manages patients, prescriptions", "HTTPS")
    Rel(hospitalAdmin, haspataal, "Configures hospital, billing", "HTTPS")
    Rel(labAdmin, haspataal, "Manages diagnostics", "HTTPS")
    Rel(agent, haspataal, "Onboards hospitals/patients", "HTTPS")
    Rel(superAdmin, haspataal, "Administers platform", "HTTPS")

    Rel(haspataal, supabase, "Reads/writes clinical data", "TCP/5432")
    Rel(haspataal, redis, "Caching, events, rate limits", "TCP/6379")
    Rel(haspataal, gemini, "AI triage and OCR", "HTTPS/REST")
    Rel(haspataal, abdm, "Health ID verification", "HTTPS/REST")
    Rel(haspataal, whatsapp, "Sends notifications", "HTTPS/REST")
    Rel(haspataal, sms, "Sends OTPs, fallback alerts", "HTTPS/REST")
    Rel(haspataal, razorpay, "Processes payments", "HTTPS/REST")
```

---

## C4 Level 2: Container Diagram

The container diagram shows the runtime components that make up the Haspataal platform.

```mermaid
C4Container
    title Haspataal Platform — Container Diagram (C4 Level 2)

    Person(patient, "Patient")
    Person(doctor, "Doctor")
    Person(hospitalAdmin, "Hospital Admin")

    System_Boundary(haspataal, "Haspataal Platform") {
        Container(patientPortal, "Patient Portal", "Next.js 16 / React 19", "Appointment booking, health records, MedChat AI triage, care timelines. Port 3000")
        Container(hospitalHMS, "Hospital HMS", "Next.js 16 / React 19", "OPD/IPD management, billing, pharmacy, diagnostics, setup wizard. Port 3001")
        Container(adminPanel, "Admin Panel", "Next.js 16 / React 19", "Platform administration, hospital approvals, analytics dashboards. Port 3002")
        Container(publicSite, "Public Website", "Next.js 16", "Marketing pages, doctor discovery, hospital listings. Port 3003")
        Container(apiGateway, "API Gateway", "Express 5 / TypeScript", "JWT auth via jose, per-role rate limiting, Pino logging, X-Request-ID correlation. Port 4002")
        Container(medchatAI, "MedChat AI Service", "Google Generative AI SDK", "Symptom triage, prescription OCR, care journey generation. Embedded in Patient Portal")
        Container(authService, "Auth Service", "jose / bcrypt", "JWT session management, RBAC, multi-tenant isolation. Embedded in each Next.js app")
        Container(eventBus, "Event Bus", "Redis Streams + BullMQ", "Async event processing: patient_visited, bill_generated, hospital_registered")
        Container(workers, "Background Workers", "Node.js", "Follow-up scheduling, notification dispatch, retention campaigns")
    }

    System_Ext(supabase, "Supabase PostgreSQL")
    System_Ext(redis, "Redis")
    System_Ext(gemini, "Gemini AI")

    Rel(patient, patientPortal, "Uses", "HTTPS")
    Rel(doctor, hospitalHMS, "Uses", "HTTPS")
    Rel(hospitalAdmin, hospitalHMS, "Uses", "HTTPS")

    Rel(patientPortal, apiGateway, "API calls", "HTTPS/REST")
    Rel(hospitalHMS, apiGateway, "API calls", "HTTPS/REST")
    Rel(adminPanel, apiGateway, "API calls", "HTTPS/REST")

    Rel(apiGateway, supabase, "Queries", "Prisma/TCP")
    Rel(patientPortal, supabase, "Server Actions", "Prisma/TCP")
    Rel(hospitalHMS, supabase, "Server Actions", "Prisma/TCP")

    Rel(patientPortal, gemini, "AI triage", "HTTPS")
    Rel(eventBus, redis, "Pub/Sub", "TCP")
    Rel(workers, redis, "Consume jobs", "TCP")
    Rel(workers, supabase, "Update state", "Prisma/TCP")
```

### Container Summary

| Container                            | Tech Stack                             | Port | Responsibility                                                           |
| ------------------------------------ | -------------------------------------- | ---- | ------------------------------------------------------------------------ |
| **Patient Portal**                   | Next.js 16, React 19, Tailwind, shadcn | 3000 | Booking, health records, MedChat AI, care timelines                      |
| **Hospital HMS** (`haspataal-in`)    | Next.js 16, React 19, Tailwind, shadcn | 3001 | OPD/IPD, billing, pharmacy, diagnostics, setup wizard                    |
| **Admin Panel** (`haspataal-admin`)  | Next.js 16, React 19, Tailwind         | 3002 | Hospital approvals, platform stats, user management                      |
| **Public Website** (`haspataal-com`) | Next.js 16                             | 3003 | Doctor discovery, hospital listings, SEO pages                           |
| **API Gateway**                      | Express 5, TypeScript, jose, Pino      | 4002 | JWT validation, per-role rate limits, CORS, proxying                     |
| **Event Bus**                        | Redis Streams, BullMQ                  | —    | Async events: `hospital_registered`, `patient_visited`, `bill_generated` |
| **Workers**                          | Node.js, BullMQ                        | —    | Follow-up scheduling, notification dispatch, retention                   |

### Communication Protocols

```mermaid
graph LR
    subgraph "Client Layer"
        Browser["Browser"]
    end

    subgraph "Edge Layer"
        Nginx["Nginx Reverse Proxy"]
        Proxy["Next.js Middleware (proxy.js)"]
    end

    subgraph "Application Layer"
        PP["Patient Portal :3000"]
        HMS["Hospital HMS :3001"]
        AP["Admin Panel :3002"]
        GW["API Gateway :4002"]
    end

    subgraph "Data Layer"
        PG["Supabase PostgreSQL"]
        RD["Redis"]
    end

    Browser -->|HTTPS| Nginx
    Nginx -->|/| PP
    Nginx -->|/hospital| HMS
    Nginx -->|/admin| AP
    Nginx -->|/api/v1| GW

    PP -->|Server Actions / Prisma| PG
    HMS -->|Server Actions / Prisma| PG
    GW -->|Prisma + Raw SQL| PG
    GW -->|Rate Limit Counters| RD
    PP -->|Event Emit| RD
```

---

## Key Data Flows

### 1. Patient Booking an Appointment

```mermaid
sequenceDiagram
    participant P as Patient Browser
    participant PP as Patient Portal
    participant SA as Server Action
    participant SVC as services.ts
    participant DB as PostgreSQL
    participant RD as Redis

    P->>PP: Select doctor, date, slot
    PP->>SA: bookAppointment(formData)
    SA->>SA: requireRole(PATIENT)
    SA->>SA: Validate with BookAppointmentSchema (Zod)

    alt Pay with Wallet
        SA->>SVC: getWallet(patientId)
        SVC->>DB: SELECT balance FROM wallets
        DB-->>SVC: { balance: 1200 }
        SA->>SVC: addWalletTransaction(DEBIT, 500)
        SVC->>DB: UPDATE wallets SET balance = balance - 500
    end

    SA->>SVC: patient.createVisit(hospitalId, visitData)
    SVC->>DB: BEGIN TRANSACTION
    SVC->>DB: UPSERT patient (find or create by mobile)
    SVC->>DB: SELECT existing booking (same doctor/date/slot)

    alt Slot Available
        SVC->>DB: INSERT INTO appointments
        SVC->>DB: COMMIT
        SVC->>RD: XADD events (appointment_booked)
        SVC-->>SA: { appointment }
        SA-->>PP: { success: true }
        PP-->>P: "Appointment booked!"
    else Slot Taken (P2002)
        SVC->>DB: ROLLBACK
        SVC-->>SA: ConcurrencyError
        SA-->>PP: { success: false, message: "Slot just booked" }
    end
```

### 2. Hospital Admin Approving a Doctor Affiliation

```mermaid
sequenceDiagram
    participant HA as Hospital Admin
    participant HMS as Hospital HMS
    participant SA as Server Action
    participant SVC as services.ts
    participant DB as PostgreSQL
    participant RD as Redis

    HA->>HMS: Click "Approve" on pending doctor
    HMS->>SA: approveDoctorAffiliationAction(formData)
    SA->>SA: requireRole(HOSPITAL_ADMIN)
    SA->>SA: Extract doctorId from formData

    SA->>SVC: hospital.approveDoctorAffiliation(hospitalId, doctorId)
    SVC->>DB: UPDATE doctor_hospital_affiliations SET status = 'APPROVED', is_current = true WHERE doctor_id AND hospital_id
    DB-->>SVC: Updated affiliation

    SVC->>RD: XADD events (doctor_affiliation_approved)
    SVC-->>SA: { success: true }
    SA-->>HMS: { message: "Doctor approved" }
    HMS-->>HA: Toast notification + refresh list
```

### 3. Agent Referral Registration

```mermaid
sequenceDiagram
    participant AG as Field Agent
    participant PP as Patient Portal
    participant SA as Server Action
    participant SVC as services.ts
    participant DB as PostgreSQL
    participant RD as Redis

    AG->>PP: Navigate to /register/agent
    AG->>PP: Fill registration form
    PP->>SA: registerAgent(formData)
    SA->>SA: Validate with RegisterAgentSchema (Zod)

    alt Validation Fails
        SA-->>PP: { success: false, message: "Invalid email" }
    else Validation Passes
        SA->>SVC: agent.register(data)
        SVC->>DB: Check existing agent by mobile
        alt Duplicate Mobile
            SVC-->>SA: Error("MOBILE_ALREADY_REGISTERED")
        else New Agent
            SVC->>DB: Hash password (bcrypt, 12 rounds)
            SVC->>DB: INSERT INTO field_agents
            SVC->>RD: XADD events (agent_registered)
            SVC-->>SA: { agent }
            SA-->>PP: { success: true, message: "Pending approval" }
            PP-->>AG: Redirect to /agent/login
        end
    end
```

---

## Authentication & Authorization Model

```mermaid
graph TB
    subgraph "JWT Sessions (jose)"
        S1["session_patient — Patient Portal"]
        S2["session_user — Hospital HMS"]
        S3["session_admin — Admin Panel"]
        S4["session_agent — Agent Portal"]
    end

    subgraph "RBAC Roles"
        R1["PATIENT"]
        R2["DOCTOR"]
        R3["HOSPITAL_ADMIN"]
        R4["LAB_ADMIN"]
        R5["AGENT"]
        R6["PLATFORM_ADMIN"]
    end

    subgraph "Isolation"
        RLS["PostgreSQL RLS Policies"]
        TI["Hospital Tenant Guard (hospitalId)"]
        MW["requireRole() Middleware"]
    end

    S1 --> R1
    S2 --> R2
    S2 --> R3
    S2 --> R4
    S3 --> R6
    S4 --> R5

    R1 & R2 & R3 & R4 & R5 & R6 --> MW
    MW --> TI
    TI --> RLS
```

---

## Deployment Topology

```mermaid
graph TB
    subgraph "Docker Compose"
        NG["Nginx :80/:443"]
        PP["patient-portal :3000"]
        HMS["haspataal-in :3001"]
        AP["haspataal-admin :3002"]
        GW["api-gateway :4002"]
        RD["Redis :6379"]
    end

    subgraph "Managed Services"
        SB["Supabase PostgreSQL"]
        GA["Google AI (Gemini)"]
    end

    NG --> PP & HMS & AP & GW
    PP & HMS & AP & GW --> SB
    GW --> RD
    PP --> GA
```
