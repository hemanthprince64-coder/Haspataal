## Why

Provide a system for hospital administrators and doctors to configure weekly scheduling templates and manage daily appointment slots. While the `DoctorSchedule` and `DoctorSlot` database models exist, there is currently no hospital dashboard interface or server actions to manage slot generation, schedule modifications, or temporary slot blocking.

## What Changes

- Add server-side schedule actions in `apps/patient-portal/lib/schedule-actions.ts` for CRUD and slot generation.
- Add `/api/schedule/regenerate` API endpoint for automated slot regeneration.
- Create `/hospital/dashboard/schedule` UI with tabs for "Weekly Template" and "Day Slots" management.
- Gate access using the `requireHospitalAccess('opd', 'manage_schedule')` authorization middleware.

## Capabilities

### New Capabilities
- `doctor-schedule-management`: Management of doctor weekly schedule templates, daily slot viewing, and temporary slot range blocking.

### Modified Capabilities

## Impact

- **Database**: Reads/writes `DoctorSchedule`, `DoctorSlot`, and `DoctorSlotBlock` models.
- **API**: Adds `/api/schedule/regenerate` endpoint.
- **Routing**: Adds `/hospital/dashboard/schedule` page.
