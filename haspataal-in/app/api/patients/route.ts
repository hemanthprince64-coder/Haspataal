
import { NextResponse } from 'next/server';
import { PatientService } from '@/lib/services/patients';
import { checkRole, Roles } from '@/lib/auth/roleGuard';

export async function GET(req: Request) {
    try {
        const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.RECEPTIONIST]);
        // @ts-ignore
        const data = await PatientService.getAll(user.hospital_id);
        return NextResponse.json(data);
    } catch (err: any) {
        if (err.message.startsWith('Forbidden') || err.message.startsWith('Unauthorized')) {
            return NextResponse.json({ error: err.message }, { status: err.message.startsWith('Unauthorized') ? 401 : 403 });
        }
        return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Only Admin and Receptionist can create patients
        const user = await checkRole(req, [Roles.ADMIN, Roles.RECEPTIONIST]);
        const body = await req.json();

        // @ts-ignore
        const data = await PatientService.create(user.hospital_id, body);

        // Audit Log
        const { AuditService } = await import('@/lib/services/audit');
        // @ts-ignore
        await AuditService.log('PATIENT_CREATE', user.hospital_id, user.user_id, 'hospital_patients', data.id, { patient_name: body.name });

        return NextResponse.json(data);
    } catch (err: any) {
        if (err.message.startsWith('Forbidden') || err.message.startsWith('Unauthorized')) {
            return NextResponse.json({ error: err.message }, { status: err.message.startsWith('Unauthorized') ? 401 : 403 });
        }
        console.error(err);
        return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
    }
}
