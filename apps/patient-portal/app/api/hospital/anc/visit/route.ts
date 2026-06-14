import { NextResponse } from 'next/server';
import { ancService } from '@/lib/services/anc';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pregnancyId = searchParams.get('pregnancyId');
    const patientId = searchParams.get('patientId');

    if (!pregnancyId && !patientId) {
      return NextResponse.json({ error: 'pregnancyId or patientId is required' }, { status: 400 });
    }

    const visits = await ancService.getVisits(pregnancyId || (await _findPregnancyId(patientId!)));

    return NextResponse.json(visits);
  } catch (err) {
    console.error('[API /api/hospital/anc/visit] GET failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pregnancyId, hospitalId, conductedByRole, ...visitData } = body;

    if (!pregnancyId) {
      return NextResponse.json({ error: 'pregnancyId is required' }, { status: 400 });
    }

    const visit = await ancService.createVisit({
      ...visitData,
      pregnancyId,
      hospitalId,
      conductedByRole: conductedByRole || 'ANM',
    });

    return NextResponse.json({ visit }, { status: 201 });
  } catch (err) {
    console.error('[API /api/hospital/anc/visit] POST failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function _findPregnancyId(patientId: string): Promise<string> {
  const profile = await ancService.getProfile(patientId);
  if (!profile) throw new Error('Pregnancy profile not found');
  return profile.id;
}
