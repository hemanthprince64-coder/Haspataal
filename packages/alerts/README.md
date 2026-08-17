# @haspataal/alerts

Clinical alerting domain package for the Haspataal platform.

## Purpose

Provides alert retrieval, filtering, and severity-sorted aggregation for hospital clinicians and administrators.

## Public API

| Export | Type | Description |
|--------|------|-------------|
| `AlertService` | class | Main service for clinical alert operations |

### AlertService

```ts
constructor(private readonly prisma: PrismaClient)

getAlerts(hospitalId: string, options?: {
  patientId?: string;
  status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ALL';
  severity?: AlertSeverity;
  limit?: number;
  offset?: number;
}): Promise<ClinicalAlert[]>

getPatientTimeline(hospitalId: string, patientId: string): Promise<TimelineItem[]>
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@haspataal/db` | Prisma client access |
| `@prisma/client` | Database schema types |

## What Must Remain Internal

- Prisma query implementation details
- Severity sorting logic
- Filter normalization

## Migration Notes

Previously part of `@haspataal/core` under `core/domain/alerts/alertService.ts`.

Legacy imports remain supported:

```ts
import { AlertService } from '@haspataal/core';
```

New code should import directly:

```ts
import { AlertService } from '@haspataal/alerts';
```

The compatibility stub in `packages/core/domain/alerts/alertService.ts` will be removed after MVP cleanup.
