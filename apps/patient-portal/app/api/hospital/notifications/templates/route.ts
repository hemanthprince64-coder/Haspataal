import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const templates = await prisma.notificationTemplate.findMany({
    where: { hospitalId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const template = await prisma.notificationTemplate.create({
    data: {
      hospitalId,
      name: body.name,
      channel: body.channel,
      body: body.body,
      headerText: body.headerText,
      footerText: body.footerText,
      buttons: body.buttons,
      language: body.language || 'en',
      providerId: body.providerId, // DLT ID / WA Template Name
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}
