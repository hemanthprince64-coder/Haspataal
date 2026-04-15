import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
let hasLoggedRedisError = false;

// Singleton Redis client
let redis: Redis | null = null;

if (redisUrl && !redis) {
    redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
    });

    redis.on('error', (err) => {
        if (!hasLoggedRedisError) {
            hasLoggedRedisError = true;
            console.error('[REDIS ERROR] Redis is unavailable. Falling back where supported.', err);
        }
    });

    redis.on('connect', () => {
        hasLoggedRedisError = false;
        console.log('[REDIS] Connected to instance at', redisUrl);
    });
}

if (!redisUrl) {
    console.warn('[REDIS] REDIS_URL is not set. Redis-backed features are disabled in this environment.');
}

export default redis;
