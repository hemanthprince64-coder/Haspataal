import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const beds = await prisma.bed.findMany({
    where: { hospitalId },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json({ beds });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { prefix, count, type, deptId } = await req.json();

  // Find the department to get its name for ward tracking
  const dept = await prisma.department.findUnique({ where: { id: deptId } });

  const createdBeds = [];
  for (let i = 1; i <= count; i++) {
    const bed = await prisma.bed.create({
      data: {
        hospitalId,
        name: `${prefix}-${i.toString().padStart(3, '0')}`,
        type: type || "GENERAL",
        status: "AVAILABLE",
        isActive: true,
      }
    });
    createdBeds.push(bed);
  }

  return NextResponse.json({ beds: createdBeds });
}
