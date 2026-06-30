import { createClient } from '@/lib/supabase/client';

export const RecordsService = {
  async getEMRTimeline(patientId: string) {
    const supabase = createClient();

    // Fetch admissions, visits, lab orders, prescriptions, OT procedures
    const [admissionsRes, visitsRes, labOrdersRes, prescriptionsRes, otSchedulesRes] =
      await Promise.all([
        supabase.from('admissions').select('*').eq('patient_id', patientId).order('admitted_at'),
        supabase.from('visits').select('*').eq('patient_id', patientId).order('created_at'),
        supabase.from('lab_orders').select('*').eq('patient_id', patientId).order('created_at'),
        supabase
          .from('patient_prescriptions')
          .select('*, items:prescription_items(*)')
          .eq('patient_id', patientId)
          .order('created_at'),
        supabase.from('ot_schedules').select('*').eq('patient_id', patientId).order('scheduled_at'),
      ]);

    const timeline = [];

    // format admissions
    if (admissionsRes.data) {
      for (const adm of admissionsRes.data) {
        timeline.push({
          id: adm.id,
          type: 'ADMISSION',
          date: adm.admitted_at,
          title: `Patient Admitted (Number: ${adm.admission_number})`,
          description: `Reason: ${adm.reason || 'Not specified'}. Daily charge: ${adm.daily_bed_charge}. Status: ${adm.status}`,
        });
      }
    }

    // format visits
    if (visitsRes.data) {
      for (const v of visitsRes.data) {
        timeline.push({
          id: v.id,
          type: 'VISIT',
          date: v.created_at,
          title: 'Outpatient (OPD) Visit',
          description: `Visit Type: ${v.type || 'Routine'}. Summary/Chief Complaint: ${v.chief_complaints || 'None'}`,
        });
      }
    }

    // format lab orders
    if (labOrdersRes.data) {
      for (const lo of labOrdersRes.data) {
        timeline.push({
          id: lo.id,
          type: 'LAB_ORDER',
          date: lo.created_at,
          title: `Laboratory Investigation Ordered (No: ${lo.order_number})`,
          description: `Priority: ${lo.priority}. Clinical info: ${lo.clinical_info || 'None'}. Status: ${lo.status}`,
        });
      }
    }

    // format prescriptions
    if (prescriptionsRes.data) {
      for (const p of prescriptionsRes.data) {
        timeline.push({
          id: p.id,
          type: 'PRESCRIPTION',
          date: p.created_at,
          title: 'Prescription Written',
          description: `Items: ${p.items?.map((i: any) => `${i.drug_name} (${i.dosage})`).join(', ') || 'None'}`,
        });
      }
    }

    // format surgeries
    if (otSchedulesRes.data) {
      for (const ot of otSchedulesRes.data) {
        timeline.push({
          id: ot.id,
          type: 'SURGERY',
          date: ot.scheduled_at,
          title: `OT Scheduled: ${ot.procedure_name}`,
          description: `Theatre: ${ot.theatre_name}. Status: ${ot.status}. Surgeon ID: ${ot.surgeon_id}`,
        });
      }
    }

    // Sort timeline chronologically (latest first)
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return timeline;
  },

  async getDocumentMetadata(documentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('diagnostic_documents')
      .select('*')
      .eq('id', documentId)
      .single();
    if (error) throw error;
    return data;
  },
};
