import { prisma } from '@haspataal/db';
import redis from '@/lib/redis';

import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'patient-portal',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    dependencies: {} as Record<string, string>,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.dependencies.database = 'connected';
  } catch {
    checks.dependencies.database = 'disconnected';
    checks.status = 'degraded';
  }
  try {
    await redis.ping();
    checks.dependencies.redis = 'connected';
  } catch {
    checks.dependencies.redis = 'disconnected';
    checks.status = 'degraded';
  }
  const isHealthy = checks.status === 'healthy';
  return NextResponse.json(
    { success: true, data: checks },
    {
      status: isHealthy ? 200 : 503,
    },
  );
}
