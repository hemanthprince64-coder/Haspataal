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

    // Timeline Engine publish
    try {
      const { data: admission } = await supabase
        .from('admissions')
        .select('patient_id')
        .eq('id', admissionId)
        .single();

      if (admission) {
        const { getTimelinePublisher } = await import('@haspataal/timeline');
        await getTimelinePublisher().publish({
          patientId: admission.patient_id,
          hospitalId,
          eventType: 'NursingNoteCreated',
          title: 'Nursing Note Created',
          subtitle: `Shift: ${shift || 'MORNING'}`,
          summary: note.substring(0, 100) + (note.length > 100 ? '...' : ''),
          timestamp: new Date(),
          category: 'CLINICAL_NOTE',
          module: 'nursing',
          severity: 'LOW',
          metadata: {
            nursingNoteId: data.id,
            admissionId,
            nurseId,
          },
        });
      }
    } catch (e: any) {
      console.error('[Timeline] Failed to publish NursingNoteCreated event:', e.message);
    }

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

    // Timeline Engine publish
    try {
      const { data: admission } = await supabase
        .from('admissions')
        .select('patient_id')
        .eq('id', data.admission_id)
        .single();

      if (admission) {
        const { getTimelinePublisher } = await import('@haspataal/timeline');
        await getTimelinePublisher().publish({
          patientId: admission.patient_id,
          hospitalId: data.hospital_id,
          eventType: 'MarAdministered',
          title: `Medication Administered: ${data.medication_name}`,
          subtitle: `Dose: ${data.dosage} (${data.route})`,
          summary: `Medication administration record updated to: ${status}.`,
          timestamp: new Date(),
          category: 'PRESCRIPTION',
          module: 'nursing',
          severity: 'LOW',
          metadata: {
            marId,
            admissionId: data.admission_id,
            status,
            administeredById,
          },
        });
      }
    } catch (e: any) {
      console.error('[Timeline] Failed to publish MarAdministered event:', e.message);
    }

    return data;
  },
};
