## ADDED Requirements

### Requirement: OWASP Top 10 compliance
The platform SHALL pass automated OWASP Top 10 vulnerability scanning with zero critical and zero high findings before production deployment.

#### Scenario: Automated OWASP scan
- **WHEN** CI pipeline runs security audit job
- **THEN** scan reports zero critical and zero high OWASP Top 10 vulnerabilities

## ADDED Requirements

### Requirement: SQL injection protection
All database queries SHALL use parameterized queries via Prisma ORM. Raw SQL SHALL only use parameterized `$queryRaw` or `$executeRaw` with bind parameters.

#### Scenario: Parameterized query enforcement
- **WHEN** developer writes raw SQL query
- **THEN** ESLint rule flags string interpolation in `$queryRaw`/`$executeRaw`

## ADDED Requirements

### Requirement: XSS protection
All user-generated content SHALL be sanitized before rendering. React's built-in JSX escaping SHALL be the default. `dangerouslySetInnerHTML` SHALL require explicit sanitization.

#### Scenario: XSS sanitization
- **WHEN** user submits HTML content in a form
- **THEN** content is sanitized server-side before storage and client-side before rendering

## ADDED Requirements

### Requirement: CSRF protection
All state-changing API endpoints SHALL validate CSRF tokens or use SameSite cookies with anti-forgery headers.

#### Scenario: CSRF token validation
- **WHEN** client submits POST/PATCH/DELETE request without CSRF token
- **THEN** server returns 403 Forbidden with CSRF validation error

## ADDED Requirements

### Requirement: Rate limiting
All public and authenticated endpoints SHALL enforce role-based rate limits (PATIENT=60, DOCTOR=120, HOSPITAL_ADMIN=200, SUPER_ADMIN=unlimited per minute). Rate limit headers SHALL be returned.

#### Scenario: Rate limit enforcement
- **WHEN** authenticated doctor exceeds 120 requests per minute
- **THEN** server returns 429 with `Retry-After` header

## ADDED Requirements

### Requirement: Secure headers
All responses SHALL include security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Strict-Transport-Security`, `Content-Security-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`.

#### Scenario: Security headers present
- **WHEN** any HTTP response is sent
- **THEN** all required security headers are present

## ADDED Requirements

### Requirement: Secrets management
All secrets SHALL be stored in environment variables or a secrets manager. No secrets SHALL be committed to version control. Secret rotation SHALL be supported without downtime.

#### Scenario: Secret rotation
- **WHEN** JWT secret is rotated
- **THEN** existing sessions remain valid during grace period, new sessions use new secret

## ADDED Requirements

### Requirement: DPDP compliance verification
The platform SHALL enforce data minimization, purpose limitation, and user consent tracking per DPDP requirements. Data export and deletion endpoints SHALL be available.

#### Scenario: Data export request
- **WHEN** user requests data export
- **THEN** system provides all user data in portable format within 30 days

## ADDED Requirements

### Requirement: PHI encryption
All PHI SHALL be encrypted at rest (AES-256-GCM or equivalent) and in transit (TLS 1.3). Database columns containing PHI SHALL be encrypted at the application layer.

#### Scenario: PHI encryption at rest
- **WHEN** PHI is stored in database
- **THEN** data is encrypted before persistence and decrypted only on authorized access

## ADDED Requirements

### Requirement: Audit log completeness
All authentication, authorization, data access, and data modification events SHALL be logged with actor, timestamp, action, resource, and outcome. Audit logs SHALL be append-only and tamper-evident.

#### Scenario: Complete audit trail
- **WHEN** doctor accesses patient record
- **THEN** audit log contains doctor ID, patient ID (pseudonymized), timestamp, action, and outcome

## ADDED Requirements

### Requirement: Session security
Sessions SHALL use HttpOnly, Secure, SameSite cookies with appropriate expiration. Session invalidation SHALL be immediate on logout or password change.

#### Scenario: Session invalidation
- **WHEN** user logs out
- **THEN** session cookie is invalidated server-side and client-side immediately

## ADDED Requirements

### Requirement: Refresh token rotation
Refresh tokens SHALL be rotated on each use. Reused refresh tokens SHALL be rejected, invalidating the entire token family.

#### Scenario: Refresh token rotation
- **WHEN** refresh token is used
- **THEN** new refresh token is issued, old token is invalidated

## ADDED Requirements

### Requirement: Tenant isolation verification
All database queries SHALL enforce RLS policies. Cross-tenant data access SHALL be prevented at both application and database layers. Automated tests SHALL verify tenant isolation.

#### Scenario: Cross-tenant access prevention
- **WHEN** Hospital A user attempts to access Hospital B patient data
- **THEN** access is denied at database layer with no data returned
