import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
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
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export default logger;
