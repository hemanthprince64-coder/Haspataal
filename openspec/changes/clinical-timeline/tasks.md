## 1. Phase 6.1: Timeline Domain

- [x] 1.1 Create `packages/timeline` package structure.
- [x] 1.2 Define `ClinicalTimelineEvent`, `TimelineCategory`, and `TimelineEventType` interfaces in `packages/types/index.ts`.
- [x] 1.3 Implement `GetPatientTimelineUseCase` in `packages/timeline` to map `EventLog` records.

## 2. Phase 6.2: Timeline API

- [x] 2.1 Create RESTful API route `GET /api/hospital/patients/[patientId]/timeline/route.ts`.
- [x] 2.2 Add support for pagination limit and category filtering.
- [x] 2.3 Secure API route with patient-scoped and hospital-scoped RLS.

## 3. Phase 6.3: Timeline UI Components

- [x] 3.1 Create reusable `Timeline` node and connector components.
- [x] 3.2 Create `TimelineEventCard` with standardized colors (Booking=Slate, CheckIn=Indigo, Vitals=Blue, etc.).

## 4. Phase 6.4 - 6.8: EMR Integration & Enhancements

- [x] 4.1 Update EMR Workspace Sidebar to fetch and display the timeline.
- [x] 4.2 Group rendered timeline events by Visit (Encounter).
- [x] 4.3 Add basic category filtering to the UI (e.g., filter by Diagnosis, Prescription).
- [x] 4.4 Implement lazy loading for older events.
