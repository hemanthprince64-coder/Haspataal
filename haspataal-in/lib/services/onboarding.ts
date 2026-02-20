
import { createClient } from '@/lib/supabase/client';
import { hashPassword } from '@/lib/auth/hash';

export const OnboardingService = {
    async submitApplication(data: any) {
        const supabase = createClient();
        const { data: application, error } = await supabase
            .from('hospital_applications')
            .insert({
                hospital_name: data.hospital_name,
                city: data.city,
                contact_person: data.contact_person,
                mobile: data.mobile,
                email: data.email
            })
            .select()
            .single();

        if (error) throw error;
        return application;
    },

    async getPendingApplications() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('hospital_applications')
            .select('*')
            .eq('status', 'pending');

        if (error) throw error;
        return data;
    },

    async approveApplication(applicationId: string) {
        const supabase = createClient();

        // 1. Get Application
        const { data: app, error: appError } = await supabase
            .from('hospital_applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (appError || !app) throw new Error('Application not found');

        // 2. Create Hospital
        const { data: hospital, error: hospError } = await supabase
            .from('hospitals')
            .insert({
                name: app.hospital_name,
                city: app.city
            })
            .select()
            .single();

        if (hospError) throw hospError;

        // 3. Create Admin User (Default password: Mobile number - User must change)
        const passwordHash = await hashPassword(app.mobile);
        const { error: userError } = await supabase
            .from('users')
            .insert({
                hospital_id: hospital.id,
                role: 'admin',
                mobile: app.mobile,
                password_hash: passwordHash
            });

        if (userError) throw userError;

        // 4. Update Application Status
        await supabase
            .from('hospital_applications')
            .update({ status: 'approved' })
            .eq('id', applicationId);

        // 5. Audit Log (Mocking context)
        const { AuditService } = await import('@/lib/services/audit');
        await AuditService.log('HOSPITAL_APPROVED', hospital.id, 'system', 'hospitals', hospital.id, { app_id: applicationId });

        return { hospital, message: 'Hospital and Admin created successfully' };
    }
};
