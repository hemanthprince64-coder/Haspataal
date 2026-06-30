import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { ICUService } from '@/lib/services/icu';
import { createClient } from '@/lib/supabase/client';

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.NURSE]);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('icu_admissions')
      .select('*, admission(*, patient(*)), bed(*)')
      .eq('hospital_id', user.hospital_id)
      .is('discharged_at', null);
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.NURSE]);
    const body = await req.json();

    if (body.action === 'VITALS_INFUSION') {
      const data = await ICUService.recordVitalsAndInfusion(
        body.icuAdmissionId,
        body.peep,
        body.fio2,
        body.infusions,
      );
      return NextResponse.json(data);
    } else if (body.action === 'APACHE') {
      const data = await ICUService.calculateApacheScore(body.icuAdmissionId, body.scoreData);
      return NextResponse.json(data);
    } else {
      const data = await ICUService.admitToICU(
        user.hospital_id,
        body.admissionId,
        body.bedId,
        body.scores,
        body.ventilatorMode,
      );
      return NextResponse.json(data);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
