# Security Architecture

## Overview
Comprehensive security architecture covering authentication, authorization, multi-tenancy, encryption, MFA, audit, OWASP compliance, API security, session management, device management, consent management, and compliance requirements.

## Authentication

### JWT Authentication
- **Algorithm**: HS256/RS256 (configurable)
- **Token Expiry**: 7 days for access, 30 days for refresh
- **Claims**: user ID, mobile, role, hospital ID, exp, iat
- **Refresh**: Rotating refresh tokens

### OTP Authentication
- **Channel**: SMS (primary), WhatsApp (secondary), Email (backup)
- **Format**: 6-digit numeric code
- **Expiry**: 5 minutes
- **Rate Limit**: 3 requests per minute per IP
- **Lockout**: 3 failed attempts = 15 minute lockout

### Password Security
- **Hashing**: bcrypt with salt rounds 12
- **Requirements**: Min 8 chars, mixed case, number, special char
- **Reset**: OTP-based reset flow
- **History**: No reuse of last 5 passwords

## Authorization

### RBAC (Role-Based Access Control)

#### Roles
| Role | Level | Description |
|------|-------|-------------|
| PLATFORM_ADMIN | System | Full system access |
| HOSPITAL_ADMIN | Tenant | Full hospital operations |
| DOCTOR | Tenant | Clinical operations |
| NURSE | Tenant | Nursing operations |
| RECEPTIONIST | Tenant | Registration, appointments |
| LAB_TECH | Tenant | Lab operations |
| RADIO_TECH | Tenant | Radiology operations |
| PHARMACIST | Tenant | Pharmacy operations |
| PATIENT | User | Own records access |

#### Permission Matrix
| Module | Platform Admin | Hospital Admin | Doctor | Nurse | Receptionist | Patient |
|--------|----------------|--------------|--------|-------|--------------|---------|
| Doctors | CRUD | CRUD (hospital) | R (self) | R | R | - |
| Patients | RUD | CRU | CRU (assigned) | CRU | CRU | R (own) |
| Prescriptions | - | - | CRU (created) | - | - | R (own) |
| Lab Orders | - | - | CRU (created) | - | - | R (own) |
| Billing | - | CRUD | - | - | CRUD | R (own) |
| Settings | CRUD | CRU | - | - | - | - |

## Multi-Tenancy

### RLS (Row Level Security)
- **Implementation**: PostgreSQL RLS policies
- **Hospital Isolation**: All tables filter by hospital_id
- **Doctor Isolation**: Doctors only see their hospital data
- **Patient Isolation**: Patients only see their records

### Tenant Context
```sql
-- Set context on each request
SET request.hospital_id = 'hospital-uuid';
SET request.role = 'DOCTOR';
SET request.user_id = 'user-uuid';
```

### Cross-Hospital Sharing
- **Explicit Consent Required**: Patient must consent
- **Audit Trail**: All access logged
- **Time-bound**: Consent expires/requires renewal

## Encryption

### Data at Rest
- **AES-256**: All PHI encrypted
- **Key Management**: Environment variables or KMS
- **Fields**: Patient phone, address, documents, notes

### Data in Transit
- **TLS 1.3**: All API connections
- **HSTS**: Strict transport security
- **Certificate**: Valid SSL certificate

### Document Storage
- **S3/R2**: Encrypted storage
- **Signed URLs**: Time-limited access
- **Virus Scanning**: ClamAV integration (stub)

## MFA (Multi-Factor Authentication)

### SMS OTP
- **Trigger**: Login, sensitive operations
- **Fallback**: Email OTP if SMS fails
- **Verification**: Required for high-risk actions

### Future MFA
- **TOTP**: Google Authenticator, Authy
- **WebAuthn**: Biometric/FIDO2 support
- **WhatsApp**: Channel for OTP delivery

## Audit

### Audit Log Entries
```json
{
  "userId": "user-uuid",
  "hospitalId": "hospital-uuid",
  "action": "PATIENT_CREATE",
  "entity": "patient",
  "entityId": "patient-uuid",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2026-06-29T21:00:00Z",
  "oldValue": {},
  "newValue": {}
}
```

### Audited Actions
- Patient CRUD
- Doctor CRUD
- Prescription creation
- Lab/Radiology orders
- Billing operations
- Consent changes
- Login/logout
- Failed authentication

### Audit Retention
- **Primary**: 7 years (compliance)
- **Archive**: Cold storage after 2 years
- **Access**: Admin-only, with reason

## OWASP API Security

### API Top 10 Compliance

#### 1. Broken Object Level Authorization
- **Solution**: RLS on all tables
- **Verification**: Every query checks ownership

