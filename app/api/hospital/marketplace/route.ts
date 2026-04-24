import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const hospital = await prisma.hospitalsMaster.findUnique({
    where: { id: hospitalId },
    select: {
      isListedOnMarketplace: true,
      marketplaceTagline: true,
      marketplaceAbout: true,
      showConsultationFees: true,
      allowOnlineBooking: true,
      requiresApproval: true,
      showBedCharges: true,
      cancellationPolicy: true,
    }
  });

  return NextResponse.json({ config: hospital });
}

export async function PUT(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const hospital = await prisma.hospitalsMaster.update({
    where: { id: hospitalId },
    data: {
      isListedOnMarketplace: body.isListedOnMarketplace,
      marketplaceTagline: body.marketplaceTagline,
      marketplaceAbout: body.marketplaceAbout,
      showConsultationFees: body.showConsultationFees,
      allowOnlineBooking: body.allowOnlineBooking,
      requiresApproval: body.requiresApproval,
      showBedCharges: body.showBedCharges,
      cancellationPolicy: body.cancellationPolicy,
    }
  });

  return NextResponse.json({ config: hospital });
}
