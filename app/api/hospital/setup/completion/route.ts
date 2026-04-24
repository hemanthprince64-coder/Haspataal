import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getHospitalIdFromSession } from '@/lib/auth';
import { computeSetupCompletion } from '@/lib/setup/completion-engine';

export async function GET(req: Request) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const completion = await computeSetupCompletion(hospitalId);
    return NextResponse.json(completion);
  } catch (err) {
    console.error('[setup/completion] Error:', err);
    return NextResponse.json({ error: 'Failed to compute completion' }, { status: 500 });
  }
}
