import pino from 'pino';

// Create a structured logger
// Uses pino-pretty in development for readable console output
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
                translateTime: 'SYS:standard'
            }
        }
        : undefined,
});

export default logger;
