import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing from environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads a profile photo to the Supabase storage bucket and returns the public URL.
 * Requires an existing public bucket named "avatars".
 */
export async function uploadProfilePhoto(file, patientId) {
    if (!file || !file.name) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${patientId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-photos/${fileName}`;

    // Upload the file to the 'avatars' bucket
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Retrieve and return the public URL
    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return data.publicUrl;
}
