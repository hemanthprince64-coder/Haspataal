## 1. Server Actions Setup

- [x] 1.1 Create `apps/patient-portal/lib/schedule-actions.ts` with Zod validations and `use server`
- [x] 1.2 Implement `getDoctorSchedule(doctorId)` server action
- [x] 1.3 Implement `upsertDoctorSchedule(doctorId, dayOfWeek, startTime, endTime, isActive)` server action
- [x] 1.4 Implement `generateSlotsFromSchedule(doctorId, startDate, endDate)` server action in 15-minute increments
- [x] 1.5 Implement `blockExistingSlots(doctorId, blockStart, blockEnd, reason)` server action using `DoctorSlotBlock`
- [x] 1.6 Implement `getSlotsForDoctor(doctorId, startDate, endDate)` server action

## 2. API Routes and Security

- [x] 2.1 Add `/api/schedule/regenerate` route accepting POST with `doctorId`
- [x] 2.2 Enforce `requireHospitalAccess('opd', 'manage_schedule')` on all new actions and endpoints

## 3. UI Implementation

- [x] 3.1 Create `/hospital/dashboard/schedule` server page and client-side settings dashboard matching triage page layout
- [x] 3.2 Implement Tab 1 "Weekly Template" showing 7 rows (Mon-Sun) with time inputs and active toggles
- [x] 3.3 Implement Tab 2 "Day Slots" with date picker and slots data table
- [x] 3.4 Implement action buttons to trigger next 30 days generation and slot range blocking
