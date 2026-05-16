'use server';

import { createClient } from '@supabase/supabase-js';
import type { Presentation } from '@/types/database';

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

export async function getPresentations(userId: string): Promise<Presentation[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPresentation(presentationId: string): Promise<Presentation> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', presentationId)
    .single();

  if (error) throw error;
  return data;
}

export async function createPresentation(
  userId: string,
  title: string,
  description: string = ''
): Promise<Presentation> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('presentations')
    .insert([{ user_id: userId, title, description }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePresentation(
  presentationId: string,
  updates: Partial<Presentation>
): Promise<Presentation> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('presentations')
    .update(updates)
    .eq('id', presentationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePresentation(presentationId: string): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase
    .from('presentations')
    .delete()
    .eq('id', presentationId);

  if (error) throw error;
}

export async function duplicatePresentation(presentationId: string, userId: string): Promise<Presentation> {
  const supabase = getServerSupabase();

  // Get original presentation
  const { data: original, error: fetchError } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', presentationId)
    .single();

  if (fetchError) throw fetchError;

  // Create duplicate
  const { data: duplicate, error: createError } = await supabase
    .from('presentations')
    .insert([
      {
        user_id: userId,
        title: `${original.title} (Copy)`,
        description: original.description,
      },
    ])
    .select()
    .single();

  if (createError) throw createError;

  // Copy slides
  const { data: slides, error: slidesError } = await supabase
    .from('slides')
    .select('*')
    .eq('presentation_id', presentationId);

  if (slidesError) throw slidesError;

  if (slides && slides.length > 0) {
    const newSlides = slides.map(slide => ({
      presentation_id: duplicate.id,
      order: slide.order,
      title: slide.title,
    }));

    const { error: insertError } = await supabase
      .from('slides')
      .insert(newSlides);

    if (insertError) throw insertError;
  }

  return duplicate;
}
