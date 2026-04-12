const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisClient = new Redis(REDIS_URL);

/**
 * General API Rate Limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	max: 100, 
	standardHeaders: true, 
	legacyHeaders: false,
	store: new RedisStore({
		sendCommand: (...args) => redisClient.call(...args),
	}),
    message: {
        success: false,
        error: 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    }
});

/**
 * Strict Rate Limiter for sensitive endpoints
 * e.g., Search, Login, OTP
 * 5 requests per minute
 */
const strictLimiter = rateLimit({
	windowMs: 1 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	store: new RedisStore({
		sendCommand: (...args) => redisClient.call(...args),
	}),
    message: {
        success: false,
        error: 'Strict rate limit exceeded. Slow down.',
        code: 'STRICT_RATE_LIMIT_EXCEEDED'
    }
});

module.exports = { apiLimiter, strictLimiter };
