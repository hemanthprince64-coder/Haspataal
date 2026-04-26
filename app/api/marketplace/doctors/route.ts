import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city') ?? undefined;
  const speciality = req.nextUrl.searchParams.get('speciality') ?? undefined;

  const doctors = await prisma.doctorHospitalAffiliation.findMany({
    where: {
      isCurrent: true,
      doctor: { accountStatus: 'ACTIVE' },
      hospital: {
        accountStatus: 'active',
        isListedOnMarketplace: true,
        allowOnlineBooking: true,
        ...(city ? { city: { equals: city, mode: 'insensitive' } } : {}),
      },
      ...(speciality ? { department: { equals: speciality, mode: 'insensitive' } } : {}),
    },
    include: {
      doctor: { select: { id: true, fullName: true, gender: true, profilePhotoUrl: true, kycStatus: true } },
      hospital: { select: { id: true, legalName: true, displayName: true, city: true, logoUrl: true, showConsultationFees: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({
    doctors: doctors.map((affiliation) => ({
      id: affiliation.doctor.id,
      fullName: affiliation.doctor.fullName,
      gender: affiliation.doctor.gender,
      profilePhotoUrl: affiliation.doctor.profilePhotoUrl,
      speciality: affiliation.department ?? (affiliation.payload as any)?.speciality ?? 'General',
      consultationFee: affiliation.hospital.showConsultationFees ? affiliation.consultationFee : null,
      followUpFee: affiliation.hospital.showConsultationFees ? affiliation.followUpFee : null,
      followUpWindowDays: affiliation.followUpWindowDays,
      hospital: affiliation.hospital,
      onlineBooking: true,
    })),
  });
}
