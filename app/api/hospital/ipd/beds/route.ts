import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getHospitalIdFromSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const beds = await prisma.bed.findMany({
    where: { hospitalId, isActive: true },
    include: {
      patient: {
        select: { name: true },
      },
    },
    orderBy: { bedNumber: "asc" },
  });

  const formatted = beds.map((b) => ({
    id: b.id,
    bedNumber: b.bedNumber,
    type: b.type,
    status: b.status,
    patient: b.patient
      ? {
          name: b.patient.name,
          admittedAt: b.admittedAt,
          expectedDischargeAt: b.expectedDischargeAt,
        }
      : null,
  }));

  return NextResponse.json({ beds: formatted });
}
