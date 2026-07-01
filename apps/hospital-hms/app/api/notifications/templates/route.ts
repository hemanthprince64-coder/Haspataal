import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
  const templates = await prisma.notificationTemplate.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, data: templates });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const template = await prisma.notificationTemplate.create({ data: body });
    return NextResponse.json({ success: true, data: template });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
