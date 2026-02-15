import { Redis } from '@upstash/redis';

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || 'https://mock-url',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || 'mock-token',
});

// Helper to check if redis is configured
export const isRedisConfigured = () => {
    return process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
};
