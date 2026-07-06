import Redis from 'ioredis';
export class RedisCacheDecorator {
    constructor(delegate, redisUrl) {
        this.delegate = delegate;
        this.redis = new Redis(redisUrl);
    }
    async search(query) {
        // Only cache simple queries without cursors
        if (!query.cursor) {
            const cacheKey = `search:${JSON.stringify(query)}`;
            try {
                const cached = await this.redis.get(cacheKey);
                if (cached)
                    return JSON.parse(cached);
            }
            catch (err) {
                console.warn('Redis cache read failed, falling back to DB', err);
            }
            const result = await this.delegate.search(query);
            try {
                await this.redis.setex(cacheKey, 60, JSON.stringify(result)); // Cache for 60s
            }
            catch (err) {
                console.warn('Redis cache write failed', err);
            }
            return result;
        }
        return this.delegate.search(query);
    }
    async index(document) {
        await this.delegate.index(document);
        // Invalidate caches when new things are indexed
        try {
            const keys = await this.redis.keys('search:*');
            if (keys.length > 0)
                await this.redis.del(...keys);
            const acKeys = await this.redis.keys('ac:*');
            if (acKeys.length > 0)
                await this.redis.del(...acKeys);
        }
        catch (err) {
            console.warn('Redis cache invalidation failed', err);
        }
    }
    async delete(entityId, entityType) {
        await this.delegate.delete(entityId, entityType);
        try {
            const keys = await this.redis.keys('search:*');
            if (keys.length > 0)
                await this.redis.del(...keys);
            const acKeys = await this.redis.keys('ac:*');
            if (acKeys.length > 0)
                await this.redis.del(...acKeys);
        }
        catch (err) {
            console.warn('Redis cache invalidation failed', err);
        }
    }
    async autocomplete(text, options) {
        const cacheKey = `ac:${text}:${JSON.stringify(options)}`;
        try {
            const cached = await this.redis.get(cacheKey);
            if (cached)
                return JSON.parse(cached);
        }
        catch (err) {
            console.warn('Redis cache read failed, falling back to DB', err);
        }
        const result = await this.delegate.autocomplete(text, options);
        try {
            await this.redis.setex(cacheKey, 300, JSON.stringify(result)); // Cache for 5 mins
        }
        catch (err) {
            console.warn('Redis cache write failed', err);
        }
        return result;
    }
    async health() {
        return this.delegate.health();
    }
}
