/* eslint-disable */
import { createClient } from '@/lib/supabase/client';

export const OTService = {
  async scheduleOT(
    hospitalId: string,
    patientId: string,
    procedureName: string,
    surgeonId: string,
    theatreName: string,
    scheduledAt: Date,
  ) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ot_schedules')
      .insert({
        hospital_id: hospitalId,
        patient_id: patientId,
        procedure_name: procedureName,
        surgeon_id: surgeonId,
        theatre_name: theatreName,
        scheduled_at: scheduledAt,
        status: 'SCHEDULED',
        who_checklist: {},
      })
      .select()
      .single();
    if (error) throw error;

    // Timeline Engine publish
    try {
      const { getTimelinePublisher } = await import('@haspataal/timeline');
      await getTimelinePublisher().publish({
        patientId,
        hospitalId,
        doctorId: surgeonId,
        eventType: 'SurgeryScheduled',
        title: `Surgery Scheduled: ${procedureName}`,
        subtitle: `Theatre: ${theatreName}`,
        timestamp: scheduledAt,
        category: 'SURGERY',
        module: 'ot',
        severity: 'MEDIUM',
        metadata: {
          otScheduleId: data.id,
          procedureName,
          surgeonId,
          theatreName,
        },
      });
    } catch (e: any) {
      // console.error('[Timeline] Failed to publish SurgeryScheduled event:', e.message);
    }

    return data;
  },

  async updateChecklist(otScheduleId: string, checklistJson: any) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ot_schedules')
      .update({ who_checklist: checklistJson })
      .eq('id', otScheduleId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSurgeryNotes(otScheduleId: string, surgeryNotes: string, recoveryStatus: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ot_schedules')
      .update({
        surgery_notes: surgeryNotes,
        recovery_status: recoveryStatus,
        status: 'COMPLETED',
      })
      .eq('id', otScheduleId)
      .select()
      .single();
    if (error) throw error;

    // Timeline Engine publish
    try {
      const { getTimelinePublisher } = await import('@haspataal/timeline');
      await getTimelinePublisher().publish({
        patientId: data.patient_id,
        hospitalId: data.hospital_id,
        doctorId: data.surgeon_id,
        eventType: 'SurgeryCompleted',
        title: `Surgery Completed: ${data.procedure_name}`,
        subtitle: `Recovery Status: ${recoveryStatus}`,
        summary: surgeryNotes,
        timestamp: new Date(),
        category: 'SURGERY',
        module: 'ot',
        severity: 'MEDIUM',
        metadata: {
          otScheduleId,
          procedureName: data.procedure_name,
          recoveryStatus,
        },
      });
    } catch (e: any) {
      // console.error('[Timeline] Failed to publish SurgeryCompleted event:', e.message);
    }

    return data;
  },
};
