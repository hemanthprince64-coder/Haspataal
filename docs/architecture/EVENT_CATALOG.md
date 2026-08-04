Version: 2.0
Owner: Haspataal Engineering
Last Updated: 2026-08-04

# Event Catalog

The platform operates on a dual-write event bus. Every state mutation writes to the PostgreSQL `EventLog` table and publishes to a Redis Stream for async worker processing.

## Timeline Events (Clinical)
These events are strictly tied to an `Encounter` and map to the `ClinicalTimelineEvent` schema.

- `ENCOUNTER_CREATED`
- `VITALS_RECORDED`
- `DIAGNOSIS_ADDED`
- `PRESCRIPTION_ISSUED`
- `ORDER_PLACED` (Radiology/Lab/Pharmacy)
- `ORDER_STATUS_CHANGED` (e.g., ACCEPTED -> COMPLETED)
- `ENCOUNTER_COMPLETED`

## Domain Events (Operational)
These trigger side-effects like billing or notifications.

- `HOSPITAL_REGISTERED`: Triggers automated setup creation.
- `HOSPITAL_ACTIVATED`: Unlocks full HMS features.
- `PATIENT_REGISTERED`: Triggers WhatsApp welcome message.
- `APPOINTMENT_BOOKED`: Triggers SMS confirmation.
- `BILL_GENERATED`: Triggers Razorpay payment link.
- `FOLLOW_UP_SCHEDULED`: Queued in Redis for future cron execution.
