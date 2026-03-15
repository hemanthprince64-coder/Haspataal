# Postgres Patterns — Haspataal
# Adapted from everything-claude-code `postgres-patterns` skill (MIT license)

## When to Use This Skill
Invoke this skill before:
- Writing any SQL migration (`scripts/*.sql`)
- Creating a new Prisma model that stores patient or hospital data
- Debugging slow API responses (likely a missing index)
- Adding a new multi-tenant table

---

## 1. Indexing Rules (NEVER skip these)

### Always index foreign keys
```sql
-- Every time you add a foreign key, add an index
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_hospital_id ON appointments(hospital_id);
```

### Always index RLS policy columns
```sql
-- hospital_id is used in every RLS policy — it MUST be indexed
CREATE INDEX idx_patients_hospital_id ON patients(hospital_id);
CREATE INDEX idx_appointments_hospital_id ON appointments(hospital_id);
```

### Composite indexes — equality first, range last
```sql
-- For "get appointments for hospital, ordered by date"
CREATE INDEX idx_appt_hospital_date ON appointments(hospital_id, scheduled_at DESC);

-- NOT: (scheduled_at, hospital_id) — wrong order
```

### Partial indexes for soft deletes
```sql
-- Only index active records
CREATE INDEX idx_doctors_active ON doctors(hospital_id) WHERE deleted_at IS NULL;
```

### Covering indexes (avoid table lookups)
```sql
-- Include columns used in SELECT to avoid heap fetch
CREATE INDEX idx_appt_cover ON appointments(hospital_id)
  INCLUDE (patient_id, doctor_id, scheduled_at, status);
```

---

## 2. Data Types (Critical for Haspataal)

| Data | Use | Never Use |
|---|---|---|
| IDs | `UUID DEFAULT gen_random_uuid()` | `SERIAL`, `int` |
| Money / Fees | `NUMERIC(10,2)` | `FLOAT`, `REAL` |
| Timestamps | `TIMESTAMPTZ` | `TIMESTAMP` (no TZ) |
| Status fields | `TEXT` + `CHECK` constraint | Unconstrained `VARCHAR` |
| Boolean flags | `BOOLEAN DEFAULT false` | `SMALLINT` 0/1 |
| Free text | `TEXT` | `VARCHAR(255)` (unnecessary limit) |

```sql
-- Correct Haspataal appointment schema pattern
CREATE TABLE appointments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals_master(id) ON DELETE CASCADE,
    doctor_id   UUID NOT NULL REFERENCES doctors_master(id),
    patient_id  UUID NOT NULL REFERENCES patients(id),
    fee         NUMERIC(10,2) NOT NULL,
    status      TEXT NOT NULL CHECK (status IN ('pending','confirmed','cancelled','completed')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Cursor Pagination (Required for `appointments` table)

```sql
-- NEVER use OFFSET on large tables
-- BAD:
SELECT * FROM appointments ORDER BY created_at DESC OFFSET 100 LIMIT 20;

-- GOOD — cursor pagination:
SELECT * FROM appointments
WHERE hospital_id = $1
  AND created_at < $last_cursor   -- cursor from previous page
ORDER BY created_at DESC
LIMIT 20;
```

In Prisma:
```typescript
// Cursor-based pagination for appointments
const appointments = await prisma.appointment.findMany({
  where: { hospitalId },
  take: 20,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { scheduledAt: 'desc' },
  select: { id: true, patientId: true, doctorId: true, scheduledAt: true, status: true }
});
```

---

## 4. SKIP LOCKED for Appointment Slot Queuing

```sql
-- Prevent two patients booking the same slot simultaneously
-- Use SKIP LOCKED pattern — 10x better than SELECT FOR UPDATE
SELECT id FROM appointment_slots
WHERE doctor_id = $1
  AND scheduled_at = $2
  AND is_booked = false
FOR UPDATE SKIP LOCKED
LIMIT 1;
```

---

## 5. Short Transactions (Critical)

```sql
-- NEVER hold a transaction open during external API calls
-- BAD:
BEGIN;
  SELECT ... FOR UPDATE;
  -- call Stripe/Razorpay payment API here (WRONG!)
  UPDATE appointments SET status = 'confirmed';
COMMIT;

-- GOOD:
-- 1. Call payment API OUTSIDE transaction
-- 2. Only start transaction when writing:
BEGIN;
  UPDATE appointment_slots SET is_booked = true WHERE id = $1;
  INSERT INTO appointments (...) VALUES (...);
COMMIT;
```

---

## 6. EXPLAIN ANALYZE Workflow

Run before shipping any new query that touches > 1000 rows:

```bash
psql $DATABASE_URL -c "
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT a.*, p.name, d.name
FROM appointments a
JOIN patients p ON p.id = a.patient_id
JOIN doctors_master d ON d.id = a.doctor_id
WHERE a.hospital_id = 'YOUR_HOSPITAL_UUID'
  AND a.scheduled_at > NOW()
ORDER BY a.scheduled_at ASC
LIMIT 20;
"
```

Flag for review if output contains:
- `Seq Scan` on a large table (> 10k rows)
- `cost=` numbers > 1000 on critical paths
- `rows` estimates wildly off from `actual rows`

---

## 7. RLS Performance Pattern

```sql
-- Wrap auth.uid() in SELECT to evaluate once per query, not per row
-- BAD (evaluated per row):
CREATE POLICY "patients_own" ON patients FOR SELECT
  USING (user_id = auth.uid());

-- GOOD (evaluated once):
CREATE POLICY "patients_own" ON patients FOR SELECT
  USING (user_id = (SELECT auth.uid()));
```

---

## 8. Batch Inserts (Never insert in a loop)

```typescript
// BAD — N individual inserts
for (const slot of slots) {
  await prisma.appointmentSlot.create({ data: slot });
}

// GOOD — single batch insert
await prisma.appointmentSlot.createMany({ data: slots });
```

---

## Anti-Pattern Checklist

- [ ] No `SELECT *` in Prisma — always use `select:` field list
- [ ] No `OFFSET` pagination — use cursor-based
- [ ] No `FLOAT` for money — use `NUMERIC(10,2)`
- [ ] No `TIMESTAMP` — always `TIMESTAMPTZ`  
- [ ] No foreign keys without index
- [ ] No transactions that span external API calls
- [ ] No RLS policy calling `auth.uid()` without `(SELECT auth.uid())`
- [ ] No `GRANT ALL` to application user

---
*Adapted from everything-claude-code `postgres-patterns` + Supabase postgres-best-practices (MIT license)*
