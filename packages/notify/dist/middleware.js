"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitMiddleware = rateLimitMiddleware;
const server_1 = require("next/server");
const ipCache = new Map();
function rateLimitMiddleware(request, maxRequests, window) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const key = ip;
    const max = maxRequests ?? 100;
    const w = window ?? 60_000;
    const buckets = ipCache.get(key) ?? [];
    const filtered = buckets.filter((t) => now - t < w);
    if (filtered.length >= max) {
        return server_1.NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }
    filtered.push(now);
    ipCache.set(key, filtered);
    return null;
}
