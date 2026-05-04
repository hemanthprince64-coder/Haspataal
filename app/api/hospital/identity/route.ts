import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

const identitySchema = z.object({
  legalName: z.string().min(2),
  displayName: z.string().min(2),
  hospitalType: z
    .enum([
      'HOSPITAL',
      'CLINIC',
      'DIAGNOSTIC_CENTER',
      'NURSING_HOME',
      'MULTISPECIALTY',
      'CORPORATE',
    ])
    .optional(),
  brandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
    .or(z.literal('')),
  stateRegistrationNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  cinNumber: z.string().optional(),
  officialEmail: z.string().email().optional().or(z.literal('')),
  contactNumber: z.string().min(10, 'Valid contact number required'),
  addressLine1: z.string().min(1, 'Address line 1 required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City required'),
  state: z.string().min(1, 'State required'),
  pincode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  nabhAccredited: z.boolean().optional(),
  nablAccredited: z.boolean().optional(),
  timezone: z.string().optional(),
  workingDays: z.array(z.string()).optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  emergencyContact: z.string().optional(),
  isMultiBranch: z.boolean().optional(),
  letterheadTemplate: z.string().optional(),
  prescriptionHeader: z.string().optional(),
  prescriptionFooter: z.string().optional(),
  logoUrl: z.string().optional().or(z.literal('')),
  faviconUrl: z.string().optional().or(z.literal('')),
});

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const hospital = await prisma.hospitalsMaster.findUnique({
    where: { id: hospitalId },
    select: {
      id: true,
      legalName: true,
      displayName: true,
      hospitalType: true,
      logoUrl: true,
      brandColor: true,
      faviconUrl: true,
      stateRegistrationNumber: true,
      gstNumber: true,
      panNumber: true,
      cinNumber: true,
      registrationNumber: true,
      contactNumber: true,
      officialEmail: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      pincode: true,
      nabhAccredited: true,
      nablAccredited: true,
      timezone: true,
      workingDays: true,
      openTime: true,
      closeTime: true,
      emergencyContact: true,
      isMultiBranch: true,
      letterheadTemplate: true,
      prescriptionHeader: true,
      prescriptionFooter: true,
    },
  });

  if (!hospital) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ hospital });
}

export async function PUT(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = identitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // If isMultiBranch turned on, ensure a default branch exists
  if (data.isMultiBranch) {
    const existing = await prisma.branch.findFirst({ where: { hospitalId } });
    if (!existing) {
      await prisma.branch.create({
        data: { hospitalId, name: 'Main Branch', isHeadquarters: true, isActive: true },
      });
    }
  }

  const updated = await prisma.hospitalsMaster.update({
    where: { id: hospitalId },
    data: {
      legalName: data.legalName,
      displayName: data.displayName,
      hospitalType: data.hospitalType,
      brandColor: data.brandColor || undefined,
      stateRegistrationNumber: data.stateRegistrationNumber,
      registrationNumber: data.registrationNumber,
      gstNumber: data.gstNumber,
      panNumber: data.panNumber,
      cinNumber: data.cinNumber,
      contactNumber: data.contactNumber,
      officialEmail: data.officialEmail || null,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      nabhAccredited: data.nabhAccredited,
      nablAccredited: data.nablAccredited,
      timezone: data.timezone,
      workingDays: data.workingDays,
      openTime: data.openTime,
      closeTime: data.closeTime,
      emergencyContact: data.emergencyContact,
      isMultiBranch: data.isMultiBranch,
      letterheadTemplate: data.letterheadTemplate,
      prescriptionHeader: data.prescriptionHeader,
      prescriptionFooter: data.prescriptionFooter,
      logoUrl: data.logoUrl || undefined,
      faviconUrl: data.faviconUrl || undefined,
    },
  });

  return NextResponse.json({ hospital: updated });
}
