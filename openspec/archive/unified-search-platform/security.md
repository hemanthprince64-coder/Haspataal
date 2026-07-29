# Search Security Architecture

## Security Layers

### Layer 1: Authentication
```
Middleware: Validate JWT or session token
Requirements:
  - All search endpoints require valid session
  - Unknown users redirected to login
  - Expired tokens return 401
```

### Layer 2: Authorization (RBAC)
```
Role Hierarchy:
  SUPER_ADMIN (highest)
  ├── HOSPITAL_ADMIN
  │   ├── DEPARTMENT_HEAD
  │   └── DOCTOR
  │       └── NURSE
  ├── PHARMACIST
  ├── LAB_TECH
  ├── RADIOLOGIST
  └── PATIENT (lowest)

Permission Matrix:
  | Endpoint | Super | Admin | Doctor | Nurse | Patient |
  |----------|-------|-------|--------|-------|---------|
  | /search | ✓ | ✓ | ✓ | ✓ | ✓ |
  | /search/autocomplete | ✓ | ✓ | ✓ | ✓ | ✓ |
  | /search/history | ✓ | ✓ | ✓ | ✓ | ✓ |
  | /admin/search/* | ✓ | ✓ | ✗ | ✗ | ✗ |
  | /admin/search/reindex | ✓ | ✓ | ✗ | ✗ | ✗ |
```

### Layer 3: Row Level Security (RLS)
```sql
-- Hospital Isolation Policy
CREATE POLICY "hospital_isolation" ON searchable_entities
  FOR ALL
  USING (
    hospital_id = current_setting('hospitable.current_hospital_id')::uuid
    OR entity_type = 'hospital'  -- Public hospitals searchable
  );

-- Patient Privacy Policy  
CREATE POLICY "patient_privacy" ON searchable_entities
  FOR ALL
  USING (
    entity_type IN ('hospital', 'doctor')  -- Public
    OR patient_id = current_setting('hospitable.current_patient_id')::uuid  -- Self
    OR EXISTS (  -- Doctor-patient relationship
      SELECT 1 FROM appointments 
      WHERE appointments.patient_id = searchable_entities.entity_id
      AND appointments.doctor_id = current_setting('hospitable.current_doctor_id')::uuid
      AND appointments.hospital_id = current_setting('hospitable.current_hospital_id')::uuid
    )
  );
```

### Layer 4: PHI Protection
```
Fields Masked in Search Results:
  - phone (masked: ****1234)
  - email (masked: ***@***.com)
  - address (truncated: Apartment ***, City)
  - abha_address (hashed, not searchable)

PHI Scrubbing in Logs:
  - Search query logged without identifying tokens
  - Patient IDs hashed in search_logs
  - Consent status checked before indexing
```

### Layer 5: Consent Enforcement
```
Pre-indexing Check:
  IF entity_type = 'patient':
    CHECK patient.consent_given = TRUE
    CHECK consent.scope IN ('search', 'marketing')

Dynamic Visibility:
  IF consent.revoked:
    DELETE FROM searchable_entities WHERE entity_id = patient.id
```

## Audit Trail

### Search Logging
```
Table: search_logs
Fields:
  - id: UUID
  - user_id: UUID (hashed)
  - hospital_id: UUID
  - query: TEXT (scrubbed of PHI)
  - entity_types: TEXT[]
  - result_count: INTEGER
  - latency_ms: INTEGER
  - user_role: TEXT
  - created_at: TIMESTAMP

Audit Rules:
  - All searches logged within 100ms
  - PHI scrubbed before logging
  - No failed searches logged (DoS prevention)
```

### Index Auditing
```
Table: search_audit
Fields:
  - id: UUID
  - operation: INDEX | DELETE | UPDATE
  - entity_type: TEXT
  - entity_id: UUID
  - performed_by: UUID
  - reason: TEXT
  - created_at: TIMESTAMP

Triggers:
  - Manual reindex logged
  - Bulk delete logged
  - Admin synonym changes logged
```

## Search Permissions

