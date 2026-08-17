import { NextResponse } from 'next/server';

export async function GET() {
  // In production: fetch Prometheus metrics or BullMQ stats
  return NextResponse.json({
    success: true,
    data: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    },
  });
}
