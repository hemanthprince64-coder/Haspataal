
import { createClient } from '@/lib/supabase/client';
import { encrypt, decrypt } from '@/lib/security/encryption';

export const VisitService = {
    async getRecent(hospitalId: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('visits')
            .select(`
        *,
        patient:hospital_patients(
            global_patients(name, mobile)
        ),
        doctor:users(mobile) 
      `)
            .eq('hospital_id', hospitalId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Decrypt diagnosis
        return data.map((v: any) => ({
            ...v,
            diagnosis: v.diagnosis ? decrypt(v.diagnosis) : null,
            patient: v.patient ? {
                ...v.patient,
                global_patients: v.patient.global_patients ? {
                    ...v.patient.global_patients,
                    mobile: decrypt(v.patient.global_patients.mobile)
                } : null
            } : null
        }));
    },

    async create(visitData: any) {
        const supabase = createClient();

        const encryptedData = {
            ...visitData,
            diagnosis: visitData.diagnosis ? encrypt(visitData.diagnosis) : null
        };

        const { data, error } = await supabase
            .from('visits')
            .insert(encryptedData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
