# ADR-002: PostgreSQL Index Strategy for High-Traffic Tables

## Status

**Accepted** — Implemented in `optimize_indexes.sql`

## Context

During Week 2 of development, hospital dashboard pages (`/hospital/dashboard`, `/hospital/opd`) exhibited noticeable latency when loading appointment lists, diagnostic orders, and visit histories. Initial investigation revealed:

- **Foreign key columns** (`patient_id`, `doctor_id`, `hospital_id`) on high-traffic tables lacked indexes.
- PostgreSQL was performing **sequential scans** (full table scans) for `WHERE` clauses on these columns.
- The `appointments` table, filtered by `doctor_id` + `date` on every slot availability check, was the worst offender.
- RLS policies (see ADR-001) add implicit `WHERE` predicates on `hospital_id` and `patient_id`, compounding the scan cost.

## Decision

Add **B-tree indexes** on all foreign key columns of tables that are:

1. Queried in dashboard list views (appointments, visits, diagnostic_orders)
2. Filtered by RLS policies (hospital_id, patient_id)
3. Used in join operations (diagnostic_order_items → orders, orders → tests)

### Index Inventory

| Table                    | Indexed Column   | Rationale                                        |
| ------------------------ | ---------------- | ------------------------------------------------ |
| `appointments`           | `patient_id`     | Patient history lookups, RLS policy filter       |
| `appointments`           | `doctor_id`      | Slot availability queries, doctor schedule views |
| `diagnostic_orders`      | `hospital_id`    | Tenant isolation, hospital lab dashboard         |
| `diagnostic_orders`      | `patient_id`     | Patient diagnostic history, RLS filter           |
| `diagnostic_orders`      | `doctor_id`      | Doctor's prescribed orders view                  |
| `diagnostic_order_items` | `order_id`       | Order detail expansion (1:N join)                |
| `diagnostic_order_items` | `test_id`        | Test catalog usage analytics                     |
| `visits`                 | `hospital_id`    | Tenant-scoped visit lists, RLS filter            |
| `visits`                 | `appointment_id` | Visit-to-appointment linking                     |
| `payments`               | `appointment_id` | Payment status lookups                           |
| `medical_records`        | `patient_id`     | Patient record history, RLS filter               |

### Why B-Tree (not GIN, GiST, or BRIN)

- All indexed columns are **UUIDs or foreign keys** — equality comparisons, not full-text or range queries.
- B-tree is the optimal index type for `=` and `IN` operators.
- `CREATE INDEX IF NOT EXISTS` ensures idempotent migrations.

## Alternatives Considered

| Alternative           | Why Rejected                                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prisma `@@index`**  | Prisma's `@@index` in schema.prisma doesn't support all index options. Raw SQL gives explicit control.                                                     |
| **Partial indexes**   | `WHERE status = 'active'` partials were considered but deferred — the filtering selectivity wasn't worth the maintenance overhead at current data volumes. |
| **Composite indexes** | `(doctor_id, date, slot)` composite was considered for appointment slot queries but deferred pending EXPLAIN ANALYZE data at production scale.             |

## Consequences

### Positive

- Dashboard list views load in <100ms for hospitals with up to 10k records.
- RLS policy enforcement overhead is negligible when the filter column is indexed.
- Idempotent `IF NOT EXISTS` syntax allows safe re-execution.

### Negative

- 11 additional indexes increase write amplification on INSERT/UPDATE operations.
- Index bloat may need periodic `REINDEX` at scale (10M+ rows).
- Indexes on UUID columns have higher storage overhead than integer indexes.

## References

- [optimize_indexes.sql](../../infra/sql/optimize_indexes.sql) — Index migration script
- ADR-001 — RLS policies that benefit from these indexes
