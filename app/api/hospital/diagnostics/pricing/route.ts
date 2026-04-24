import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pricing = await prisma.hospitalDiagnosticPricing.findMany({
    where: { hospitalId },
    orderBy: { testName: 'asc' }
  });

  return NextResponse.json({ pricing });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const test = await prisma.hospitalDiagnosticPricing.create({
    data: {
      hospitalId,
      testName: body.testName,
      category: body.category,
      hospitalPrice: body.hospitalPrice,
      patientMrp: body.patientMrp,
      turnaroundHours: body.turnaroundHours,
    }
  });

  return NextResponse.json({ test });
}
