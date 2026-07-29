# CARE JOURNEY INTEGRATION AUDIT

Scope: Invariant M (Care Journey), and its integration with Discharge (F), Referral (G), Timeline (H.2).
No code modified.

## 1. What Exists (SOUND — reuse the new engine)
- **New Journey Engine** `packages/journey/src/engine.ts`: `enroll` (`:24`), `completeMilestone` (`:141`), `createTask` (`:243`), `completeTask` (`:333`), `sendPatientReminder` (`:428`) — all wrapped in `prisma.$transaction` + `outboxEvent.create`. M.3 PARTIAL-PASS.
- **Outbox relay** `workers/outbox-relay.worker.ts:64` dispatches `ADD_TO_TIMELINE_COMMAND`, `EVALUATE_RULE_COMMAND`, `SEND_NOTIFICATION_COMMAND`.
- **Timeline worker** `workers/timeline.worker.ts:402` ingests jobs → `prisma.timelineEvent`.
- **Journey API** `apps/hospital-hms/app/api/journeys/route.ts:35` — explicit manual enrollment.
- **Schema**: new `JourneyTemplate` (3761), `JourneyTemplateVersion` (3779), `JourneyInstance` (3791), `JourneyMilestone` (3814), `JourneyTask` (3830), `JourneyRisk` (3850).
- **M.16 — Multiple simultaneous journeys: PASS.** `getPatientJourneys` `findMany` (`journey/src/queries.ts:21`); no single-journey constraint.

## 2. What Contradicts (P0/P1)
- **M.1 — Journey Engine sole source of truth: CONTRADICTED / DUPLICATED.** A parallel legacy AI engine writes journey state directly: `apps/patient-portal/lib/ai/engine.ts:306 careJourney`, `:321 medicationPlan`, `:338 careRedFlag`, `:349 followUpPlan`, `:361 recoveryStep`, `:374 nudgeSchedule` — independent of `JourneyEngine`. Rules engine also bypasses: `packages/rules/src/engine.ts:203 update journeyMilestone`, `:163 prisma.task.create`.
- **M.5 / M.6 — Must NOT auto-enroll; doctor decides: CONTRADICTED.** Legacy AI path auto-creates `careJourney` whenever clinical notes are saved: `app/actions.ts:335 → services.ts:1276 → ai/engine.ts:303` (inside a single `$transaction`). No doctor enrollment decision.
- **M.8 — Discharge journey active only after PATIENT_LEFT→PATIENT_DISCHARGED: CONTRADICTED/MISSING.** `Admission.status` is a free String (`schema.prisma:1544`); discharge jumps `ADMITTED→DISCHARGED` (`ipd.ts:222`); no `PATIENT_LEFT` state. Discharge routes create NO journey at all.
- **M.9 — Activation failure must never block discharge: PARTIAL (currently safe by accident).** Neither HMS nor patient-portal discharge routes invoke journey activation, so they can't block. BUT visit completion (`actions.ts:335`) invokes AI journey creation SYNCHRONOUSLY; if AI/DB fails, the action returns error (`actions.ts:338`), blocking the clinician.

## 3. What Is Partial / Missing
- **M.2 — Timeline records only meaningful journey events: PARTIAL.** New engine emits timeline commands for enroll/milestone/task/reminder, but NO events for pause/stop/completion (methods missing).
- **M.3 — Transactional Outbox: PARTIAL.** New engine yes; rules `complete_milestone`/`update_record` bypass (`:203`,`:140`); legacy AI engine no outbox for its own mutations.
- **M.4 — Diagnosis/discharge/referral MAY suggest: PARTIAL.** Diagnosis→journey via AI (`ai/engine.ts:102`); discharge/referral create none.
- **M.10 — Failed activation retries via Outbox: PARTIAL.** New engine yes; legacy AI no.
- **M.11 — Immutable revisions: MISSING.** `JourneyTemplateVersion` (3779) exists but is never referenced. `JourneyInstance/Milestone/Task` mutated in place (`engine.ts:142,334`). No revision tables.
- **M.12 — Completed milestones immutable: PARTIAL.** `completeMilestone` sets `COMPLETED` (`:144`) but no guard; rules `complete_milestone` (`:203`) updates any milestone regardless of status.
- **M.13 — Only current/future milestones may change: MISSING.** No constraint/logic.
- **M.14 / M.15 — Ownership + history: MISSING.** `JourneyInstance.careTeam` is JSON (`schema.prisma:3801`); no `ownerId`, no reassignment service, no ownership history model.
- **M.17 — Patient-controlled pause/stop: MISSING.** `JourneyStatus` enum has `PAUSED/COMPLETED/CANCELLED` (`journey/src/types.ts:17`) but `JourneyEngine` exposes NO `pause`/`stop`/`resume` methods; no patient UI.
- **M.18 — Patient-controlled reminder preference: MISSING.** `NudgeSchedule` fixed days `[2,4,7]` (`ai/engine.ts:373`); no preference model/UI.
- **M.19 — Reminder activity ≠ adherence: PARTIAL.** Tables separate; but `logMedicationAction`/`submitCheckInAction` imported by `ContinuousCareHub.tsx:2` are **undefined in actions.ts** → runtime error.
- **M.20 — Engagement from template milestones: MISSING.** No code reads template milestones to compute engagement; `EngagementLog` only in tests.

## 4. Critical Finding — Discharge Risk
The new `JourneyEngine` is NOT connected to discharge/referral. This means:
- M.9 is not violated *on discharge* (no activation call).
- But the *intended* post-discharge journey (M.8) cannot fire because (a) no discharge Outbox event exists (DISCHARGE audit F.6) and (b) no `PATIENT_LEFT` gate exists.
- The legacy AI auto-enroll on visit-save (M.5/M.6) is the active contradiction to "doctor decides enrollment."

## 5. Must Refactor (reuse new engine; retire legacy)
- `apps/patient-portal/lib/ai/engine.ts` — migrate/retire legacy `careJourney`/related writes; route suggestions to `JourneyEngine.enroll` with explicit doctor decision.
- `packages/rules/src/engine.ts:203,163` — use `JourneyEngine` commands + Outbox, not direct `prisma.*.update/create`.
- `packages/journey/src/engine.ts` — add `pause`/`stop`/`resume` (M.17); enforce completed-milestone immutability + current/future-only edits (M.12/M.13); add `ownerId` + reassignment + ownership history (M.14/M.15); immutable revision on modification (M.11).
- `packages/db/prisma/schema.prisma` — add `ownerId` to `JourneyInstance`; add `CareJourneyRevision`; wire `JourneyTemplateVersion`.
- `apps/hospital-hms/app/api/journeys/route.ts` — integrate discharge/referral suggestion with explicit decision gate (never auto-enroll).

## 6. Migration Risk
- **High**: legacy `careJourney` tables (`recovery_steps`, `medication_plans`, `nudge_schedules`, …) populated by AI engine → backfill to `journey_instance` + dual-write cutover.
- **High**: rules direct-DB mutations → command/outbox semantics change.
- **Medium**: `packages/journey` has NO tests → regression risk.

## 7. Files Needing Change
- `apps/patient-portal/lib/ai/engine.ts`, `apps/patient-portal/app/actions.ts` (335, 2317 dead), `apps/patient-portal/components/ContinuousCareHub.tsx` (ghost imports)
- `packages/rules/src/engine.ts` (140, 163, 203)
- `packages/journey/src/engine.ts`, `queries.ts`, `types.ts`
- `workers/followup.worker.ts` (operates on legacy `FollowUp`)
- `packages/db/prisma/schema.prisma` (JourneyInstance 3791, add revision/owner)
