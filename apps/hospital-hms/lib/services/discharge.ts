import { createClient } from '@/lib/supabase/client';

export const DischargeService = {
  async generateDischargeSummary(admissionId: string) {
    const supabase = createClient();

    // 1. Fetch admission details with patient and bed
    const { data: admission, error: fetchError } = await supabase
      .from('admissions')
      .select('*, patient(*), attendingDoctor:doctors_master(*)')
      .eq('id', admissionId)
      .single();
    if (fetchError || !admission) throw new Error('Admission not found');

    // 2. Fetch nursing notes
    const { data: nursingNotes } = await supabase
      .from('nursing_notes')
      .select('*')
      .eq('admission_id', admissionId);

    // 3. Fetch MAR medication admin records
    const { data: mars } = await supabase.from('mars').select('*').eq('admission_id', admissionId);

    // 4. Construct summary structure
    const stayMs =
      new Date(admission.discharged_at || new Date()).getTime() -
      new Date(admission.admitted_at).getTime();
    const stayDays = Math.max(1, Math.ceil(stayMs / (1000 * 60 * 60 * 24)));

    return {
      admissionNumber: admission.admission_number,
      admittedAt: admission.admitted_at,
      dischargedAt: admission.discharged_at || new Date(),
      stayDays,
      patientDetails: {
        name: admission.patient?.name,
        phone: admission.patient?.phone,
        gender: admission.patient?.gender,
        age: admission.patient?.age,
      },
      attendingDoctor: admission.attendingDoctor?.full_name,
      reasonForAdmission: admission.reason,
      summary: admission.discharge_summary || 'No summary entered yet.',
      clinicalNotes: nursingNotes?.map((n: any) => n.note) || [],
      medicationAdministered:
        mars?.map((m: any) => `${m.medication_name} (${m.dosage}) - Status: ${m.status}`) || [],
    };
  },

  async scheduleDischargeFollowUp(admissionId: string, date: Date) {
    const supabase = createClient();

    // Get admission details to find patient
    const { data: admission, error: fetchError } = await supabase
      .from('admissions')
      .select('*')
      .eq('id', admissionId)
      .single();
    if (fetchError || !admission) throw new Error('Admission not found');

    // Insert follow-up plan
    const { data, error } = await supabase
      .from('follow_ups')
      .insert({
        hospital_id: admission.hospital_id,
        patient_id: admission.patient_id,
        scheduled_at: date,
        status: 'PENDING',
        notes: `Discharge follow-up from admission ${admission.admission_number}`,
      })
      .select()
      .single();
    if (error) throw error;

    // Publish event for retention or scheduling
    const { eventBus } = await import('@haspataal/events');
    await eventBus.publish({
      id: crypto.randomUUID(),
      type: 'FollowUpScheduled',
      payload: {
        admissionId,
        patientId: admission.patient_id,
        followUpId: data.id,
        scheduledAt: date,
      },
      timestamp: new Date(),
      hospitalId: admission.hospital_id,
    });

    return data;
  },
};
