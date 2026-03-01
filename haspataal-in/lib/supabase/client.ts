
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client using the ANON key.
 * Safe for use in middleware, API routes, and anywhere RLS should be enforced.
 */
export const createAnonClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createSupabaseClient(supabaseUrl, supabaseKey);
};

/**
 * Creates a Supabase client using the SERVICE_ROLE key.
 * ⚠️  SERVER-ONLY — Never expose this client to the browser.
 * This bypasses RLS and should only be used for admin operations.
 */
export const createAdminClient = () => {
    if (typeof window !== 'undefined') {
        throw new Error('createAdminClient must only be called on the server');
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;
    if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE environment variable is not set');
    }
    return createSupabaseClient(supabaseUrl, serviceRoleKey);
};

/** @deprecated Use createAnonClient() or createAdminClient() instead */
export const createClient = createAnonClient;
