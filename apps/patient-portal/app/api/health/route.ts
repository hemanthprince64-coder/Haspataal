import { prisma } from '@haspataal/db';

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

  // checks.dependencies.redis = redis ? 'connected' : 'disconnected';

  const isHealthy = checks.status === 'healthy';
  return NextResponse.json(
    { success: true, data: checks },
    {
      status: isHealthy ? 200 : 503,
    },
  );
}
