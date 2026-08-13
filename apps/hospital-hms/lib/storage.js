import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
  if (!url.startsWith('http')) url = 'https://dummy.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';
  return createClient(url, key);
};

export async function uploadFile(file, userId) {
  const timestamp = Date.now();
  const fileName = `${userId}/${timestamp}_${file.name}`;

  const { data, error } = await getSupabase().storage.from('medical-records').upload(fileName, file);

  if (error) {
    throw error;
  }

  // Get Public URL (if bucket is public) or Signed URL (if private)
  // Assuming public for MVP simplicity, or we can use getPublicUrl
  const {
    data: { publicUrl },
  } = getSupabase().storage.from('medical-records').getPublicUrl(fileName);

  return { path: data.path, publicUrl };
}
