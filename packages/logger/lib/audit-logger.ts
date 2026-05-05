import pino from 'pino';

/**
 * SEPARATE AUDIT LOGGER
 * Logs to an append-only stream for compliance and security auditing.
 */
export const auditLogger = pino({
  level: 'info',
  base: {
    service: 'haspataal-audit',
    env: process.env.NODE_ENV,
  },
  // Ensure audit logs are never pretty-printed in prod to maintain structured JSON integrity
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            messageFormat: '[AUDIT] {action} by {actorId} on {resourceType}:{resourceId}',
          },
        }
      : undefined,
});

export interface AuditLogEntry {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ACCESS';
  actorId: string;
  actorRole: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  ip: string; // Should be hashed in production
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

export const logAudit = (entry: AuditLogEntry) => {
  auditLogger.info(entry, `Audit Event: ${entry.action} ${entry.resourceType}`);
};

export default auditLogger;
