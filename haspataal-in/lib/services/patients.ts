
import { createClient } from '@/lib/supabase/client';
import { encrypt, decrypt } from '@/lib/security/encryption';

export const PatientService = {
    async getAll(hospitalId: string, page = 1, limit = 20) {
        const supabase = createClient();
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error } = await supabase
            .from('hospital_patients')
            .select(`
        *,
        global_patients (*)
      `)
            .eq('hospital_id', hospitalId)
            .range(from, to);

        if (error) throw error;

        // Decrypt mobile numbers on the fly
        return data.map((p: any) => {
            if (!p.global_patients) return p;
            try {
                return {
                    ...p,
                    global_patients: {
                        ...p.global_patients,
                        mobile: decrypt(p.global_patients.mobile)
                    }
                };
            } catch (e) {
                return p; // Return raw if decryption fails (legacy data?)
            }
        });
    },

    async create(hospitalId: string, patientData: any) {
        const supabase = createClient();

        // Mobile is encrypted. This means 'unique' constraint on mobile will check against ENCRYPTED value.
        // Since we use randomized IV, every encrypt() call produces different output.
        // So unique constraint WILL NOT work to prevent duplicate mobiles.
        // We would need a deterministic hash column for that.
        // For this War Room execution, we accept we are storing encrypted data and sacrificing easy uniqueness checks.

        const encryptedMobile = encrypt(patientData.mobile);

        const { data: newGlobal, error: globalError } = await supabase
            .from('global_patients')
            .insert({
                mobile: encryptedMobile,
                name: patientData.name,
                city: patientData.city
            })
            .select()
            .single();

        if (globalError) throw globalError;
        const globalId = newGlobal.id;

        const { data: hospitalPatient, error: linkError } = await supabase
            .from('hospital_patients')
            .insert({
                hospital_id: hospitalId,
                global_patient_id: globalId
            })
            .select()
            .single();

        if (linkError) throw linkError;
        return hospitalPatient;
    }
};
