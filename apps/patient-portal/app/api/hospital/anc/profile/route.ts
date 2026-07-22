/* eslint-disable */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/util/prisma-singleton';
import { ancService } from '@/lib/services/anc';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const hospitalId = searchParams.get('hospitalId');

    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }

    const profile = await ancService.getProfile(patientId);

    if (!profile) {
      if (hospitalId) {
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        const blank = await ancService.upsertProfile(patientId, {
          highRisk: false,
          highRiskReasons: [],
          schemeEnrolled: [],
          dropoutRiskScore: null,
          ancVisits: 0,
          mcpCardNumber: null,
          obstetricHistory: {},
        });
        return NextResponse.json(blank);
      }
      return NextResponse.json({ error: 'Pregnancy profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (err) {
    console.error('[API /api/hospital/anc/profile] GET failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, hospitalId, ...data } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }

    const existing = await prisma.pregnancyProfile.findUnique({ where: { patientId } });
    if (!existing && data.lmp && !data.edd) {
      const { calculateEdd } = await import('@/lib/services/gestational-age');
      data.edd = calculateEdd(new Date(data.lmp));
    }

    const profile = await ancService.upsertProfile(patientId, data);

    if (data.obstetricHistory) {
      await prisma.obstetricHistory.create({
        data: { pregnancyId: profile.id, ...data.obstetricHistory },
      });
      const { data: _, ...rest } = data;
      void _;
    }

    return NextResponse.json(profile, { status: 201 });
  } catch (err) {
    console.error('[API /api/hospital/anc/profile] POST failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
