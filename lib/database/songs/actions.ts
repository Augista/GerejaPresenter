'use server';

import { createClient } from '@supabase/supabase-js';

import type {
  Song,
  LyricSection,
} from '@/types/database';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(url, key);
}

// =====================================================
// SONGS
// =====================================================

export async function getSongs(
  userId: string
): Promise<Song[]> {
  const supabase = getSupabase();

  const {
    data,
    error,
  } = await supabase
    .from('songs')
    .select(`
      *,
      lyric_sections (
        id,
        song_id,
        type,
        content,
        order_index,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getSong(
  songId: string
) {
  const supabase = getSupabase();

const { data, error } =
  await supabase
    .from('songs')
    .select(`
      *,
      lyric_sections (
        id,
        type,
        content,
        order_index
      )
    `)
    .eq('id', songId)
    .order('updated_at', {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

export async function createSong(
userId: string, title: string, p0: {}): Promise<Song> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('songs')
    .insert([
      {
        user_id: userId,

        title,

        artist: '',

        key: '',

        bpm: 120,

        lyrics: '',

        tags: [],
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateSong(
  songId: string,
  updates: Partial<Song>
): Promise<Song> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('songs')
    .update(updates)
    .eq('id', songId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteSong(
  songId: string,
  userId: string
) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('songs')
    .delete()
    .eq('id', songId)
    .eq('user_id', userId);

  if (error) throw error;
}

// =====================================================
// LYRIC SECTIONS
// =====================================================

export async function getSections(
  songId: string
): Promise<LyricSection[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('lyric_sections')
    .select('*')
    .eq('song_id', songId)
    .order('order_index');

  if (error) throw error;

  return data || [];
}

export async function createSection(
  songId: string,
  type: string,
  content: string,
  order_index: number
) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('lyric_sections')
    .insert([
      {
        song_id: songId,

        type,

        content,

        order_index,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateSection(
  id: string,
  updates: Partial<LyricSection>
) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('lyric_sections')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteSection(
  id: string
) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('lyric_sections')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

function getServerSupabase() {
  throw new Error('Function not implemented.');
}
