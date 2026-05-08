// Simple logger for development
// In production, this would integrate with a proper logging system

interface Logger {
  info: (message: string, meta?: any) => void;
  error: (message: string, error?: any) => void;
  warn: (message: string, meta?: any) => void;
  debug: (message: string, meta?: any) => void;
}

class SimpleLogger implements Logger {
  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  info(message: string, meta?: any): void {
    console.log(this.formatMessage('info', message, meta));
  }

  error(message: string, error?: any): void {
    console.error(this.formatMessage('error', message, error));
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

const logger = new SimpleLogger();

export function logAudit(action: string, userId?: string, details?: any): void {
  const auditLog = {
    timestamp: new Date().toISOString(),
    action,
    userId: userId || 'unknown',
    details,
  };

  console.log('[AUDIT]', JSON.stringify(auditLog));
}

export { logger };
export default logger;
