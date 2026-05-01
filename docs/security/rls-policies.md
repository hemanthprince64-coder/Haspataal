# RLS Policies — Plain English Reference

This document explains every Row-Level Security policy in the Haspataal database in plain language, grouped by the business rule each policy enforces.

> **Source files**: [`enable_rls_health_modules.sql`](../../enable_rls_health_modules.sql), [`supabase_rls_audit_day11.sql`](../../supabase_rls_audit_day11.sql)

---

## How RLS Works in Haspataal

Every authenticated request to Supabase carries a JWT token with claims:

```json
{
  "role": "PATIENT", // or HOSPITAL_ADMIN, DOCTOR, PLATFORM_ADMIN, AGENT
  "id": "uuid-of-user", // The user's primary key
  "hospitalId": "uuid-of-hosp" // Only for hospital-scoped roles
}
```

PostgreSQL reads these claims via `current_setting('request.jwt.claims')` and automatically filters every query. **Even if application code forgets a WHERE clause, the database rejects unauthorized rows.**

---

## Patient Health Tables (8 tables)

> Source: `enable_rls_health_modules.sql`

These tables store sensitive personal health information. The business rule is simple:

> **"A patient can only see and modify their own health data."**

| Table                     | Business Rule                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `family_members`          | A patient can only view/add/edit/delete their own family members                     |
| `patient_medical_history` | A patient's chronic diseases, past surgeries, and allergies are visible only to them |
| `patient_medications`     | Current medications list is private to the patient                                   |
| `vital_records`           | Weight, blood pressure, blood sugar readings are private                             |
| `vaccination_records`     | Vaccination history is private                                                       |
| `pregnancy_profiles`      | Pregnancy tracking data (LMP, EDD, high-risk flags) is highly sensitive              |
| `insurance_details`       | Insurance policy numbers and coverage amounts are private                            |
| `user_profiles`           | Patient profile information (address, emergency contacts) is private                 |

### Policy Logic (identical for all 8 tables)

```
IF user.role = 'PATIENT' AND row.patient_id = user.id
THEN allow SELECT, INSERT, UPDATE, DELETE
```

### Platform Admin Override

All 8 tables also have a `PLATFORM_ADMIN` override policy:

```
IF user.role = 'PLATFORM_ADMIN'
THEN allow ALL operations
```

**Business justification**: Platform admins may need to assist patients with medical support queries or perform data audits. This access should be logged and monitored.

---

## Hospital Core Tables

> Source: `supabase_rls_audit_day11.sql`

### `hospitals_master` — Hospital Profile Data

| Policy                             | Who              | Can Do      | Business Rule                                                                                                                                               |
| ---------------------------------- | ---------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform Admin Full Access         | `PLATFORM_ADMIN` | ALL         | Super admins manage all hospitals (approvals, suspensions)                                                                                                  |
| Hospital Admin Access Own Hospital | `HOSPITAL_ADMIN` | ALL         | An admin can only edit their own hospital's profile (name, address, branding)                                                                               |
| Patients View Verified Hospitals   | `PATIENT`        | SELECT only | Patients can browse hospitals, but **only active ones** (`account_status = 'active'`). Inactive, suspended, or pending hospitals are hidden from discovery. |

### `appointments` — Patient Appointments

| Policy                                  | Who              | Can Do | Business Rule                                                                                                                                                                                         |
| --------------------------------------- | ---------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform Admin Full Access              | `PLATFORM_ADMIN` | ALL    | Auditing and support                                                                                                                                                                                  |
| Patient Access Own Appointments         | `PATIENT`        | ALL    | A patient can view, book, and cancel **only their own** appointments                                                                                                                                  |
| Hospital Manage Affiliated Appointments | `HOSPITAL_ADMIN` | ALL    | A hospital admin can manage appointments **only for doctors affiliated with their hospital**. Uses a subquery: `doctor_id IN (SELECT doctor_id FROM affiliations WHERE hospital_id = JWT.hospitalId)` |

> **Why the subquery?** A hospital admin shouldn't see appointments for doctors who work at other hospitals. The affiliation table acts as the authorization bridge.

### `visits` — OPD/IPD Visit Records

| Policy                           | Who              | Can Do | Business Rule                                                                                                                                 |
| -------------------------------- | ---------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform Admin Full Access       | `PLATFORM_ADMIN` | ALL    | Auditing                                                                                                                                      |
| Hospital Strict Tenant Isolation | `HOSPITAL_ADMIN` | ALL    | **Strictest policy**: `hospital_id = JWT.hospitalId`. A hospital can only see visits that occurred at their facility. No cross-tenant access. |

### `diagnostic_orders` — Lab Test Orders

| Policy                           | Who              | Can Do      | Business Rule                                                                                              |
| -------------------------------- | ---------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| Hospital Strict Tenant Isolation | `HOSPITAL_ADMIN` | ALL         | A hospital can only manage diagnostic orders placed at their facility                                      |
| Patient Own Orders               | `PATIENT`        | SELECT only | A patient can **view** (but not modify) their own lab orders. Modifications go through the hospital admin. |

---

## Security Gaps & Known Limitations

> [!WARNING]
> These are documented gaps that should be addressed in future security sprints.

1. **Doctor role not covered**: The `doctors_master` table has RLS enabled but no explicit DOCTOR-role policies. Currently, doctor data access is filtered in application code only.

2. **Billing tables**: `bills`, `payments`, `bill_items` do not have RLS policies yet. Tenant isolation is enforced by application-level `hospitalId` filtering.

3. **HMS operational tables**: `drug_stocks`, `beds`, `departments`, `hospital_roles` lack RLS. These are protected by the `requireHospitalAccess` middleware but not at the database level.

4. **No DOCTOR-specific appointment policy**: Doctors can't directly query their own appointments via RLS. They currently go through the Hospital Admin policy (since doctors access data through the HMS app, which authenticates as `HOSPITAL_ADMIN`).

5. **Service role bypass**: Application code using the Prisma client connects with the `service_role` key, which **bypasses RLS entirely**. RLS only protects direct Supabase client connections (PostgREST). The application layer is the primary access control for Prisma-based queries.

---

## Policy Application Order

```
1. Request arrives at Supabase
2. JWT is parsed → role, id, hospitalId extracted
3. For each table in the query:
   a. Check if RLS is enabled → if not, full access (DANGER)
   b. Evaluate ALL matching policies (OR logic for PERMISSIVE)
   c. If ANY policy returns TRUE → row is visible
   d. If NO policy matches → row is invisible (silently filtered)
4. Results returned to client
```

> [!IMPORTANT]
> Supabase uses **PERMISSIVE** policies (OR logic). If a user matches BOTH the "Patient Access Own" AND "Platform Admin" policies, they get access. This is intentional — Platform Admins should be able to access everything.
