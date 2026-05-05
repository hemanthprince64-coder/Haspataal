# 🏛️ Haspataal Architecture Documentation

This document provides a visual overview of the Haspataal platform architecture using the C4 model and detailed sequence diagrams.

## 📖 Legend

| Level | Name | Description |
| :--- | :--- | :--- |
| **L1** | **System Context** | High-level view showing the platform and its relationships with users and external systems. |
| **L2** | **Container Diagram** | Shows the high-level technology choices, how responsibilities are distributed, and how containers communicate. |
| **Sequence** | **Dynamic View** | Illustrates how specific business processes flow through the various components of the system. |

---

## 🌍 Diagram 1 — C4 Level 1: System Context
The primary goal of the Haspataal platform is to bridge the gap between patients and healthcare providers in Tier-2/3 cities.

```mermaid
C4Context
    title System Context Diagram for Haspataal Platform

    Person(patient, "Patient", "Uses mobile/web to book appointments and view records.")
    Person(doctor, "Doctor", "Consults patients and manages prescriptions.")
    Person(hospitalAdmin, "Hospital Admin", "Manages hospital staff, beds, and billing.")
    Person(labAdmin, "Lab Admin", "Manages diagnostic tests and reports.")
    Person(agent, "Agent", "Onboards hospitals and assists with registration.")
    Person(superAdmin, "Super Admin", "Oversees the entire platform and approves hospitals.")

    System(haspataal, "Haspataal Platform", "Multi-tenant hospital SaaS for clinical and financial management.")

    System_Ext(abdm, "ABDM/ABHA", "Government health ID system for record syncing.")
    System_Ext(payment, "Payment Gateway", "Handles financial transactions.")
    System_Ext(sms, "SMS Provider", "Sends transactional alerts via WhatsApp/SMS.")
    System_Ext(supabase, "Supabase PostgreSQL", "Primary relational database with Row-Level Security (RLS).")
    System_Ext(gemini, "Google Generative AI", "Powers MedChat AI for clinical reasoning and OCR.")

    Rel(patient, haspataal, "Uses")
    Rel(doctor, haspataal, "Uses")
    Rel(hospitalAdmin, haspataal, "Uses")
    Rel(labAdmin, haspataal, "Uses")
    Rel(agent, haspataal, "Assists onboarding")
    Rel(superAdmin, haspataal, "Administrates")

    Rel(haspataal, abdm, "Syncs records")
    Rel(haspataal, payment, "Processes payments")
    Rel(haspataal, sms, "Sends alerts")
    Rel(haspataal, supabase, "Stores data")
    Rel(haspataal, gemini, "Offloads clinical reasoning")
```

---

## 📦 Diagram 2 — C4 Level 2: Container Diagram
Haspataal is built as a distributed monolith transitioning into a micro-architecture, orchestrated via Nginx.

```mermaid
C4Container
    title Container Diagram for Haspataal Platform

    Person(patient, "Patient")
    Person(hospitalStaff, "Hospital Staff")

    System_Boundary(haspataal_boundary, "Haspataal Platform") {
        Container(nginx, "Nginx Reverse Proxy", "Nginx", "Routes traffic and enforces security policies (e.g., blocking /metrics).")
        Container(patientPortal, "Patient Portal", "Next.js (:3000)", "Primary patient-facing web application.")
        Container(hospitalHMS, "Hospital HMS", "Next.js (:3001)", "Core clinical and administrative portal for hospitals.")
        Container(adminPanel, "Admin Panel", "Next.js (:3002)", "Platform-wide management for Super Admins.")
        Container(marketingSite, "Marketing Site", "Next.js (:3003)", "Public-facing marketing and information site.")
        
        Container(apiGateway, "API Gateway", "Express (:4002)", "Handles RBAC, Rate Limiting, and structured logging.")
        Container(authService, "Auth Service", "Express (:4001)", "Centralized identity provider and JWT issuer.")
        Container(medChat, "MedChat AI Service", "FastAPI / Node", "Clinical decision support and AI-powered data processing.")
        
        ContainerDb(redis, "Redis", "ioredis", "Distributed locking (Redlock), Caching, and BullMQ event queues.")
        ContainerDb(db, "PostgreSQL", "Supabase", "Relational database with multi-tenant RLS isolation.")
    }

    Rel(patient, nginx, "HTTPS")
    Rel(hospitalStaff, nginx, "HTTPS")
    
    Rel(nginx, patientPortal, "Proxy")
    Rel(nginx, hospitalHMS, "Proxy")
    Rel(nginx, adminPanel, "Proxy")
    Rel(nginx, marketingSite, "Proxy")
    
    Rel(patientPortal, apiGateway, "REST/JSON")
    Rel(hospitalHMS, apiGateway, "REST/JSON")
    Rel(apiGateway, authService, "HTTP")
    Rel(apiGateway, medChat, "HTTP/gRPC")
    
    Rel(apiGateway, redis, "ioredis (Pub-Sub/Locking)")
    Rel(apiGateway, db, "Prisma (RLS Scoped)")
    Rel(authService, db, "Prisma")
```

