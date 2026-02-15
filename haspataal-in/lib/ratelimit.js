import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new Query client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || 'http://localhost:8080',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || 'example_token',
});

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const authRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
    prefix: "@upstash/ratelimit",
});

export const searchRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(30, "60 s"),
    analytics: true,
});

export const bookingRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    analytics: true,
});
