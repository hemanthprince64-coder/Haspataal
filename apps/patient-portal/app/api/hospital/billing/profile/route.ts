import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await prisma.hospitalBillingProfile.findUnique({
    where: { hospitalId },
  });

  const hospital = await prisma.hospitalsMaster.findUnique({
    where: { id: hospitalId },
    select: {
      invoicePrefix: true,
      nextInvoiceNumber: true,
      gstInclusivePricing: true,
      bankAccountNo: true,
      bankIfsc: true,
    },
  });

  return NextResponse.json({ profile, hospital });
}

export async function PUT(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const [profile, hospital] = await prisma.$transaction([
    prisma.hospitalBillingProfile.upsert({
      where: { hospitalId },
      update: {
        bankAccountNumber: body.bankAccountNumber,
        bankIfsc: body.bankIfsc,
        gstApplicable: body.gstApplicable,
        tdsApplicable: body.tdsApplicable,
        commissionPercentage: body.commissionPercentage,
        payoutCycle: body.payoutCycle,
        invoiceLayout: body.invoiceLayout,
        headerText: body.headerText,
        footerText: body.footerText,
      },
      create: {
        hospitalId,
        bankAccountNumber: body.bankAccountNumber,
        bankIfsc: body.bankIfsc,
        gstApplicable: body.gstApplicable ?? false,
        tdsApplicable: body.tdsApplicable ?? true,
        payoutCycle: body.payoutCycle || 'WEEKLY',
        invoiceLayout: body.invoiceLayout || 'STANDARD',
      },
    }),
    prisma.hospitalsMaster.update({
      where: { id: hospitalId },
      data: {
        invoicePrefix: body.invoicePrefix,
        nextInvoiceNumber: body.nextInvoiceNumber,
        gstInclusivePricing: body.gstInclusivePricing,
        bankAccountNo: body.bankAccountNumber, // Sync
        bankIfsc: body.bankIfsc, // Sync
      },
    }),
  ]);

  return NextResponse.json({ profile, hospital });
}
