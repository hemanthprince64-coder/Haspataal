
import { createClient } from '@/lib/supabase/client';

export type AuditAction = 'LOGIN' | 'PATIENT_CREATE' | 'VISIT_CREATE' | 'DIAGNOSTIC_ORDER' | 'VIEW_PHI' | 'DIAGNOSTIC_UPDATE' | 'HOSPITAL_APPROVED';

export const AuditService = {
    async log(action: AuditAction, hospitalId: string, userId: string, targetTable: string, targetId: string, meta?: any) {
        try {
            const supabase = createClient();
            // Use service role if needed, or RLS will handle insertion if the user has permission to insert into audit_logs.
            // Ideally, audit logging should be done with a service role to ensure it never fails due to user permissions,
            // and users shouldn't be able to delete/spoof it readily.
            // For MVP, if we use the same client, we rely on RLS allowing insert for authenticated users.

            const { error } = await supabase
                .from('audit_logs')
                .insert({
                    hospital_id: hospitalId,
                    user_id: userId,
                    action,
                    target_table: targetTable,
                    target_id: targetId,
                    meta: meta // assuming we add a jsonb column or text
                });

            if (error) console.error('Audit Log Error:', error);
        } catch (e) {
            console.error('Audit Log System Failure:', e);
        }
    }
};
