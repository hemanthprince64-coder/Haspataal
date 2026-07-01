import { NextResponse } from 'next/server';

const ipCache = new Map<string, number[]>();

export function rateLimitMiddleware(request: Request, maxRequests?: number, window?: number) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const now = Date.now();
  const key = ip;
  const max = maxRequests ?? 100;
  const w = window ?? 60_000;

  const buckets = ipCache.get(key) ?? [];
  const filtered = buckets.filter((t) => now - t < w);
  if (filtered.length >= max) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }
  filtered.push(now);
  ipCache.set(key, filtered);
  return null;
}
