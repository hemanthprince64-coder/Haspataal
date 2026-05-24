## Why

Patients missing **2 or more consecutive chronic care follow-ups** currently receive no automatic escalation alert, leaving them at risk of undetected clinical deterioration. The existing retention engine fires standard reminders but lacks a **doctor escalation pathway** for non-responsive patients identified from the CLAUDE.md knowledge base: *"Chronic Escalation: Patients missing 2 consecutive chronic follow-ups MUST fire an escalation alert to the treating doctor."*

## What Changes

- Add a new **chronic escalation engine** that evaluates follow-up attendance per patient
- Create an `EscalationAlert` model in Prisma to persist escalation records
- Emit a `CHRONIC_ESCALATION_REQUIRED` event to the existing event bus when thresholds are breached
- Add a new **Escalation Dashboard widget** in the Hospital HMS portal for doctors to triage escalated patients
- **New API endpoints**:
  - `GET /v1/escalations` — list active escalations for the logged-in hospital
  - `PATCH /v1/escalations/:id/acknowledge` — doctor marks an escalation as reviewed
- **New background worker**: `escalation.worker.js` — processes the escalation queue nightly alongside the existing `followup.worker.js`

## Capabilities

### New Capabilities

- `retention-escalation`: Evaluates patient follow-up attendance, fires doctor escalation alerts on missed chronic care appointments, and provides an HMS dashboard triage widget

### Modified Capabilities

- *(none — existing retention engine behavior is unchanged; this is additive)*

## Impact

- **Database**: new `EscalationAlert` Prisma model in `packages/db/schema.prisma`
- **Backend**: new escalation worker script at `workers/escalation.worker.js`, new API routes under `api-gateway/routes/escalations.ts`
- **Frontend**: new EscalationCard + EscalationsPage in `apps/patient-portal/` hospital dashboard section
- **Events**: new `CHRONIC_ESCALATION_REQUIRED` event type added to `EventLog` enum
- **Config**: `EscalationConfig` table allows per-hospital threshold tuning (currently hardcoded at 2 missed follow-ups per CLAUDE.md)
