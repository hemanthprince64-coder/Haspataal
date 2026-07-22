/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';

import { requireHospitalAccess, hospitalAccessError } from '@/lib/auth/hospital-access';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let access;
  try {
    access = await requireHospitalAccess('setup', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  try {
    const hospital = await prisma.hospitalsMaster.findUnique({
      where: { id: access.hospitalId },
      include: { opdConfig: true },
    });

    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    // Default consultation fee can be queried from dynamic products/services or defaults
    const service = await prisma.serviceCatalog.findFirst({
      where: { hospitalId: access.hospitalId, type: 'CONSULTATION', code: 'OPD_CONSULT' },
    });

    const config = {
      appointmentFlow: hospital.opdConfig?.tokenMode === 'AUTO' ? 'token' : 'walkin',
      avgDuration: hospital.opdConfig?.avgConsultationMinutes ?? 15,
      consultationFee: service ? Number(service.basePrice) : 500,
      followupDays: 7, // General fallback or query retention config
      allowOverbooking: hospital.opdConfig?.allowOverbooking ?? true,
      invoicePrefix: hospital.invoicePrefix ?? 'INV',
      printHeader: hospital.prescriptionHeader ?? hospital.legalName,
      printFooter: hospital.prescriptionFooter ?? 'Standard clinic disclaimer',
      emrTemplate: 'STANDARD_OPD',
    };

    return NextResponse.json(config);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 550 });
  }
}

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('setup', 'write');
  } catch (error) {
    return hospitalAccessError(error);
  }

  try {
    const body = await req.json();

    // 1. Update HospitalsMaster fields
    await prisma.hospitalsMaster.update({
      where: { id: access.hospitalId },
      data: {
        invoicePrefix: body.invoicePrefix || 'INV',
        prescriptionHeader: body.printHeader || null,
        prescriptionFooter: body.printFooter || null,
      },
    });

    // 2. Upsert OpdConfig
    await prisma.opdConfig.upsert({
      where: { hospitalId: access.hospitalId },
      create: {
        hospitalId: access.hospitalId,
        tokenMode: body.appointmentFlow === 'token' ? 'AUTO' : 'MANUAL',
        avgConsultationMinutes: body.avgDuration || 15,
        allowOverbooking: body.allowOverbooking ?? true,
      },
      update: {
        tokenMode: body.appointmentFlow === 'token' ? 'AUTO' : 'MANUAL',
        avgConsultationMinutes: body.avgDuration || 15,
        allowOverbooking: body.allowOverbooking ?? true,
      },
    });

    // 3. Upsert default consultation fee service catalog item
    const code = 'OPD_CONSULT';
    const price = body.consultationFee || 500;
    await prisma.serviceCatalog.upsert({
      where: {
        hospitalId_code: {
          hospitalId: access.hospitalId,
          code,
        },
      },
      create: {
        hospitalId: access.hospitalId,
        code,
        name: 'OPD Consultation Fee',
        type: 'CONSULTATION',
        basePrice: price,
        isActive: true,
      },
      update: {
        basePrice: price,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 550 });
  }
}
