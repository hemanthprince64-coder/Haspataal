
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Singleton client for server-side usage (or creating new ones per request if needed)
export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Note: detailed service role usage depends on the specific call. 
    // For admin actions, ensure SUPABASE_SERVICE_ROLE is set.

    return createSupabaseClient(supabaseUrl, supabaseKey);
};
