import { createClient } from '@/lib/supabase/client';

export const MasterDataService = {
  async searchIcd10(query: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('icd10_codes')
      .select('code, description')
      .ilike('code', `%${query}%`)
      .or(`description.ilike.%${query}%`)
      .limit(50);

    if (error) throw error;
    return data;
  },

  async searchLoinc(query: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('loinc_codes')
      .select('loinc_number, display_name, component, system')
      .ilike('display_name', `%${query}%`)
      .or(`component.ilike.%${query}%`)
      .or(`loinc_number.ilike.%${query}%`)
      .limit(50);

    if (error) throw error;
    return data;
  },

  async searchDrugs(query: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('drug_master')
      .select('id, name, generic_name, formulation, strength, unit, schedule')
      .ilike('name', `%${query}%`)
      .or(`generic_name.ilike.%${query}%`)
      .limit(50);

    if (error) throw error;
    return data;
  },

  async getDrugBrands(drugMasterId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('drug_brands')
      .select('*')
      .eq('drug_master_id', drugMasterId);

    if (error) throw error;
    return data;
  },

  async searchInvestigations(query: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('investigation_master')
      .select('id, test_name, test_code, sample_type, normal_range, reference_ranges')
      .ilike('test_name', `%${query}%`)
      .limit(50);

    if (error) throw error;
    return data;
  },

  async searchRadiology(query: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('radiology_master')
      .select('*')
      .ilike('test_name', `%${query}%`)
      .limit(50);

    if (error) throw error;
    return data;
  },

  async searchProcedures(query: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('procedure_master')
      .select('*')
      .ilike('procedure_name', `%${query}%`)
      .limit(50);

    if (error) throw error;
    return data;
  },

  async getVaccines() {
    const supabase = createClient();
    const { data, error } = await supabase.from('vaccine_master').select('*').order('vaccine_name');

    if (error) throw error;
    return data;
  },

  async getAllergies() {
    const supabase = createClient();
    const { data, error } = await supabase.from('allergy_master').select('*').order('allergen');

    if (error) throw error;
    return data;
  },

  async getClinicalTemplates(category?: string) {
    const supabase = createClient();
    let query = supabase.from('clinical_templates').select('*').eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
};
