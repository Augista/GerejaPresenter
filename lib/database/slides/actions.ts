'use server';

import { createClient } from '@supabase/supabase-js';
import type { Slide, SlideLayer } from '@/types/database';

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

// Slide operations

export async function getSlides(presentationId: string): Promise<Slide[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .eq('presentation_id', presentationId)
    .order('order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getSlide(slideId: string): Promise<Slide> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .eq('id', slideId)
    .single();

  if (error) throw error;
  return data;
}

export async function createSlide(
  presentationId: string,
  order: number,
  title: string = ''
): Promise<Slide> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('slides')
    .insert([{ presentation_id: presentationId, order, title }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSlide(slideId: string, updates: Partial<Slide>): Promise<Slide> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('slides')
    .update(updates)
    .eq('id', slideId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSlide(slideId: string): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase
    .from('slides')
    .delete()
    .eq('id', slideId);

  if (error) throw error;
}

export async function reorderSlides(slideIds: string[]): Promise<void> {
  const supabase = getServerSupabase();
  const updates = slideIds.map((id, index) => ({
    id,
    order: index,
  }));

  const { error } = await supabase
    .from('slides')
    .upsert(updates, { onConflict: 'id' });

  if (error) throw error;
}

// Slide Layer operations

export async function getSlideLayer(layerId: string): Promise<SlideLayer> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('slide_layers')
    .select('*')
    .eq('id', layerId)
    .single();

  if (error) throw error;
  return data;
}

export async function getSlideLayers(slideId: string): Promise<SlideLayer[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('slide_layers')
    .select('*')
    .eq('slide_id', slideId)
    .order('order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createSlideLayer(slideId: string, layer: Partial<SlideLayer>): Promise<SlideLayer> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('slide_layers')
    .insert([{ slide_id: slideId, ...layer }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSlideLayer(layerId: string, updates: Partial<SlideLayer>): Promise<SlideLayer> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('slide_layers')
    .update(updates)
    .eq('id', layerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSlideLayer(layerId: string): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase
    .from('slide_layers')
    .delete()
    .eq('id', layerId);

  if (error) throw error;
}
