# Skill: Appointment Scheduling System

## Overview
End-to-end appointment booking flow connecting patients with doctors through time slots.

## Components

### Doctor Slot Generation
- Slots managed in `slots` table via Prisma
- Each slot has: doctorId, hospitalId, date, startTime, endTime, isBooked
- Slots are generated per doctor-hospital affiliation
- Support for recurring weekly schedules

### Real-Time Availability
- Query available slots by: speciality, city, date range
- Filter by doctor rating, hospital proximity
- Live status updates (booked/available)

### Booking Flow
```
Patient selects speciality → Filter by city
    → Browse doctors → Select slot
    → Confirm booking → Appointment created
    → Notification sent to doctor/hospital
```

### Cancellation Policy
- Cancellations update slot status back to available
- Audit log entry created for every cancellation
- Refund policy handled at business logic layer

### Reminder Notifications
- Pre-appointment reminders (configurable timing)
- Post-visit follow-up suggestions
- Missed appointment flagging

## Related Files
- `app/(patient)/book/` — Patient booking UI
- `app/actions.js` — Server actions for booking
- `prisma/schema.prisma` — Slot and Appointment models
- `lib/services.ts` — Service layer functions
