import { createClient } from '@/lib/supabase/client';

export const WardService = {
  async getBedDashboard(hospitalId: string) {
    const supabase = createClient();

    // Fetch all beds in the hospital
    const { data: beds, error } = await supabase
      .from('beds')
      .select('*, department:departments(*), unit:units(*)')
      .eq('hospital_id', hospitalId);
    if (error) throw error;

    // Calculate metrics
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter((b) => b.status === 'OCCUPIED').length;
    const availableBeds = beds.filter((b) => b.status === 'AVAILABLE').length;
    const cleaningBeds = beds.filter((b) => b.status === 'CLEANING').length;
    const maintenanceBeds = beds.filter((b) => b.status === 'UNDER_MAINTENANCE').length;

    const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

    return {
      beds,
      metrics: {
        totalBeds,
        occupiedBeds,
        availableBeds,
        cleaningBeds,
        maintenanceBeds,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
      },
    };
  },

  async updateBedStatus(bedId: string, status: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('beds')
      .update({ status })
      .eq('id', bedId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
