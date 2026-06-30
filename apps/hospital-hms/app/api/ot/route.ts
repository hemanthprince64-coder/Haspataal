import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { OTService } from '@/lib/services/ot';
import { createClient } from '@/lib/supabase/client';

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.NURSE]);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ot_schedules')
      .select('*, patient(*), surgeon:doctors_master(*)')
      .eq('hospital_id', user.hospital_id)
      .order('scheduled_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR]);
    const body = await req.json();
    const data = await OTService.scheduleOT(
      user.hospital_id,
      body.patientId,
      body.procedureName,
      body.surgeonId || user.user_id,
      body.theatreName,
      new Date(body.scheduledAt),
    );
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.NURSE]);
    const body = await req.json();
    if (body.whoChecklist) {
      const data = await OTService.updateChecklist(body.otScheduleId, body.whoChecklist);
      return NextResponse.json(data);
    } else {
      const data = await OTService.updateSurgeryNotes(
        body.otScheduleId,
        body.surgeryNotes,
        body.recoveryStatus,
      );
      return NextResponse.json(data);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
