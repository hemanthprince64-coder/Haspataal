# OUTBOX PRODUCER INVENTORY (Phase 0A)

Inventory of `outboxEvent.create` call sites (source only, excluding `dist/`). Count: **19 direct
call sites** (the brief's "52+" likely counts all event-emitting paths incl. `emitEvent` and
`EventService.publish` transitive writers). Phase 0A migrates **none** of these; the relay
normalizes on read.

## Engine producers (structured envelope already used)
| File | Line | Shape |
|---|---|---|
| `packages/journey/src/engine.ts` | 54,91,151,189,257,294,343,380,430,459 | full command envelope (`commandId, commandVersion, target, tenantContext, actorContext, correlationId, idempotencyKey, timestamp, payload`) |
| `packages/settings/src/engine.ts` | 114 | same envelope |
| `packages/config/src/engine.ts` | 15 | same envelope |
| `packages/timeline/src/index.ts` | 173 | same envelope |
| `packages/rules/src/engine.ts` | 135 | structured, nested `commandPayload`, no `eventId` on envelope |
| `packages/notify/src/outbox.ts` | 48 | `PlatformEvent` schema: generates `eventId`, `eventVersion`, `causationId`, `traceId` |

## Service / app producers (minimal `{eventType, payload}`)
| File | Line | Shape |
|---|---|---|
| `services/event-emitter.ts` | 67 | `{eventType, payload:{...input.payload, hospitalId, patientId}}` (no id, no commandId) |
| `apps/hospital-hms/app/api/clinical/prescriptions/route.ts` | 73 | structured envelope |
| `apps/patient-portal/lib/infrastructure/waitlist-service.ts` | 39 | `{eventType, payload:{waitlistId, patientId, doctorId, slotTime}}` |
| `apps/patient-portal/lib/infrastructure/slot-engine.ts` | 127 | `{eventType:'APPOINTMENT_BOOKED', payload:{appointmentId, patientId, doctorId}}` |
| `apps/patient-portal/lib/ai/engine.ts` | 384 | `{eventType:'AI_RECOMPUTE_REQUIRED', payload:{visitId, clinicalNotes, patientProfile}}` |

## Transitive producers (call publish/emitEvent → outboxEvent)
- `apps/hospital-hms/lib/services/*` (pharmacy, icu, nursing, ot, billing, discharge, ipd,
  diagnostics) call `getTimelinePublisher().publish()` / `eventBus.publish()`.

## Representative pilot set (proven by the contract, NOT wired in 0A)
- (i) Simple producer pattern: `services/event-emitter.ts:67` (bare `{eventType, payload}`).
- (ii) Strongest state+outbox pattern: `packages/journey/src/engine.ts:54` (uses `prisma.$transaction`
      + `tx.outboxEvent.create` — the reference pattern for later migration).
- (iii) System-generated producer: `packages/notify/src/outbox.ts:48` (validates via
      `createPlatformEventSchema`, auto-generates `eventId`/`eventVersion`/`causationId`).

## Migration inventory (for later phases)
All minimal-shape producers above are candidates for `buildCanonicalOutbox` adoption in 0B.
No producer is changed in Phase 0A.
