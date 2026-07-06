"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisHelpers = exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
// Redis configuration
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keyPrefix: 'haspataal:',
    retryStrategy: (times) => Math.min(times * 100, 3000),
});
exports.redis = redis;
// Handle connection events
let redisConnectionErrorLogged = false;
redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
    redisConnectionErrorLogged = false; // reset so we can log again if connection drops later
});
redis.on('error', (error) => {
    if (!redisConnectionErrorLogged) {
        console.error('❌ Redis connection error:', error.message);
        // Don't throw error in production - Redis is optional for rate limiting
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️  Redis is not available. Rate limiting will be disabled.');
        }
        redisConnectionErrorLogged = true;
    }
    // Subsequent errors (repeated reconnect attempts) are silent to avoid log spam
});
redis.on('ready', () => {
    console.log('🚀 Redis is ready to receive commands');
});
exports.default = redis;
// Helper functions for common operations
exports.redisHelpers = {
    // Set with expiry
    async setEx(key, value, ttlSeconds) {
        try {
            await redis.setex(key, ttlSeconds, JSON.stringify(value));
        }
        catch (error) {
            console.error('Redis setEx error:', error);
        }
    },
    // Get and parse JSON
    async getJson(key) {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('Redis getJson error:', error);
            return null;
        }
    },
    // Delete key
    async del(key) {
        try {
            await redis.del(key);
        }
        catch (error) {
            console.error('Redis del error:', error);
        }
    },
    // Check if key exists
    async exists(key) {
        try {
            const result = await redis.exists(key);
            return result === 1;
        }
        catch (error) {
            console.error('Redis exists error:', error);
            return false;
        }
    },
    // Increment counter
    async incr(key) {
        try {
            return await redis.incr(key);
        }
        catch (error) {
            console.error('Redis incr error:', error);
            return 0;
        }
    },
    // Set expiry on key
    async expire(key, ttlSeconds) {
        try {
            await redis.expire(key, ttlSeconds);
        }
        catch (error) {
            console.error('Redis expire error:', error);
        }
    },
};
