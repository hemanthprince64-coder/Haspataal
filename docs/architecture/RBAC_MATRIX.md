Version: 2.0
Owner: Haspataal Engineering
Last Updated: 2026-08-04

# RBAC Matrix & Isolation

## Roles

- `SUPER_ADMIN`: Root platform owner (Haspataal Staff).
- `HOSPITAL_ADMIN`: Full access to a specific `hospital_id`.
- `DOCTOR`: Clinical access only (Prescriptions, OPD, IPD).
- `RECEPTIONIST`: Scheduling and billing access, no clinical editing.
- `PHARMACIST`: Pharmacy stock and dispensing only.
- `PATIENT`: Can only view their own Encounters and Appointments.

## Implementation Details

- **JWT Tokens:** Issued via `jose`. Include `role` and `hospitalId`.
- **Middleware:** Edge routing checks basic token validity and redirects unauthenticated users.
- **Server Actions:** Must explicitly wrap logic in `requireRole(Role.DOCTOR, ...)` or `requireHospitalAccess(hospitalId)`.
- **Data Isolation:** Enforced via PostgreSQL RLS `SET LOCAL app.hospital_id`.
