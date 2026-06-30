import { createClient } from '@/lib/supabase/client';

export const NursingService = {
  async addNote(
    hospitalId: string,
    admissionId: string,
    nurseId: string,
    note: string,
    shift?: string,
  ) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('nursing_notes')
      .insert({
        hospital_id: hospitalId,
        admission_id: admissionId,
        nurse_id: nurseId,
        note,
        shift: shift || 'MORNING',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getNotes(admissionId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('nursing_notes')
      .select('*, nurse:staff(name)')
      .eq('admission_id', admissionId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createMarItem(
    hospitalId: string,
    admissionId: string,
    medicationName: string,
    dosage: string,
    route: string,
    scheduledTime: Date,
  ) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('mars')
      .insert({
        hospital_id: hospitalId,
        admission_id: admissionId,
        medication_name: medicationName,
        dosage,
        route,
        scheduled_time: scheduledTime,
        status: 'PENDING',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async administerMedication(marId: string, administeredById: string, status: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('mars')
      .update({
        status,
        administered_by_id: administeredById,
        administered_at: new Date(),
      })
      .eq('id', marId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
