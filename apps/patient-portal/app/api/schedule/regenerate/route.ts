import { NextResponse } from 'next/server';

import { requireHospitalAccess, hospitalAccessError } from '@/lib/auth/hospital-access';
import { generateSlotsFromSchedule } from '@/lib/schedule-actions';

export async function POST(request: Request) {
  try {
    // Auth gate
    await requireHospitalAccess('opd', 'manage_schedule');

    const body = await request.json();
    const { doctorId } = body;

    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 });
    }

    // Default range: next 30 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const result = await generateSlotsFromSchedule({
      doctorId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return hospitalAccessError(error);
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
