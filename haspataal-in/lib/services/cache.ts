
// import { Redis } from '@upstash/redis'; 

// For MVP/War Room, we will mock the Redis interface or use an in-memory map if no URL provided.
// Real production would use: const redis = new Redis({ url: ..., token: ... });

const cache = new Map<string, any>();

export const CacheService = {
    async get(key: string) {
        // console.log(`[Cache] Get ${key}`);
        // return await redis.get(key);
        return cache.get(key);
    },

    async set(key: string, value: any, ttlSeconds: number = 300) {
        // console.log(`[Cache] Set ${key}`);
        // await redis.set(key, value, { ex: ttlSeconds });
        cache.set(key, value);
        // Garbage collection for mock not implemented
    },

    async del(key: string) {
        cache.delete(key);
    }
};
