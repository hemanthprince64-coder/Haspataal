import { z } from 'zod';

import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { TimelineMutationHandler } from '@haspataal/timeline';

const ExportSchema = z.object({
  patientId: z.string().uuid(),
  format: z.enum(['PDF', 'JSON', 'FHIR']),
  filters: z
    .object({
      category: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.PATIENT, Roles.DOCTOR, Roles.ADMIN]);
    const body = await req.json();
    const { patientId, format, filters } = ExportSchema.parse(body);

    // Patients can only export their own data
    if (user.role === 'PATIENT' && user.user_id !== patientId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await TimelineMutationHandler.requestExport(patientId, format, user.user_id, filters);

    return NextResponse.json(result, { status: 202 });
  } catch (err: unknown) {
    const e = err as Error;
    if (e.message?.startsWith('Forbidden') || e.message?.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: e.message },
        { status: e.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to queue export' }, { status: 500 });
  }
}
