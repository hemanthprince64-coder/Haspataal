import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import packageJson from '@/package.json';

export async function GET() {
  const timestamp = new Date().toISOString();
  const checks: any = {};
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // 1. Database Check (Prisma)
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'up', latencyMs: Date.now() - dbStart };
  } catch (err) {
    checks.database = { status: 'down', error: (err as Error).message };
    overallStatus = 'unhealthy';
  }

  // 2. Redis Check
  const redisStart = Date.now();
  if (redis) {
    try {
      const ping = await redis.ping();
      checks.redis = {
        status: ping === 'PONG' ? 'up' : 'degraded',
        latencyMs: Date.now() - redisStart,
      };
      if (ping !== 'PONG') overallStatus = 'degraded';
    } catch (err) {
      checks.redis = { status: 'down', error: (err as Error).message };
      overallStatus = 'degraded'; // Redis failing is degraded, not necessarily unhealthy for the whole app
    }
  } else {
    checks.redis = { status: 'not_configured' };
    overallStatus = 'degraded';
  }

  // 3. Supabase Check (External)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, { method: 'HEAD' });
      checks.externalServices = {
        supabase: { status: res.ok ? 'up' : 'down' },
      };
      if (!res.ok) overallStatus = 'degraded';
    } else {
      checks.externalServices = { supabase: { status: 'not_configured' } };
    }
  } catch (err) {
    checks.externalServices = { supabase: { status: 'error', message: (err as Error).message } };
    overallStatus = 'degraded';
  }

  const responseBody = {
    status: overallStatus,
    timestamp,
    version: packageJson.version,
    checks,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 207 : 503;

  return NextResponse.json(responseBody, { status: statusCode });
}
