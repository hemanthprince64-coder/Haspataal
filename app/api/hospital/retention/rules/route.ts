import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rules = await prisma.retentionRule.findMany({
    where: { hospitalId },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const rule = await prisma.retentionRule.create({
    data: {
      hospitalId,
      name: body.name,
      trigger: {
        type: body.triggerType,
        daysAfter: body.triggerDays,
      },
      action: {
        type: body.actionType,
      },
      priority: body.priority || "MEDIUM",
      isActive: true,
    }
  });

  return NextResponse.json({ rule });
}
