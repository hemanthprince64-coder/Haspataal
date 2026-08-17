# @haspataal/scheduling

Appointment scheduling domain package for the Haspataal platform.

## Purpose

Encapsulates appointment booking, cancellation, slot availability, and repository abstraction for the scheduling domain.

## Public API

| Export | Type | Description |
|--------|------|-------------|
| `BookAppointmentUseCase` | class | Books a new appointment after validating slot availability |
| `CancelAppointmentUseCase` | class | Cancels an existing appointment |
| `GetAvailableSlotsUseCase` | class | Returns available time slots for a doctor on a given date |
| `Appointment` | class | Domain entity representing an appointment |
| `IAppointmentRepository` | interface | Repository contract for appointment persistence |
| `PrismaAppointmentRepository` | class | Prisma-backed implementation of `IAppointmentRepository` |

### BookAppointmentUseCase

```ts
constructor(private appointmentRepo: IAppointmentRepository)

execute(request: BookAppointmentRequest): Promise<Appointment>
```

Throws `SLOT_ALREADY_TAKEN` if the requested slot is unavailable.

## Dependencies

| Package | Purpose |
|---------|---------|
| `@haspataal/db` | Prisma client access |
| `@haspataal/types` | Shared TypeScript types |

## What Must Remain Internal

- Repository implementation details
- Slot availability algorithms
- Domain entity validation rules

## Migration Notes

Previously part of `@haspataal/core` under:
- `core/domain/use-cases/`
- `core/domain/entities/`
- `core/domain/repositories/`
- `core/infrastructure/prisma/`

Legacy imports remain supported via `@haspataal/core` barrel exports. New code should import directly from `@haspataal/scheduling`.
