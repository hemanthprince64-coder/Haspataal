import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadFile(file, userId) {
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}_${file.name}`;

    const { data, error } = await supabase.storage
        .from('medical-records')
        .upload(fileName, file);

    if (error) {
        throw error;
    }

    // Get Public URL (if bucket is public) or Signed URL (if private)
    // Assuming public for MVP simplicity, or we can use getPublicUrl
    const { data: { publicUrl } } = supabase.storage
        .from('medical-records')
        .getPublicUrl(fileName);

    return { path: data.path, publicUrl };
}
