import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { IPDService } from '@/lib/services/ipd';
import { createClient } from '@/lib/supabase/client';

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.RECEPTIONIST]);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('admissions')
      .select('*, patient(*), bed(*), attendingDoctor:doctors_master(*)')
      .eq('hospital_id', user.hospital_id)
      .order('admitted_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.RECEPTIONIST]);
    const body = await req.json();
    const data = await IPDService.admitPatient(
      user.hospital_id,
      body.patientId,
      body.bedId,
      body.attendingDoctorId,
      body.reason,
    );
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
