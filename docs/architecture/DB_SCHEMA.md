Version: 2.0
Owner: Haspataal Engineering
Last Updated: 2026-08-04

# Database Schema & Design Rules

## Core Tables

- `HospitalsMaster`: Root tenant entity.
- `Patient`: Shared entity across tenants.
- `DoctorMaster`: Represents the practitioner.
- `Encounter`: The central clinical anchor for a patient visit.
- `ClinicalOrder`: Medical orders (Radiology, Lab, Pharmacy).
- `EventLog`: Immutable audit trail of all actions.

## Row Level Security (RLS) Rules

1. Every multi-tenant table MUST have a `hospital_id` column.
2. Prisma client queries MUST be wrapped in an RLS transaction wrapper that executes `SET LOCAL app.hospital_id = $1`.
3. Bypassing RLS requires explicit SuperAdmin credentials and bypass tokens.

## Prisma Modeling Rules

- **Quotes:** All string literals in attributes (like `@map("user_id")` or `@default("ACTIVE")`) MUST use double quotes to prevent P1012 parse crashes.
- **Passwords:** The `HospitalsMaster.password` field MUST be marked `@ignore` to prevent accidental inclusion in `SELECT *` operations.
- **Enums:** Prefer PostgreSQL Enums (`enum Role { ADMIN DOCTOR }`) over string types for state variables.
