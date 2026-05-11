import pino from 'pino';

/**
 * SEPARATE AUDIT LOGGER
 * Logs to an append-only stream for compliance and security auditing.
 */
export const auditLogger = pino(
  {
    level: 'info',
    base: {
      service: 'haspataal-audit',
      env: process.env.NODE_ENV,
    },
    redact: {
      paths: ['password', 'token', 'secret', 'authorization'],
      censor: '[REDACTED]',
    },
  },
  process.env.NODE_ENV === 'development'
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          messageFormat: '[AUDIT] {action} by {actorId} on {resourceType}:{resourceId}',
        },
      })
    : undefined,
);

export interface AuditLogEntry {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ACCESS';
  actorId: string;
  actorRole: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  ip: string; // Should be hashed in production
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export const logAudit = (entry: AuditLogEntry) => {
  auditLogger.info(entry, `Audit Event: ${entry.action} ${entry.resourceType}`);
};

export default auditLogger;
