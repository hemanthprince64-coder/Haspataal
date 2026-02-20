// Centralized configuration for Hospital Backend Stabilization
export const backendConfig = {
    jwt: {
        expiry: process.env.JWT_EXPIRY || '1h',
        secret: process.env.JWT_SECRET || 'default_fallback_secret_do_not_use_in_prod',
    },
    auth: {
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
        sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINS || '60', 10),
        passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireNumbers: true
        }
    },
    security: {
        corsDomains: (process.env.CORS_DOMAINS || 'http://localhost:3000,http://localhost:3001').split(','),
        rateLimitRequestsPerMinute: parseInt(process.env.RATE_LIMIT_REQS || '100', 10),
    }
};
