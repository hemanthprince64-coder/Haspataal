"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardError = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["AuthenticationError"] = "ERR_AUTH_UNAUTHENTICATED";
    ErrorCode["AuthorizationError"] = "ERR_AUTH_FORBIDDEN";
    ErrorCode["TenantScopeError"] = "ERR_TENANT_MISMATCH";
    ErrorCode["ConsentError"] = "ERR_CONSENT_MISSING";
    ErrorCode["ValidationError"] = "ERR_VALIDATION";
    ErrorCode["ConflictError"] = "ERR_CONFLICT";
    ErrorCode["NotFoundError"] = "ERR_NOT_FOUND";
    ErrorCode["RateLimitError"] = "ERR_RATE_LIMIT";
    ErrorCode["ConfigurationError"] = "ERR_CONFIG_INVALID";
    ErrorCode["DependencyUnavailableError"] = "ERR_DEPENDENCY_DOWN";
    ErrorCode["IdempotencyConflictError"] = "ERR_IDEMPOTENCY_CONFLICT";
    ErrorCode["InternalError"] = "ERR_INTERNAL_SERVER";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class StandardError extends Error {
    code;
    safeMessage;
    internalContext;
    correlationId;
    retryable;
    constructor(params) {
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
    toJSON() {
        return {
            code: this.code,
            message: this.safeMessage,
            correlationId: this.correlationId,
            retryable: this.retryable,
        };
    }
}
exports.StandardError = StandardError;
