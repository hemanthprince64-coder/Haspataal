import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const stock = await prisma.drugStock.findMany({
    where: { hospitalId },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json({ stock });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const item = await prisma.drugStock.create({
    data: {
      hospitalId,
      name: body.drugName,
      stock: body.quantity,
      expiryDate: new Date(body.expiryDate),
      category: body.category,
    }
  });

  return NextResponse.json({ item });
}
