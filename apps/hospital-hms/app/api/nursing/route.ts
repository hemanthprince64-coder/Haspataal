import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { NursingService } from '@/lib/services/nursing';
import { createClient } from '@/lib/supabase/client';

export async function GET(req: Request) {
  try {
    await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.NURSE]);
    const { searchParams } = new URL(req.url);
    const admissionId = searchParams.get('admissionId');
    if (!admissionId) {
      return NextResponse.json({ error: 'Missing admissionId' }, { status: 400 });
    }

    const notes = await NursingService.getNotes(admissionId);

    // Fetch MAR items
    const supabase = createClient();
    const { data: mars, error: marError } = await supabase
      .from('mars')
      .select('*, administeredBy:staff(name)')
      .eq('admission_id', admissionId);
    if (marError) throw marError;

    return NextResponse.json({ notes, mars });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.NURSE]);
    const body = await req.json();

    if (body.type === 'MAR') {
      const data = await NursingService.createMarItem(
        user.hospital_id,
        body.admissionId,
        body.medicationName,
        body.dosage,
        body.route,
        new Date(body.scheduledTime),
      );
      return NextResponse.json(data);
    } else {
      const data = await NursingService.addNote(
        user.hospital_id,
        body.admissionId,
        user.user_id,
        body.note,
        body.shift,
      );
      return NextResponse.json(data);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.NURSE]);
    const body = await req.json();
    const data = await NursingService.administerMedication(body.marId, user.user_id, body.status);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
