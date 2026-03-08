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
    // Note: The 'avatars' bucket must be created in Supabase dashboard with Public access enabled
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
            upsert: true,
            contentType: file.type || 'image/jpeg'
        });

    if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
            throw new Error(`Storage bucket 'avatars' not found. Please create it in Supabase dashboard with Public access.`);
        }
        throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Retrieve and return the public URL
    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return data.publicUrl;
}
