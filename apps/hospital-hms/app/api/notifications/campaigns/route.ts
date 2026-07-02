import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

export async function GET() {
  const campaigns = await prisma.notificationCampaign.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, data: campaigns });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const campaign = await prisma.notificationCampaign.create({ data: body });
    return NextResponse.json({ success: true, data: campaign });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
