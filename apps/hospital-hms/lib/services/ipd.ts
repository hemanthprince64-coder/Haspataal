import { createClient } from '@/lib/supabase/client';

export const IPDService = {
  async admitPatient(
    hospitalId: string,
    patientId: string,
    bedId: string,
    attendingDoctorId: string,
    reason: string,
  ) {
    const supabase = createClient();

    // 1. Check if bed is available
    const { data: bed, error: bedError } = await supabase
      .from('beds')
      .select('*')
      .eq('id', bedId)
      .single();
    if (bedError || !bed) throw new Error('Bed not found');
    if (bed.status !== 'AVAILABLE') throw new Error('Bed is not available');

    // 2. Generate admission number
    const admissionNumber = 'ADM-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 3. Create admission record
    const { data: admission, error: admissionError } = await supabase
      .from('admissions')
      .insert({
        hospital_id: hospitalId,
        patient_id: patientId,
        bed_id: bedId,
        attending_doctor_id: attendingDoctorId,
        admission_number: admissionNumber,
        status: 'ADMITTED',
        reason,
        daily_bed_charge: 1500, // standard baseline bed charge
      })
      .select()
      .single();
    if (admissionError) throw admissionError;

    // 4. Update Bed status to OCCUPIED and link patient
    const { error: bedUpdateError } = await supabase
      .from('beds')
      .update({
        status: 'OCCUPIED',
        patient_id: patientId,
        admitted_at: new Date(),
      })
      .eq('id', bedId);
    if (bedUpdateError) throw bedUpdateError;

    // 5. Emit PatientAdmitted event
    const { eventBus } = await import('@haspataal/events');
    await eventBus.publish({
      id: crypto.randomUUID(),
      type: 'PatientAdmitted',
      payload: {
        admissionId: admission.id,
        admissionNumber: admission.admission_number,
        patientId,
        bedId,
        attendingDoctorId,
      },
      timestamp: new Date(),
      hospitalId,
    });

    return admission;
  },

  async transferWard(admissionId: string, newBedId: string) {
    const supabase = createClient();

    // Get current admission details
    const { data: admission, error: fetchError } = await supabase
      .from('admissions')
      .select('*')
      .eq('id', admissionId)
      .single();
    if (fetchError || !admission) throw new Error('Admission not found');

    const oldBedId = admission.bed_id;
    if (oldBedId === newBedId) return admission;

    // Check if new bed is available
    const { data: newBed, error: bedError } = await supabase
      .from('beds')
      .select('*')
      .eq('id', newBedId)
      .single();
    if (bedError || !newBed) throw new Error('Target bed not found');
    if (newBed.status !== 'AVAILABLE') throw new Error('Target bed is not available');

    // Free old bed
    if (oldBedId) {
      const { error: oldBedError } = await supabase
        .from('beds')
        .update({
          status: 'AVAILABLE',
          patient_id: null,
          admitted_at: null,
        })
        .eq('id', oldBedId);
      if (oldBedError) throw oldBedError;
    }

    // Occupy new bed
    const { error: newBedError } = await supabase
      .from('beds')
      .update({
        status: 'OCCUPIED',
        patient_id: admission.patient_id,
        admitted_at: new Date(),
      })
      .eq('id', newBedId);
    if (newBedError) throw newBedError;

    // Update Admission
    const { data: updatedAdmission, error: updateError } = await supabase
      .from('admissions')
      .update({ bed_id: newBedId })
      .eq('id', admissionId)
      .select()
      .single();
    if (updateError) throw updateError;

    return updatedAdmission;
  },

  async expectedDischarge(admissionId: string, date: Date) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('admissions')
      .update({ expected_discharge_at: date })
      .eq('id', admissionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async dischargePatient(admissionId: string, notes: string, dischargeSummary: string) {
    const supabase = createClient();

    // 1. Get admission details
    const { data: admission, error: fetchError } = await supabase
      .from('admissions')
      .select('*')
      .eq('id', admissionId)
      .single();
    if (fetchError || !admission) throw new Error('Admission not found');

    const dischargedAt = new Date();

    // 2. Free the occupied Bed
    if (admission.bed_id) {
      const { error: bedError } = await supabase
        .from('beds')
        .update({
          status: 'AVAILABLE',
          patient_id: null,
          admitted_at: null,
          expected_discharge_at: null,
        })
        .eq('id', admission.bed_id);
      if (bedError) throw bedError;
    }

    // 3. Update Admission details
    const { data: updatedAdmission, error: updateError } = await supabase
      .from('admissions')
      .update({
        status: 'DISCHARGED',
        discharged_at: dischargedAt,
        discharge_summary: dischargeSummary,
        notes,
      })
      .eq('id', admissionId)
      .select()
      .single();
    if (updateError) throw updateError;

    // 4. Connect to billing: Compile total inpatient charges
    const stayMs = dischargedAt.getTime() - new Date(admission.admitted_at).getTime();
    const stayDays = Math.max(1, Math.ceil(stayMs / (1000 * 60 * 60 * 24)));
    const bedChargeRate = Number(admission.daily_bed_charge || 1500);
    const totalBedCharges = stayDays * bedChargeRate;

    const invoiceNumber = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error: invoiceError } = await supabase.from('invoices').insert({
      hospital_id: admission.hospital_id,
      patient_id: admission.patient_id,
      admission_id: admission.id,
      invoice_number: invoiceNumber,
      source: 'IPD',
      status: 'DRAFT',
      subtotal: totalBedCharges,
      total_amount: totalBedCharges,
      balance_amount: totalBedCharges,
      payload: { stayDays, bedChargeRate, totalBedCharges },
    });
    if (invoiceError) throw invoiceError;

    return updatedAdmission;
  },
};
