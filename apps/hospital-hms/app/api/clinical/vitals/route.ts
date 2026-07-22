/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

async function requireRole(role: string) {
  // Simplified auth stub - replace with real implementation
  return { id: 'user-1', hospitalId: 'hospital-1' };
}

export async function GET(req: Request) {
  try {
    const user = await requireRole('doctor');
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });
    }

    const vitals = await prisma.vitalRecord.findMany({
      where: { patientId },
      orderBy: { recordedAt: 'desc' },
      take: 50,
    });

    const formatted = vitals.map((v) => ({
      id: v.id,
      recordedAt: v.recordedAt.toISOString(),
      temperature: v.temperature ? Number(v.temperature) : null,
      pulse: v.pulse,
      bloodPressure: v.bloodPressure,
      respiratoryRate: v.respiratoryRate,
      spo2: v.spo2 ? Number(v.spo2) : null,
      height: v.height ? Number(v.height) : null,
      weight: v.weight ? Number(v.weight) : null,
      bmi: v.bmi ? Number(v.bmi) : null,
      bloodSugar: v.bloodSugar ? Number(v.bloodSugar) : null,
    }));

    return NextResponse.json({ vitals: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRole('doctor');
    const body = await req.json();
    const {
      patientId,
      visitId,
      temperature,
      pulse,
      bloodPressure,
      respiratoryRate,
      spo2,
      height,
      weight,
      bloodSugar,
    } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });
    }

    const bmi = weight && height ? Number((weight / (height / 100) ** 2).toFixed(1)) : null;

    const vital = await prisma.vitalRecord.create({
      data: {
        patientId,
        weight: weight || null,
        height: height || null,
        bmi,
        bloodPressure: bloodPressure || null,
        pulse: pulse || null,
        bloodSugar: bloodSugar || null,
        spo2: spo2 || null,
        temperature: temperature || null,
        respiratoryRate: respiratoryRate || null,
      },
    });

    return NextResponse.json({ success: true, vital });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