### Visibility Rules
```
Rule: entity_visibility = function(entity_type, user_role, context)

Cases:
  patient:
    - Patient: self only (patient_id match)
    - Doctor: assigned patients (via appointments/visits)
    - Admin: hospital scope
    - Super: all
    
  doctor:
    - Doctor/Nurse: hospital scope
    - Admin: all
    - Patient: none (unless specified)
    
  hospital:
    - All roles: basic info visible
    - Detailed info: role-based
    
  appointment:
    - Patient: own appointments
    - Doctor: appointments on their patients
    - Admin: hospital scope
    
  bill:
    - Patient: own bills
    - Admin: hospital scope
    - Financial staff: all
    
  journey:
    - Patient: own journeys
    - Doctor: journeys on their patients
    - Admin: hospital scope
```

### Sensitive Fields Masking
```typescript
const SENSITIVE_FIELDS = {
  patient: ['phone', 'email', 'address', 'abha_address', 'emergency_contact_phone'],
  doctor: ['mobile', 'email', 'consultation_fee'],
  bill: ['total_amount', 'insurance_details'],
  hospital: ['contact_number', 'official_email'],
};

function maskSensitive(entityType: string, entity: any, userRole: string) {
  if (userRole === 'super_admin') return entity;
  
  const fields = SENSITIVE_FIELDS[entityType] || [];
  for (const field of fields) {
    if (entity[field]) {
      entity[field] = maskValue(entity[field]);
    }
  }
  return entity;
}
```

## Cross Hospital Protection

### Isolation Enforcement
```
Rule: hospital_alignment = function(user_hospital, entity_hospital)

Enforced via:
  1. RLS in PostgreSQL
  2. Application-level check
  3. API middleware validation

Cross-hospital exceptions:
  - Super admin with explicit flag
  - Referral workflows (with audit trail)
  - Emergency access (time-limited)
```

## Threat Model

### STRIDE Analysis

| Threat | Vector | Mitigation |
|--------|--------|------------|
| **Spoofing** | Fake JWT tokens | JWT signature validation, short expiry |
| **Tampering** | Modify search query | Input validation, parameterized queries |
| **Repudiation** | Deny search access | Audit logging, immutable logs |
| **Information Disclosure** | PHI leakage via search | RLS, PHI masking, scrubbed logs |
| **Denial of Service** | Resource exhaustion queries | Query complexity limits, rate limiting |
| **Elevation of Privilege** | Access another tenant | RBAC, RLS, session attributes |

### Attack Scenarios

**Scenario 1: Cross-Tenant Search**
- Attack: Try to view another hospital's patients
- Mitigation: RLS policy + API validation + audit logging

**Scenario 2: PHI Extraction**
- Attack: Search queries to extract patient phones
- Mitigation: Field masking + query scrubbing + rate limits

**Scenario 3: Enumeration Attack**
- Attack: Sequential searches to enumerate patients
- Mitigation: Rate limiting + failed query throttling

**Scenario 4: Injection Attack**
- Attack: SQL injection via search query
- Mitigation: Parameterized queries + input sanitization

## Security Configuration

```yaml
security:
  authentication:
    required: true
    jwt_audience: "haspataal-search"
    session_timeout: 3600  # 1 hour
    
  authorization:
    enforce_rls: true
    require_audit: true
    max_query_length: 500
    
  rate_limiting:
    searches_per_minute: 60
    autocomplete_per_minute: 120
    admin_operations_per_hour: 100
    
  audit:
    log_queries: true
    scrub_phi: true
    retain_days: 90
    
  phi_protection:
    mask_fields: true
    exclude_from_index: ['mobile', 'email']  # Only for non-staff
    consent_required: ['patient', 'journey']
```

## Compliance Mapping

| Standard | Requirement | Implementation |
|----------|-------------|--------------|
| HIPAA | PHI protection | Field masking, RLS |
| GDPR | Right to be forgotten | Soft delete + hard delete schedule |
| SOC2 | Audit trails | Immutable logging |
| DPDP | Consent management | Consent check pre-indexing |