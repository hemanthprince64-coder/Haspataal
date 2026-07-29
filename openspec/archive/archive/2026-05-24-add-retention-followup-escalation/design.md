## Context

Haspataal's existing retention engine (`workers/followup.worker.js`) processes scheduled `FollowUp` records and sends reminder notifications via WhatsApp/SMS. There is currently **no escalation path** — patients who miss 2 consecutive chronic-care follow-ups are simply lost in the system, with no alert reaching their treating doctor. The knowledge base in `CLAUDE.md` states:

> Patients missing 2 consecutive chronic follow-ups MUST fire an escalation alert to the treating doctor.

This change adds that missing escalation layer, integrating with the existing event bus, RLS-scoped data layer, and notification engine.

## Goals / Non-Goals

**Goals:**
- Evaluate every `Appointment` outcome against the patient's active `CarePathway` to count consecutive missed follow-ups
- Fire `CHRONIC_ESCALATION_REQUIRED` events to the existing PostgreSQL `EventLog` and Redis Streams
- Provide an HMS widget for doctors to triage escalated patients
- Persist escalation records for compliance and audit
- All new backend services use RLS-scoped `pg` transactions, not raw Prisma

**Non-Goals:**
- Changing the existing follow-up scheduling logic or `FollowUp` worker (this is additive only)
- Patient-facing escalation UX (stays doctor-only for now)
- Automated re-scheduling of escalated patients
- Multi-language escalation notifications

## Decisions

| Decision | Alternatives Considered | Rationale |
|---|---|---|
| Store escalations in new `EscalationAlert` Prisma model | Reuse `EventLog` only | Need structured fields: `patientId`, `doctorId`, `missedCount`, `acknowledgedAt` for HMS triage UI and compliance auditing |
| Use BullMQ for escalation processing | Cron + direct DB queries | Consistent with existing architecture (`followup.worker.js` uses BullMQ → `BullMQ` worker pool; enables retry, backoff, and Redis-based queue monitoring) |
| Emit to existing event bus (Redis Streams + Postgres `EventLog`) | New dedicated pub/sub | Reuses the established dual-write event infrastructure. Gateway already subscribes to Redis Streams for analytics and real-time dashboards |
| Doctor-only escalation (not patient-facing in scope 1) | Patient SMS + Doctor | Too many regulatory concerns in v1; doctor review gate is simpler and clinically safe |
| RLS enforced via raw `pg` pool | Prisma `withAuth` helper | `EscalationAlert` writes need `SET LOCAL app.hospital_id` before INSERT; confirmed pattern from CLAUDE.md knowledge base |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| **Duplicate escalation alerts** — A missed follow-up might be re-counted on each worker run if not idempotent | Add unique constraint on `(appointmentId, appointmentType)` in `EscalationAlert`. Check `acknowledgedAt IS NULL` before emitting. Use Redis Lua lock per patient per worker cycle |
| **Overwhelming doctor inbox** — During onboarding, a hospital may discover 500+ escalations at once | Batch notifications per hospital: one daily digest per doctor, plus real-time for top-5 most-critical (chronic disease tags: `DIABETES`, `CANCER`, `CARDIAC`) |
| **RLS bypass on raw SQL** — Direct `pg` queries skip Prisma's RLS helpers | ALWAYS use `SET LOCAL app.hospital_id` before any write. Add middleware assertion in `lib/rls-guard.ts` |
| **Worker crash → missed escalation** | BullMQ auto-retries (default: Redis persistence, exponential backoff, max 3 retries). Dead-letter queue alerts Sentry |
| **Notification curfew violation** — escalations shouldn't trigger doctor WhatsApp at 10 PM–8 AM IST | Reuse the existing `lib/notification-curfew.ts` utility. Enqueue at 8 AM if current time <br/> falls in curfew window |

## Migration Plan

1. **Add Prisma model** `EscalationAlert` + migration: `npx prisma migrate dev --name add-escalation-alert`
2. **Add alert event type** to `EventLog.type` enum (database-native enum patch)
3. **Deploy `escalation.worker.js`** (no downtime — starts cold, no existing data touched)
4. **Run one-shot backfill** for patients who are already overdue: `<code>lib/backfill-escalations.ts</code>` — connects via RLS, processes past 90 days
5. **Enable notification filter** in existing notification engine to carry `ESCALATION` event type
6. **Monitor** `escalation_events_total` Prometheus counter; alert on >5% escalation rate spike

## Open Questions

- [ ] Should escalated patients reappear in the doctor's task list with a different priority badge? (Recommended: yes, tag `urgent`)
