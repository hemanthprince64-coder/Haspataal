import { NextResponse } from 'next/server';
import { computeSetupCompletion } from '@/lib/setup/completion-engine';
import { hospitalAccessError, requireHospitalAccess } from '@/lib/auth/hospital-access';

export async function GET() {
  let access;
  try {
    access = await requireHospitalAccess('setup', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  try {
    const completion = await computeSetupCompletion(access.hospitalId);
    return NextResponse.json(completion);
  } catch (err) {
    console.error('[setup/completion] Error:', err);
    return NextResponse.json({ error: 'Failed to compute completion' }, { status: 500 });
  }
}
