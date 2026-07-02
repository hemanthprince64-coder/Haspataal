import { JourneyEngine } from '@haspataal/journey';

import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR]);
    const body = await req.json();
    const journey = await JourneyEngine.enroll({
      ...body,
      hospitalId: (user as any).hospital_id,
    });
    return NextResponse.json({ success: true, data: journey });
  } catch (err: any) {
    if (err.message.startsWith('Forbidden') || err.message.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: err.message },
        { status: err.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ error: 'patientId required' }, { status: 400 });
    }
    const journeys = await JourneyEngine.get(patientId);
    return NextResponse.json({ success: true, data: journeys });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
