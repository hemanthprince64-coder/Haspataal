import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

// Disable pino-pretty in Next.js environment to prevent worker thread crashes
// Next.js 15 Turbopack has issues with pino.transport worker threads
const DISABLE_PRETTY =
  process.env.NEXT_PUBLIC_APP_NAME || process.env.NEXT_PRIVATE_PRETTY_LOGS === 'false';

const pinoConfig = {
  level: isDev ? 'debug' : 'info',
  base: {
    service: `haspataal-${process.env.NEXT_PUBLIC_APP_NAME || 'core'}`,
    version: process.env.npm_package_version,
    env: process.env.NODE_ENV,
  },
  redact: {
    paths: ['password', 'token', 'secret', 'authorization', 'otp', '*.password', '*.token'],
    censor: '[REDACTED]',
  },
};

export const logger = pino(pinoConfig);

export default logger;
