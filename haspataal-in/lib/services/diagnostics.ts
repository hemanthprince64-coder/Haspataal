
import { createClient } from '@/lib/supabase/client';

export const DiagnosticsService = {
    async getCatalog() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('diagnostics_catalog')
            .select('*');

        if (error) throw error;
        return data;
    },

    async createOrder(hospitalId: string, orderData: any) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('diagnostic_orders')
            .insert({
                ...orderData,
                hospital_id: hospitalId,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getOrders(hospitalId: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('diagnostic_orders')
            .select(`
            *,
            test:diagnostics_catalog(name, price),
            patient:hospital_patients(
                global_patients(name)
            )
        `)
            .eq('hospital_id', hospitalId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async updateStatus(orderId: string, status: string, reportUrl?: string) {
        const supabase = createClient();
        const updates: any = { status };
        if (reportUrl) updates.report_url = reportUrl;

        const { data, error } = await supabase
            .from('diagnostic_orders')
            .update(updates)
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
