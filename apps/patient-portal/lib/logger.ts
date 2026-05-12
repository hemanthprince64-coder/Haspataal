// Simple logger for development
// In production, this would integrate with a proper logging system

interface Logger {
  info: (messageOrMeta: string | object, meta?: unknown) => void;
  error: (messageOrMeta: string | object, error?: unknown) => void;
  warn: (messageOrMeta: string | object, meta?: unknown) => void;
  debug: (messageOrMeta: string | object, meta?: unknown) => void;
}

class SimpleLogger implements Logger {
  private formatMessage(level: string, messageOrMeta: string | object, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    let message = '';
    let combinedMeta = meta;

    if (typeof messageOrMeta === 'string') {
      message = messageOrMeta;
    } else {
      message = (messageOrMeta as any).message || (messageOrMeta as any).action || 'no_message';
      combinedMeta = { ...(messageOrMeta as object), ...(meta as object) };
    }

    const metaStr = combinedMeta ? ` ${JSON.stringify(combinedMeta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  info(messageOrMeta: string | object, meta?: unknown): void {
    console.log(this.formatMessage('info', messageOrMeta, meta));
  }

  error(messageOrMeta: string | object, error?: unknown): void {
    console.error(this.formatMessage('error', messageOrMeta, error));
  }

  warn(messageOrMeta: string | object, meta?: unknown): void {
    console.warn(this.formatMessage('warn', messageOrMeta, meta));
  }

  debug(messageOrMeta: string | object, meta?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', messageOrMeta, meta));
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
