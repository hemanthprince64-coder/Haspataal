import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city') ?? undefined;
  const hospitals = await prisma.hospitalsMaster.findMany({
    where: {
      accountStatus: 'active',
      isListedOnMarketplace: true,
      ...(city ? { city: { equals: city, mode: 'insensitive' } } : {}),
    },
    select: {
      id: true,
      legalName: true,
      displayName: true,
      hospitalType: true,
      city: true,
      state: true,
      pincode: true,
      logoUrl: true,
      marketplaceTagline: true,
      marketplaceAbout: true,
      marketplaceFacilities: true,
      showConsultationFees: true,
      showBedCharges: true,
      allowOnlineBooking: true,
      rankingScore: true,
      facilities: true,
      affiliations: {
        where: { isCurrent: true, doctor: { accountStatus: 'ACTIVE' } },
        select: { consultationFee: true, department: true, doctor: { select: { id: true, fullName: true, profilePhotoUrl: true } } },
        take: 10,
      },
    },
    orderBy: [{ rankingScore: 'desc' }, { legalName: 'asc' }],
    take: 50,
  });

  return NextResponse.json({ hospitals });
}
