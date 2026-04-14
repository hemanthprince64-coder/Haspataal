import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Singleton Redis client
let redis: Redis | null = null;

if (!redis) {
    redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
    });

    redis.on('error', (err) => {
        console.error('[REDIS ERROR]', err);
    });

    redis.on('connect', () => {
        console.log('[REDIS] Connected to instance at', redisUrl);
    });
}

export default redis!;
