import { NotificationAnalytics } from '@haspataal/notify';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const hospitalId = searchParams.get('hospitalId') || undefined;

  const [delivery, failure, channelUsage] = await Promise.all([
    NotificationAnalytics.deliveryRate(hospitalId),
    NotificationAnalytics.failureRate(hospitalId),
    NotificationAnalytics.channelUsage(hospitalId),
  ]);

  return NextResponse.json({
    success: true,
    data: { delivery, failure, channelUsage },
  });
}
