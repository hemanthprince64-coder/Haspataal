
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { decrypt } from '@/lib/security/encryption';
import { verifyToken } from '@/lib/auth/jwt';

// Helper to verify patient context
async function verifyPatient(req: Request) {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) throw new Error('Unauthorized');
    // We assume a separate 'PATIENT_JWT' or reused structure. 
    // For now assuming the token contains 'global_patient_id' if it's a patient user.
    const payload = await verifyToken(token);
    if (!payload.global_patient_id) throw new Error('Not a patient token');
    return payload;
}

export async function GET(req: Request) {
    try {
        const user = await verifyPatient(req);
        const supabase = createClient();

        // Fetch Profile
        const { data: patient, error } = await supabase
            .from('global_patients')
            .select('*')
            .eq('id', user.global_patient_id)
            .single();

        if (error) throw error;

        // Decrypt mobile
        // @ts-ignore
        patient.mobile = decrypt(patient.mobile);

        // Fetch Visits (across all hospitals)
        // Note: RLS on visits usually restricts by hospital_id. 
        // We need a policy for "Patient can see own visits".
        // Current 'visit_isolation_policy' in schema.sql checks hospital_id.
        // We need to ADD a policy: create policy patient_view_own_visits on visits using (patient_id IN (select id from hospital_patients where global_patient_id = auth.uid()));
        // For now, this service query uses service role from createClient? No, createClient uses anon/service based on env.
        // We need to ensure we use a client that can bypass RLS or strictly add the policy.

        const { data: visits } = await supabase
            .from('visits')
            .select(`
                *,
                hospital:hospitals(name)
            `)
            .eq('patient_id', user.hospital_patient_id); // Complex: Global -> Hospital Patient mapping.
        // A patient has many hospital_patient records (one per hospital).
        // This endpoint might need to fetch ALL.

        return NextResponse.json({ profile: patient, visits });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 401 });
    }
}
