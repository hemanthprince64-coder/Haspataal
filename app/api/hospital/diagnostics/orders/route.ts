import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getHospitalIdFromSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.labOrder.findMany({
    where: { hospitalId },
    include: { patient: { select: { name: true } } },
    orderBy: { orderedAt: "desc" },
    take: 100,
  });

  const formatted = orders.map((o) => ({
    id: o.id,
    patientName: o.patient.name,
    testName: o.testName,
    orderedAt: o.orderedAt,
    status: o.status,
    result: o.result,
  }));

  return NextResponse.json({ orders: formatted });
}
