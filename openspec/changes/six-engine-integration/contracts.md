# Platform Shared Contracts

These contracts must be implemented in the `packages/platform-contracts` directory using strict TypeScript types and Zod schemas. They form the canonical communication boundaries across engines.

## 1. Tenant Context
```typescript
interface TenantContext {
  platformId: string; // Master platform identifier
  hospitalGroupId?: string; // For multi-hospital chains
  hospitalId: string; // The primary isolation boundary for RLS
  branchId?: string; // Sub-location within a hospital
  departmentId?: string;
  activeScope: 'HOSPITAL' | 'BRANCH' | 'DEPARTMENT';
  tenantMembershipId?: string; // Identity link for cross-tenant users
}
```
*Mandatory verification server-side; NEVER trusted blindly from the client.*

## 2. Actor Context
```typescript
interface ActorContext {
  actorId: string; // Globally unique identifier for the caller
  actorType: 'SYSTEM' | 'USER' | 'PATIENT';
  userId?: string; 
  staffId?: string;
  doctorId?: string;
  patientId?: string;
  roleIds: string[];
  permissionIds: string[];
  sessionId?: string;
  deviceId?: string;
  authenticationStrength: 'MFA' | 'PASSWORD' | 'OTP';
  delegatedAccess: boolean;
  impersonationState?: {
    originalActorId: string;
    reason: string;
  };
}
```
*Permissions must be resolved server-side where required, not overloaded into the JWT.*

## 3. Access Context
```typescript
interface AccessContext {
  tenantScope: string;
  resourceScope: string;
  careRelationship?: string;
  patientOwnership?: boolean;
  familyDelegation?: boolean;
  consentGranted: boolean;
  purposeOfUse: 'CLINICAL' | 'ADMINISTRATIVE' | 'BILLING' | 'EMERGENCY';
  emergencyOverride: boolean;
  breakGlassStatus: boolean;
  accessReason?: string;
}
```

## 4. Standard Event Envelope
```typescript
interface PlatformEvent<TPayload> {
  eventId: string; // UUID v4/v7
  eventName: string;
  eventVersion: number;
  occurredAt: Date;
  publishedAt: Date;
  producer: string; // e.g. "hms-core", "journey-engine"
  tenantContext: TenantContext;
  actorReference: ActorContext;
  subjectReference?: { type: string, id: string };
  correlationId: string; // Ties a workflow together
  causationId: string; // Points to the event/command that caused this
  traceId: string; // For distributed tracing (OpenTelemetry)
  idempotencyKey: string;
  payload: TPayload;
  metadata: Record<string, string>; // NO PHI ALLOWED
}
```

## 5. Command Envelope
```typescript
interface PlatformCommand<TPayload> {
  commandId: string;
  commandVersion: number;
  target: string; // Target Engine/Service
  tenantContext: TenantContext;
  actorContext: ActorContext;
  correlationId: string;
  causationId?: string;
  idempotencyKey: string;
  timestamp: Date;
  payload: TPayload;
}
```

## 6. Query Contract
```typescript
interface PlatformQuery<TFilters> {
  tenantScope: TenantContext;
  actorScope: ActorContext;
  resourceAuthorization: AccessContext;
  filters: TFilters;
  sorting?: { field: string; direction: 'asc' | 'desc' }[];
  pagination?: { cursor?: string; limit: number };
  projection?: string[]; // Fields to return
  correlationId: string;
}
```

## 7. Configuration Resolution
```typescript
interface ConfigurationRequest {
  key: string;
  tenantContext: TenantContext;
  actorContext?: ActorContext;
}

interface ResolvedConfiguration<T> {
  key: string;
  resolvedValue: T;
  sourceScope: 'PLATFORM' | 'GROUP' | 'HOSPITAL' | 'BRANCH' | 'DEPARTMENT' | 'USER';
  sourceIdentifier: string;
  version: number;
  resolvedAt: Date;
  expiry: Date;
  policyLock: boolean;
  fallbackUsed: boolean;
  lastKnownGoodStatus: boolean;
}
```

## 8. Standard Error Model
```typescript
interface StandardError extends Error {
  code: ErrorCode;
  safeMessage: string; // For UI
  internalContext: Record<string, any>; // For logs (NO PHI)
  correlationId: string;
  retryable: boolean;
}

enum ErrorCode {
  AuthenticationError = 'ERR_AUTH_UNAUTHENTICATED',
  AuthorizationError = 'ERR_AUTH_FORBIDDEN',
  TenantScopeError = 'ERR_TENANT_MISMATCH',
  ConsentError = 'ERR_CONSENT_MISSING',
  ValidationError = 'ERR_VALIDATION',
  ConflictError = 'ERR_CONFLICT',
  NotFoundError = 'ERR_NOT_FOUND',
  RateLimitError = 'ERR_RATE_LIMIT',
  ConfigurationError = 'ERR_CONFIG_INVALID',
  DependencyUnavailableError = 'ERR_DEPENDENCY_DOWN',
  IdempotencyConflictError = 'ERR_IDEMPOTENCY_CONFLICT'
}
```