---

## 🔄 Diagram 3 — Sequence: Doctor/Hospital Approval Flow
This flow ensures that every hospital and doctor on the platform undergoes a strict multi-tier verification process before becoming active.

```mermaid
sequenceDiagram
    participant AG as Agent
    participant PG as Patient Portal (Onboarding)
    participant GW as API Gateway
    participant AS as Auth Service
    participant HMS as Hospital HMS
    participant PR as Prisma / Service
    participant DB as PostgreSQL

    AG->>PG: Register as Onboarding Agent
    PG->>PR: createAgent()
    PR->>DB: INSERT Agent Record
    AG->>PG: Submit Hospital Onboarding Form
    PG->>GW: POST /v1/hospitals/onboard
    GW->>PR: createHospital(pending)
    PR->>DB: INSERT HospitalsMaster (Status: PENDING)
    
    note over HMS: Hospital Admin reviews uploaded documents
    
    participant SA as Super Admin
    SA->>SA: Log in to Admin Panel
    SA->>GW: PATCH /v1/admin/hospitals/:id/approve
    GW->>PR: approveHospital()
    PR->>DB: UPDATE HospitalsMaster (Status: VERIFIED)
    
    SA->>SA: Final Compliance Check
    SA->>GW: PATCH /v1/admin/hospitals/:id/activate
    GW->>PR: activateHospital()
    PR->>DB: UPDATE HospitalsMaster (Status: ACTIVE)
    
    PR-->>SA: Success: Hospital is now LIVE
```

---

## 📅 Diagram 4 — Sequence: Appointment Booking
Haspataal uses distributed locking to prevent overbooking and a resilient message queue for notifications.

```mermaid
sequenceDiagram
    participant P as Patient
    participant PP as Patient Portal
    participant GW as API Gateway
    participant RD as Redis (Redlock)
    participant HMS as Hospital HMS
    participant BQ as BullMQ (Notification Queue)
    participant DB as PostgreSQL

    P->>PP: Select Doctor & Check Slot Availability
    PP->>GW: GET /v1/search/slots
    GW->>DB: findMany(slots)
    DB-->>GW: Available Slots (JSON)
    
    P->>PP: Create Booking Request
    PP->>GW: POST /v1/appointments
    GW->>RD: Acquire Distributed Lock (10s)
    GW->>DB: INSERT Appointment (Status: AWAITING_PAYMENT)
    GW->>RD: Release Lock
    
    note over HMS: Hospital Dashboard notified
    HMS->>GW: PATCH /v1/appointments/:id/confirm
    GW->>DB: UPDATE Appointment (Status: BOOKED)
    
    GW->>BQ: Dispatch 'appointment_confirmed' event
    BQ->>BQ: Process Notification (Worker)
    BQ-->>P: WhatsApp / SMS: "Your appointment is confirmed!"
```
