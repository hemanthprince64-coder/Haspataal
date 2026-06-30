import { createClient } from '@/lib/supabase/client';

export const ICUService = {
  async admitToICU(
    hospitalId: string,
    admissionId: string,
    bedId: string,
    scores?: { apache?: number; prism?: number; pelod?: number },
    ventilatorMode?: string,
  ) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('icu_admissions')
      .insert({
        hospital_id: hospitalId,
        admission_id: admissionId,
        bed_id: bedId,
        apache_score: scores?.apache || null,
        prism_score: scores?.prism || null,
        pelod_score: scores?.pelod || null,
        ventilator_mode: ventilatorMode || null,
        infusions: [],
      })
      .select()
      .single();
    if (error) throw error;

    // Update Bed status to OCCUPIED and type to ICU
    const { error: bedError } = await supabase
      .from('beds')
      .update({ status: 'OCCUPIED', type: 'ICU' })
      .eq('id', bedId);
    if (bedError) throw bedError;

    return data;
  },

  async recordVitalsAndInfusion(
    icuAdmissionId: string,
    peep: number,
    fio2: number,
    infusions: any[],
  ) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('icu_admissions')
      .update({
        peep,
        fio2,
        infusions,
      })
      .eq('id', icuAdmissionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async calculateApacheScore(
    icuAdmissionId: string,
    scoreData: { age: number; temp: number; heartRate: number; map: number; rr: number },
  ) {
    const supabase = createClient();

    // Deterministic simple APACHE II scoring algorithm mockup
    let apacheScore = 0;
    if (scoreData.age > 44) apacheScore += 2;
    if (scoreData.age > 54) apacheScore += 1;
    if (scoreData.age > 64) apacheScore += 2;
    if (scoreData.temp > 39 || scoreData.temp < 36) apacheScore += 2;
    if (scoreData.heartRate > 110 || scoreData.heartRate < 60) apacheScore += 2;
    if (scoreData.map > 110 || scoreData.map < 70) apacheScore += 2;
    if (scoreData.rr > 25 || scoreData.rr < 12) apacheScore += 1;

    const { data, error } = await supabase
      .from('icu_admissions')
      .update({ apache_score: apacheScore })
      .eq('id', icuAdmissionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
