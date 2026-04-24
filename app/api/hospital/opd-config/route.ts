import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const config = await prisma.opdConfig.findUnique({
    where: { hospitalId }
  });

  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const config = await prisma.opdConfig.upsert({
    where: { hospitalId },
    update: {
      tokenMode: body.tokenMode,
      tokenPrefix: body.tokenPrefix,
      resetDaily: body.resetDaily,
      displayQueueOnTV: body.displayQueueOnTV,
      allowWalkIn: body.allowWalkIn,
      allowOnline: body.allowOnline,
      allowPhone: body.allowPhone,
      allowReferral: body.allowReferral,
      showEstimatedWait: body.showEstimatedWait,
      avgConsultationMinutes: body.avgConsultationMinutes,
      enableSmartSlots: body.enableSmartSlots,
      smartSlotAlgorithm: body.smartSlotAlgorithm || "FIFO",
    },
    create: {
      hospitalId,
      tokenMode: body.tokenMode || "AUTO",
      tokenPrefix: body.tokenPrefix || "OPD",
      resetDaily: body.resetDaily ?? true,
      displayQueueOnTV: body.displayQueueOnTV ?? false,
      allowWalkIn: body.allowWalkIn ?? true,
      allowOnline: body.allowOnline ?? true,
      allowPhone: body.allowPhone ?? true,
      allowReferral: body.allowReferral ?? false,
      showEstimatedWait: body.showEstimatedWait ?? true,
      avgConsultationMinutes: body.avgConsultationMinutes ?? 15,
      enableSmartSlots: body.enableSmartSlots ?? false,
      smartSlotAlgorithm: body.smartSlotAlgorithm || "FIFO",
    }
  });

  return NextResponse.json({ config });
}
