'use server';

import { createClient } from '@supabase/supabase-js';

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

/**
 * Upload media file to storage
 * Returns the public URL if successful
 */
export async function uploadMediaFile(
  file: Buffer,
  fileName: string,
  bucket: string = 'media'
): Promise<{ url: string; path: string }> {
  const supabase = getServerSupabase();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return {
    url: data.publicUrl,
    path: fileName,
  };
}

/**
 * Delete file from storage
 */
export async function deleteStorageFile(filePath: string, bucket: string = 'media'): Promise<void> {
  const supabase = getServerSupabase();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Get signed URL for private files
 */
export async function getSignedUrl(filePath: string, bucket: string = 'media', expiresIn: number = 3600): Promise<string> {
  const supabase = getServerSupabase();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Signed URL failed: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * List files in bucket
 */
export async function listStorageFiles(path: string, bucket: string = 'media'): Promise<any[]> {
  const supabase = getServerSupabase();

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path);

  if (error) {
    throw new Error(`List failed: ${error.message}`);
  }

  return data || [];
}
