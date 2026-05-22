## 1. Database & Migration

- [ ] 1.1 Add `EscalationAlert` model to `packages/db/prisma/schema.prisma`
- [ ] 1.2 Generate and apply Prisma migration: `npx prisma migrate dev --name add-escalation-alert`
- [ ] 1.3 Add `CHRONIC_ESCALATION_REQUIRED` to `EventLog.type` Postgres enum (SQL patch)
- [ ] 1.4 Verify `EscalationAlert` has unique constraint on `(appointmentId, hospitalId)` to prevent duplicates

## 2. Backend — Escalation Worker

- [ ] 2.1 Create `workers/escalation.worker.js` — BullMQ worker processing `FollowUp` queue
- [ ] 2.2 Implement `countConsecutiveMissed(patientId, hospitalId)` using RLS-scoped `pg` transaction
- [ ] 2.3 Compare missed count against hospital threshold (default = 2); emit `CHRONIC_ESCALATION_REQUIRED` event
- [ ] 2.4 Add idempotency guard: `SELECT ... WHERE acknowledgedAt IS NULL` before INSERT
- [ ] 2.5 Integrate Redis Lua lock per patient to prevent re-processing within same worker cycle
- [ ] 2.6 Integrate `lib/notification-curfew.ts` to defer escalation notifications outside 8 AM–10 PM IST
- [ ] 2.7 Add `escalation_events_total` Prometheus counter with labels: `hospitalId`, `chronicTag`, `acknowledged`

## 3. Backend — API Gateway Routes

- [ ] 3.1 Add `GET /v1/escalations` — returns paginated list of unacknowledged escalations for the caller's doctor via `requireRole('DOCTOR')`
- [ ] 3.2 Add `PATCH /v1/escalations/:id/acknowledge` — sets `acknowledgedAt = NOW()`, returns 204
- [ ] 3.3 Add rolling Redis rate-limit via `ioredis` sliding window on both endpoints (120 req/min per doctor)
- [ ] 3.4 Add input validation using Zod schema: `AcknowledgeEscalationSchema({ escalationId: z.string().uuid() })`
- [ ] 3.5 Confirm `X-Request-ID` correlation header on all escalation route responses

## 4. Frontend — Escalation Triage Widget

- [ ] 4.1 Create `apps/patient-portal/components/hospital/EscalationCard.tsx` — single escalation card with SHADCN Card, Lucide Siren icon, patient/hospital/missedCount fields, acknowledge button
- [ ] 4.2 Create `apps/patient-portal/app/hospital/escalations/page.tsx` — server component fetching from `GET /v1/escalations`
- [ ] 4.3 Wire up `AcknowledgeButton` with optimistic UI update (client action calls `PATCH`)
- [ ] 4.4 Add routing link to sidebar or dashboard nav under label "Escalations" (with priority badge)

## 5. Backfill & Data Migration

- [ ] 5.1 Create `lib/backfill-escalations.ts` — iterates appointments in the past 90 days, evaluates missed sequences
- [ ] 5.2 Add `--dry-run` flag to backfill script (no DB writes)
- [ ] 5.3 Add `--since <date>` flag for targeted re-runs
- [ ] 5.4 Run dry-run against staging and review results with product/clinical team
- [ ] 5.5 Run live backfill — target < 500ms per patient, break into batches of 100

## 6. Notification Engine Integration

- [ ] 6.1 Add `ESCALATION` to `NotificationEventMapping` in the Communications Hub
- [ ] 6.2 Create `ESCALATION_ALERT` WhatsApp template in the template registry
- [ ] 6.3 Verify WhatsApp → SMS fallback fires on error 131026 (unregistered recipient)
- [ ] 6.4 Test end-to-end: missed follow-up → escalation alert → WhatsApp received → HMS acknowledge button works

## 7. Observability & Testing

- [ ] 7.1 Add `escalation_events_total` Prometheus counter with `acknowledged` label (rackets/120 req/min test against stubbed rate limiter)
- [ ] 7.3 Add `apps/patient-portal/__tests__/escalation-card.test.tsx` (RTL + jest-dom)
- [ ] 7.4 Add `apps/patient-portal/__tests__/escalations-api.test.ts` (GPT-5.2)
- [ ] 7.5 Register `escalation.worker.js` as a supervisord/systemd unit in `docker-compose.yml`

## 8. CI/CD & Release

- [ ] 8.1 Add OpenAPI spec entries for `GET /v1/escalations` and `PATCH /v1/escalations/:id/acknowledge` in `docs/openapi/haspataal-api.yaml`
- [ ] 8.2 Ensure `make migrate` includes the escalation migration in local Docker stack
- [ ] 8.3 Update `docs/architecture/README.md` with sequence diagram: "Escalation Alert Flow"
- [ ] 8.4 Update `CLAUDE.md` knowledge base: "Chronic Escalation backfill must run before production activation"
