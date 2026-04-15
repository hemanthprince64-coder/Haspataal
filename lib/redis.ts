import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
let hasLoggedRedisError = false;

// Singleton Redis client
let redis: Redis | null = null;

// Only initialize if we have a valid URL and aren't in a build environment
// Also skip if REDIS_URL is "undefined" string or "placeholder"
const isValidUrl = redisUrl && 
                  redisUrl !== 'undefined' && 
                  !redisUrl.includes('placeholder');

if (isValidUrl && !redis) {
    try {
        redis = new Redis(redisUrl as string, {
            maxRetriesPerRequest: 1, // Minimize retries in case of failure
            enableOfflineQueue: false,
            lazyConnect: true, // Don't connect until first command
            retryStrategy: (times) => {
                // Stop retrying after 3 attempts to prevent log spam
                if (times > 3) return null;
                return Math.min(times * 500, 2000);
            },
        });

        redis.on('error', (err) => {
            if (!hasLoggedRedisError) {
                hasLoggedRedisError = true;
                console.warn('[REDIS] Redis is unavailable (ECONNREFUSED). Features will use fallback logic.');
            }
        });

        redis.on('connect', () => {
            hasLoggedRedisError = false;
            console.log('[REDIS] Connected successfully.');
        });
    } catch (e) {
        console.warn('[REDIS] Failed to initialize Redis client. Check your REDIS_URL.');
    }
}

if (!isValidUrl) {
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PHASE) {
        console.warn('[REDIS] Missing REDIS_URL. Rate limiting and caching are disabled.');
    }
}

export default redis;

