const Redis = require('ioredis');
const Redlock = require('redlock').default;
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redis = new Redis(REDIS_URL);

const redlock = new Redlock([redis], {
    driftFactor: 0.01,
    retryCount: 10,
    retryDelay: 200,
    retryJitter: 200,
});

/**
 * Cache Aside Pattern Implementation
 * @param {string} key - Cache key
 * @param {function} fetchFn - Function to fetch data if cache miss
 * @param {number} ttl - Time to live in seconds (default 1 hour)
 */
async function cacheAside(key, fetchFn, ttl = 3600) {
    try {
        const cached = await redis.get(key);
        if (cached) {
            console.log(`[Cache Hit] ${key}`);
            return JSON.parse(cached);
        }

        console.log(`[Cache Miss] ${key}`);
        const data = await fetchFn();
        
        if (data) {
            await redis.set(key, JSON.stringify(data), 'EX', ttl);
        }
        
        return data;
    } catch (error) {
        console.error(`[Cache Error] ${key}:`, error);
        return fetchFn(); // Fallback to DB on cache error
    }
}

module.exports = { cacheAside, redis, redlock };
