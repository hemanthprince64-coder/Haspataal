## Context

Provide a design for the `/hospital/dashboard/schedule` page and backend actions in the `patient-portal` app to manage doctors' weekly schedules and daily slots.

## Goals / Non-Goals

**Goals:**
- Implement `apps/patient-portal/lib/schedule-actions.ts` with 5 CRUD/batch slot actions.
- Implement `/hospital/dashboard/schedule` page with "Weekly Template" and "Day Slots" tabs, matching the layout style of `dashboard/opd/triage/page.tsx`.
- Implement a POST `/api/schedule/regenerate` route to support automated regeneration via cron.
- Secure all entry points using `requireHospitalAccess('opd', 'manage_schedule')`.

**Non-Goals:**
- Multi-specialty bulk templates (doctor-specific only).
- Real-time Google Calendar bi-directional syncing (out of scope for this change).

## Decisions

- **Day of Week Mapping**: Standardise `dayOfWeek` as an integer: `1` (Monday) to `7` (Sunday).
- **Slots Generation Strategy**: Iterate day-by-day for the next 30 days. For each day, match the day of week. If active schedule exists, split the `startTime` to `endTime` span into `slotDurationMinutes` increments (defaulting to 30 or 15 mins). Batch insert `DoctorSlot` records.
- **Slot Blocking**: Create a `DoctorSlotBlock` entry.

## Risks / Trade-offs

- **Risk**: Creating duplicate slots.
  - **Mitigation**: Use transaction-wrapped queries with `ON CONFLICT (doctor_id, start_time) DO NOTHING` or explicit checks before batch inserting slots.