#### 2. Broken User Authentication
- **Solution**: Strict JWT validation
- **Rate Limiting**: Sliding window Redis

#### 3. Excessive Data Exposure
- **Solution**: Field-level filtering
- **API Response**: Only return authorized fields

#### 4. Lack of Resources & Rate Limiting
- **Solution**: Redis sliding window
- **Limits**: Per-endpoint rate limits

#### 5. Broken Function Level Authorization
- **Solution**: RBAC middleware
- **Decorator**: `withPermission` wrapper

#### 6. Mass Assignment
- **Solution**: Zod validation schemas
- **Whitelist**: Explicit field allowlists

#### 7. Security Misconfiguration
- **Solution**: Helmet middleware
- **CSP**: Content Security Policy
- **CORS**: Strict origin whitelist

#### 8. Injection
- **Solution**: Prisma parameterized queries
- **Validation**: Input sanitization

#### 9. Improper Assets Management
- **Solution**: Asset inventory
- **Version**: API version headers

#### 10. Insufficient Logging
- **Solution**: Comprehensive audit logging
- **Monitoring**: Sentry integration

## Session Management

### JWT Configuration
```javascript
{
  expiresIn: '7d',
  issuer: 'haspataal.com',
  algorithms: ['HS256']
}
```

### Token Storage
- **HTTP Only**: Secure cookie
- **SameSite**: Strict
- **Refresh**: Rotating refresh token

### Session Revocation
- **Logout**: Clear cookies, blacklist token
- **Timeout**: Auto-expiry
- **Device**: Track active sessions

## Device Management

### Device Tracking
- Device fingerprint
- Last login timestamp
- IP address logging
- User agent tracking

### Device Recognition
- Trusted device tokens
- New device alerts
- Device-specific MFA

## Consent Management

### Consent Types
| Type | Purpose | Duration |
|------|---------|----------|
| APPOINTMENT_BOOKING | Allow appointment booking | 1 year |
| HEALTH_RECORDS | Share medical records | 1 year |
| MARKETING | Promotional communications | 1 year |
| AI_ASSISTANCE | AI-generated health insights | Optional |
| RESEARCH | Anonymized data for research | Optional |
| EMERGENCY_OVERRIDE | Emergency access bypass | Single-use |

### Consent Versioning
- **Versioning**: Each consent type has version
- **History**: Previous consents archived
- **Audit**: All changes logged

## Compliance

### DPDP Act (Digital Personal Data Protection)
- **Consent**: Explicit granular consent
- **Portability**: Data export functionality
- **Erasure**: Right to be forgotten with legal hold
- **Processing**: Purpose limitation

### HIPAA Readiness
- **PHI**: Protected health information encryption
- **Access**: Minimum necessary principle
- **Audit**: Comprehensive access logging
- **Breach**: Notification procedures

### Security Checklist
- [ ] All endpoints HTTPS only
- [ ] JWT secrets in environment
- [ ] Database credentials secured
- [ ] RLS policies applied
- [ ] Audit logging enabled
- [ ] Rate limiting configured
- [ ] Input validation everywhere
- [ ] Error messages sanitized
- [ ] Dependencies updated
- [ ] Security scan passed

## Threat Model

### STRIDE Analysis

#### Spoofing
- **Mitigation**: JWT with strong secrets
- **Detection**: Device fingerprinting
- **Response**: Alert on anomalies

#### Tampering
- **Mitigation**: Input validation, ORM
- **Detection**: Audit logs
- **Response**: Rollback capability

#### Repudiation
- **Mitigation**: Non-repudiable audit logs
- **Detection**: IP logging, user agents
- **Response**: Evidence retention

#### Information Disclosure
- **Mitigation**: Field-level authorization
- **Detection**: Anomaly monitoring
- **Response**: Access blocking

#### Denial of Service
- **Mitigation**: Rate limiting, circuit breakers
- **Detection**: Resource monitoring
- **Response**: Auto-scaling, alerts

#### Elevation of Privilege
- **Mitigation**: RBAC, re-verify on sensitive ops
- **Detection**: Audit alerts
- **Response**: Session termination

## Incident Response

### Security Incident Flow
1. **Detection**: Automated alert or user report
2. **Triage**: Severity assessment
3. **Containment**: Isolate affected systems
4. **Investigation**: Root cause analysis
5. **Remediation**: Fix vulnerability
6. **Recovery**: Restore normal operations
7. **Post-mortem**: Document lessons learned

### Contact
- **Security Team**: security@haspataal.com
- **Emergency**: +91-XXX-XXX-XXXX
- **PGP**: Available on request