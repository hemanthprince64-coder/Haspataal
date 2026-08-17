export declare enum ErrorCode {
    AuthenticationError = "ERR_AUTH_UNAUTHENTICATED",
    AuthorizationError = "ERR_AUTH_FORBIDDEN",
    TenantScopeError = "ERR_TENANT_MISMATCH",
    ConsentError = "ERR_CONSENT_MISSING",
    ValidationError = "ERR_VALIDATION",
    ConflictError = "ERR_CONFLICT",
    NotFoundError = "ERR_NOT_FOUND",
    RateLimitError = "ERR_RATE_LIMIT",
    ConfigurationError = "ERR_CONFIG_INVALID",
    DependencyUnavailableError = "ERR_DEPENDENCY_DOWN",
    IdempotencyConflictError = "ERR_IDEMPOTENCY_CONFLICT",
    InternalError = "ERR_INTERNAL_SERVER"
}
export declare class StandardError extends Error {
    code: ErrorCode;
    safeMessage: string;
    internalContext: Record<string, any>;
    correlationId: string;
    retryable: boolean;
    constructor(params: {
        code: ErrorCode;
        safeMessage: string;
        internalContext?: Record<string, any>;
        correlationId: string;
        retryable?: boolean;
        originalError?: Error;
    });
    toJSON(): {
        code: ErrorCode;
        message: string;
        correlationId: string;
        retryable: boolean;
    };
}
//# sourceMappingURL=errors.d.ts.map