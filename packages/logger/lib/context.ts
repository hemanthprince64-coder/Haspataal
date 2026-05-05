import { Logger } from 'pino';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * Hashing helper for IPs to protect PII (PHR/PHI protection compliance)
 */
const hashIp = (ip: string) => {
  if (!ip) return 'unknown';
  return crypto
    .createHash('sha256')
    .update(ip + (process.env.IP_SALT || 'haspataal-salt'))
    .digest('hex')
    .substring(0, 12);
};

export const withRequestContext = (logger: Logger, req: any, session?: any) => {
  const requestId = req.headers?.['x-request-id'] || uuidv4();
  const ip = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';

  return logger.child({
    requestId,
    userId: session?.user?.id || 'anonymous',
    userRole: session?.user?.role || 'none',
    ip: hashIp(Array.isArray(ip) ? ip[0] : ip),
  });
};
