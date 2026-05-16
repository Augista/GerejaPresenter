'use server';

import { createClient } from '@supabase/supabase-js';
import type { Media } from '@/types/database';

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

export async function getMedia(userId: string): Promise<Media[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMediaById(mediaId: string): Promise<Media> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('id', mediaId)
    .single();

  if (error) throw error;
  return data;
}

export async function createMediaRecord(
  userId: string,
  title: string,
  file_path: string,
  type: 'image' | 'video' | 'audio',
  file_size: number
): Promise<Media> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('media')
    .insert([
      {
        user_id: userId,
        title,
        file_path,
        type,
        file_size,
        uploaded_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMedia(mediaId: string, updates: Partial<Media>): Promise<Media> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('media')
    .update(updates)
    .eq('id', mediaId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMedia(mediaId: string): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase
    .from('media')
    .delete()
    .eq('id', mediaId);

  if (error) throw error;
}

export async function searchMedia(userId: string, query: string): Promise<Media[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', `%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
