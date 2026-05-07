import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';
import { z } from 'zod';

const marketplaceSchema = z.object({
  isListedOnMarketplace: z.boolean().optional(),
  marketplaceTagline: z.string().max(100).optional(),
  marketplaceAbout: z.string().max(2000).optional(),
  marketplaceFacilities: z.array(z.string()).optional(),
  showConsultationFees: z.boolean().optional(),
  showBedCharges: z.boolean().optional(),
  allowOnlineBooking: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
  cancellationPolicy: z.enum(['FLEXIBLE', 'MODERATE', 'STRICT']).optional(),
  depositRequired: z.boolean().optional(),
  depositAmount: z.number().optional(),
  allowsInstantBooking: z.boolean().optional(),
  specialities: z.array(z.string()).optional(),
  galleryUrls: z.array(z.string()).optional(),
  coverImageUrl: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const hospital = await prisma.hospitalsMaster.findUnique({
    where: { id: hospitalId },
    select: {
      isListedOnMarketplace: true,
      marketplaceTagline: true,
      marketplaceAbout: true,
      marketplaceFacilities: true,
      showConsultationFees: true,
      showBedCharges: true,
      allowOnlineBooking: true,
      requiresApproval: true,
      cancellationPolicy: true,
      depositRequired: true,
      depositAmount: true,
      allowsInstantBooking: true,
      specialities: true,
      galleryUrls: true,
      coverImageUrl: true,
    },
  });

  return NextResponse.json({ hospital });
}

export async function PUT(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = marketplaceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const updated = await prisma.hospitalsMaster.update({
    where: { id: hospitalId },
    data: parsed.data,
  });

  return NextResponse.json({ success: true, hospital: updated });
}
