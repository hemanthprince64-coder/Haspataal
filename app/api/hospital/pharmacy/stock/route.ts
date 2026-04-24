import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getHospitalIdFromSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const drugs = await prisma.drugStock.findMany({
    where: { hospitalId },
    orderBy: { name: "asc" },
  });

  // Formatting date for simpler UI handling
  const formatted = drugs.map(d => ({
    ...d,
    expiryDate: d.expiryDate.toISOString().split('T')[0]
  }));

  return NextResponse.json({ drugs: formatted });
}
