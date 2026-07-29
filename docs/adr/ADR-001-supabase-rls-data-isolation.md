# ADR-001: Using Supabase Row-Level Security for Multi-Tenant Data Isolation

## Status

**Accepted** — Implemented in `enable_rls_health_modules.sql` and `supabase_rls_audit_day11.sql`

## Context

Haspataal is a multi-tenant hospital SaaS platform where:

- **Multiple hospitals** share the same PostgreSQL database.
- Each hospital's **patient data, billing, prescriptions, and diagnostics** must be completely isolated.
- **Patients** must only access their own health records (family members, medications, vitals, vaccinations, pregnancy profiles, insurance).
- **Doctors** should only see appointments for hospitals they're affiliated with.
- **Platform Admins** need unrestricted read access for support and auditing.
- The platform handles **sensitive healthcare data** (PHI) subject to Indian data protection regulations.

The application layer already enforces tenant isolation via `hospitalId` filtering in Prisma queries. However, a single bug in application code (e.g., a missing `WHERE` clause) could expose one hospital's data to another.

## Decision

We implement **PostgreSQL Row-Level Security (RLS)** on all tenant-scoped tables as a **defense-in-depth** layer, enforced at the database level using Supabase's JWT-based RLS policies.

### Policy Design

1. **Patient Health Tables** (8 tables): `patient_id = JWT.id` check. Patients can only CRUD their own records.
2. **Hospital Core Tables** (hospitals_master, visits, diagnostic_orders): `hospital_id = JWT.hospitalId` check. Hospital Admins only see their own tenant.
3. **Appointments**: Compound policy — Patients see own, Hospital Admins see affiliated doctors' appointments (via subquery on `doctor_hospital_affiliations`).
4. **Platform Admin Override**: Permissive policies granting `PLATFORM_ADMIN` role full access on every table.

### JWT Claim Structure

```sql
current_setting('request.jwt.claims', true)::json->>'role'       -- PATIENT, HOSPITAL_ADMIN, PLATFORM_ADMIN
current_setting('request.jwt.claims', true)::json->>'id'         -- User's UUID
current_setting('request.jwt.claims', true)::json->>'hospitalId' -- Tenant UUID (Hospital Admins only)
```

## Alternatives Considered

| Alternative                       | Why Rejected                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| **Application-only filtering**    | Single point of failure. One missing WHERE clause = data breach. No defense-in-depth.       |
| **Separate databases per tenant** | Operationally expensive at scale. Prisma doesn't support dynamic database selection.        |
| **Schema-per-tenant**             | Complex migration management. Supabase doesn't natively support multi-schema RLS.           |
| **Citus/distributed sharding**    | Overengineered for current scale. Adds operational complexity without proportional benefit. |

## Consequences

### Positive

- **Defense-in-depth**: Even if application code has a bug, the database rejects unauthorized reads/writes.
- **Audit-friendly**: RLS policies are declarative SQL, easily auditable.
- **Supabase integration**: Policies leverage Supabase's built-in JWT claim parsing — no custom middleware.
- **Compliance**: Demonstrates technical controls for healthcare data protection.

### Negative

- **Prisma bypass needed**: Prisma doesn't natively support `SET LOCAL` for session variables. Hospital-scoped writes use raw `pg` pool with `SET LOCAL app.hospital_id`.
- **Performance overhead**: RLS adds a filter predicate to every query. Mitigated by B-tree indexes on `patient_id`, `hospital_id`, `doctor_id` (see `optimize_indexes.sql`).
- **Policy maintenance**: Every new table with tenant-scoped data requires a new RLS policy. Forgetting this creates a security gap.
- **Testing complexity**: Unit tests must simulate JWT claims or disable RLS for test environments.

## References

- [enable_rls_health_modules.sql](../../infra/sql/enable_rls_health_modules.sql) — Patient health table policies
- [supabase_rls_audit_day11.sql](../../infra/sql/supabase_rls_audit_day11.sql) — Core table policies (Week 2 Sprint)
- [CLAUDE.md](../../CLAUDE.md) — "Prisma/RLS Conflict" knowledge base entry
