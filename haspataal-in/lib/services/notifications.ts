
import { createClient } from '@/lib/supabase/client';

export const NotificationService = {
    async create(hospitalId: string, message: string, userId?: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('notifications')
            .insert({
                hospital_id: hospitalId,
                user_id: userId,
                message,
                status: 'unread'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getUnread(hospitalId: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('hospital_id', hospitalId)
            .eq('status', 'unread')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async markAsRead(notificationId: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('notifications')
            .update({ status: 'read' })
            .eq('id', notificationId);

        if (error) throw error;
    }
};
