# Phase 1 Permission Matrix

## Role Definitions & Permissions

### Role Hierarchy
```
SUPER_ADMIN (Platform) > HOSPITAL_ADMIN > DOCTOR > RECEPTIONIST/NURSE/PHARMACIST/LAB_TECH > RESIDENT > PATIENT
```

### Permission Matrix

| Module | Action | SUPER_ADMIN | HOSPITAL_ADMIN | DOCTOR | RECEPTIONIST | NURSE | PHARMACIST | LAB_TECH | RADIO_TECH | PATIENT |
|--------|--------|-------------|----------------|--------|--------------|-------|------------|----------|------------|---------|
| Patients | create | ✓ | ✓ | ✓ | ✓ | | | | | ✓ (self) |
| Patients | read | ✓ | ✓ | ✓ | ✓ | ✓ | | | | ✓ (own) |
| Patients | update | ✓ | ✓ | ✓ | ✓ | | | | | ✓ (own) |
| Patients | delete | ✓ | ✓ | | | | | | | |
| Doctors | create | ✓ | ✓ | | | | | | | |
| Doctors | read | ✓ | ✓ | ✓ | ✓ | | | | | ✓ (public) |
| Doctors | update | ✓ | ✓ | ✓ (own) | | | | | | |
| Doctors | delete | ✓ | ✓ | | | | | | | |
| Appointments | create | ✓ | ✓ | ✓ | ✓ | | | | | ✓ (self) |
| Appointments | read | ✓ | ✓ | ✓ | ✓ | ✓ | | | | ✓ (own) |
| Appointments | update | ✓ | ✓ | ✓ | ✓ | | | | | ✓ (cancel) |
| Appointments | delete | ✓ | ✓ | | | | | | | |
| Visits | create | ✓ | ✓ | ✓ | ✓ | ✓ | | | | |
| Visits | read | ✓ | ✓ | ✓ | ✓ | ✓ | | | | ✓ (own) |
| Visits | update | ✓ | ✓ | ✓ | ✓ | ✓ | | | | |
| Prescriptions | create | ✓ | ✓ | ✓ | | | ✓ | | | |
| Prescriptions | read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (own) |
| Prescriptions | update | ✓ | ✓ | ✓ | | | ✓ | | | |
| Investigations | create | ✓ | ✓ | ✓ | | | | ✓ | ✓ | |
| Investigations | read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (own) |
| Investigations | update | ✓ | ✓ | | | | ✓ | ✓ | ✓ | |
| Billing | create | ✓ | ✓ | | | | ✓ | | | ✓ (own) |
| Billing | read | ✓ | ✓ | | ✓ | | | ✓ | ✓ | | ✓ (own) |
| Billing | update | ✓ | ✓ | | | | ✓ | | | | |

## RLS Policy Rules

### All Tables
```sql
-- Every table with tenant data must have this policy
CREATE POLICY "hospital_isolation_policy" 
ON table_name FOR ALL TO authenticated
USING (hospital_id = current_setting('hospital_id')::uuid);
```

### Platform-Level Tables (no hospital isolation)
- `audit_logs` - Platform-wide
- `doctors_master` - Core doctor identity
- `patients` - Cross-hospital identity