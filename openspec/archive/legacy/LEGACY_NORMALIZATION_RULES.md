# LEGACY NORMALIZATION RULES (Phase 0A)

Implementation: `normalizeLegacyOutbox(record)` in `packages/platform-contracts/src/events/outbox.ts`.

## Precedence (per field)
```
structured column (OutboxEvent row)   ──▶ use it
   else known legacy payload field     ──▶ use it (fallback)
   else safe default / null           ──▶ use it (never fabricate)
```

## Field mapping
| Envelope field | Structured column | Legacy payload fallback |
|---|---|---|
| `eventVersion` | `record.eventVersion` | `payload.eventVersion` → default `1` |
| `aggregate.aggregateType` | `record.aggregateType` | `payload.aggregateType` / `payload.aggregate?.aggregateType` |
| `aggregate.aggregateId` | `record.aggregateId` | `payload.aggregateId` / `payload.aggregate?.aggregateId` |
| `scope.scopeType` | `record.scopeType` | inferred `HOSPITAL` if any hospital id present, else `null` |
| `scope.hospitalId` | `record.hospitalId` | `payload.hospitalId` / `payload.tenantContext.hospitalId` / `payload.tenantScope.hospitalId` |
| `scope.tenantId` | `record.tenantId` | `payload.tenantId` / `payload.tenantContext.tenantId` |
| `actor.actorId` | `record.actorId` | `payload.actorId` / `payload.actorContext.actorId` / `payload.actorReference.actorId` |
| `actor.actorType` | `record.actorType` | `payload.actorType` / `payload.actorContext.actorType` / `payload.actorReference.actorType` |
| `actor.role` | `record.actorRole` | `payload.actorRole` / `payload.actorContext.role` |
| `chain.correlationId` | `record.correlationId` | `payload.correlationId` |
| `chain.causationId` | `record.causationId` | `payload.causationId` |
| `chain.depth` | `record.depth` | `payload.depth` → default `0` |
| `occurredAt` | `record.occurredAt` | `payload.occurredAt` → `null` (never fabricate) |
| `eventId` | `record.id` (always) | — |

## Safety rules (from brief §7)
1. Stable identity preserved: `eventId = record.id`.
2. Structured value present → used (no override by payload).
3. Structured absent + trustworthy legacy equivalent → normalized from payload.
4. Neither → unknown/null where the contract permits (NOT fabricated).
5. **Never invent a hospital ID** — if none supplied, `hospitalId = null`.
6. **Never invent a human actor** — system events keep `actorId = null`.
7. **Never invent an aggregate identity** — unknown → `null`.
8. Original `payload` is returned verbatim (no semantic rewrite).
9. `normalizedFromLegacy = !hasStructuredMetadata(record)` — observers can detect legacy rows.

## Example
Legacy row `{ id:'e1', eventType:'FOO', payload:{ hospitalId:'h-1', correlationId:'c-1' } }`
→ `{ eventId:'e1', scope.hospitalId:'h-1', chain.correlationId:'c-1',
       normalizedFromLegacy:true, occurredAt:null, ... }`.

Canonical row `{ id:'e2', eventType:'BAR', scopeType:'HOSPITAL', hospitalId:'h-2',
  correlationId:'c-2', causationId:'p-2', depth:2, occurredAt:'2026-07-09T10:00:00Z', payload:{...} }`
→ same values surfaced; `normalizedFromLegacy:false`.

Structured always wins over a conflicting legacy value (test 4 in PHASE_0A_TEST_MATRIX.md).
