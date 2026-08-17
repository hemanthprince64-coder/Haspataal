export enum ErrorCode {
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
  IdempotencyConflictError = 'ERR_IDEMPOTENCY_CONFLICT',
  InternalError = 'ERR_INTERNAL_SERVER'
}

export class StandardError extends Error {
  public code: ErrorCode;
  public safeMessage: string;
  public internalContext: Record<string, any>;
  public correlationId: string;
  public retryable: boolean;

  constructor(params: {
    code: ErrorCode;
    safeMessage: string;
    internalContext?: Record<string, any>;
    correlationId: string;
    retryable?: boolean;
    originalError?: Error;
  }) {
    super(params.safeMessage);
    this.name = 'StandardError';
    this.code = params.code;
    this.safeMessage = params.safeMessage;
    this.internalContext = params.internalContext || {};
    this.correlationId = params.correlationId;
    this.retryable = params.retryable ?? false;

    if (params.originalError) {
      this.stack = `${this.stack}\nCaused by: ${params.originalError.stack}`;
    }
  }

  public toJSON() {
    return {
      code: this.code,
      message: this.safeMessage,
      correlationId: this.correlationId,
      retryable: this.retryable,
    };
  }
}
