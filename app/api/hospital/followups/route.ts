import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getHospitalIdFromSession } from "@/lib/auth";

// GET: list pending follow-ups
export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const followUps = await prisma.followUp.findMany({
    where: { hospitalId, status: { in: ["PENDING", "NO_RESPONSE"] } },
    include: { patient: { select: { id: true, name: true, phone: true } } },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({ followUps });
}

// POST: create a follow-up (always include source for retention tracking)
export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const followUp = await prisma.followUp.create({
    data: {
      hospitalId,
      patientId: body.patientId,
      appointmentId: body.appointmentId,
      billId: body.billId,
      type: body.type ?? "GENERAL",
      scheduledAt: new Date(body.scheduledAt),
      notes: body.notes,
      // FIX 3: always set source so Revenue Intelligence can track it
      source: body.source ?? "manual",
      payload: body.payload ?? {},
    },
  });

  return NextResponse.json({ followUp }, { status: 201 });
}

// PATCH: update status
export async function PATCH(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updated = await prisma.followUp.update({
    where: { id: body.id, hospitalId },
    data: {
      status: body.status,
      completedAt: body.status === "COMPLETED" ? new Date() : undefined,
      notes: body.notes,
    },
  });

  return NextResponse.json({ followUp: updated });
}
