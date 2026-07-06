export declare class RedisRateLimiter {
    static checkLimit(key: string, limit: number, windowSec: number): Promise<boolean>;
}
