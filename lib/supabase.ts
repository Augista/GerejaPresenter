import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example-project-id.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-replace-with-your-key';

// Create a placeholder client for build time - will be replaced with real client on runtime
export const supabase = typeof window !== 'undefined' || supabaseUrl.startsWith('https://') && supabaseUrl.includes('supabase.co')
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://example-project-id.supabase.co', 'example-key');

export function isSupabaseConfigured() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Presentation operations
export async function getPresentations(userId: string) {
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getPresentation(presentationId: string) {
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', presentationId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createPresentation(userId: string, title: string, description: string = '') {
  const { data, error } = await supabase
    .from('presentations')
    .insert([{ user_id: userId, title, description }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updatePresentation(presentationId: string, updates: Partial<any>) {
  const { data, error } = await supabase
    .from('presentations')
    .update(updates)
    .eq('id', presentationId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deletePresentation(presentationId: string) {
  const { error } = await supabase
    .from('presentations')
    .delete()
    .eq('id', presentationId);
  
  if (error) throw error;
}

// Slide operations
export async function getSlides(presentationId: string) {
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .eq('presentation_id', presentationId)
    .order('order', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function getSlide(slideId: string) {
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .eq('id', slideId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createSlide(presentationId: string, order: number, title: string = '') {
  const { data, error } = await supabase
    .from('slides')
    .insert([{ presentation_id: presentationId, order, title }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateSlide(slideId: string, updates: Partial<any>) {
  const { data, error } = await supabase
    .from('slides')
    .update(updates)
    .eq('id', slideId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteSlide(slideId: string) {
  const { error } = await supabase
    .from('slides')
    .delete()
    .eq('id', slideId);
  
  if (error) throw error;
}

export async function reorderSlides(slideIds: string[]) {
  const updates = slideIds.map((id, index) => ({
    id,
    order: index
  }));

  const { error } = await supabase
    .from('slides')
    .upsert(updates, { onConflict: 'id' });
  
  if (error) throw error;
}

// Slide Layer operations
export async function getSlideLayer(layerId: string) {
  const { data, error } = await supabase
    .from('slide_layers')
    .select('*')
    .eq('id', layerId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getSlideLayers(slideId: string) {
  const { data, error } = await supabase
    .from('slide_layers')
    .select('*')
    .eq('slide_id', slideId)
    .order('order', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function createSlideLayer(slideId: string, layer: Partial<any>) {
  const { data, error } = await supabase
    .from('slide_layers')
    .insert([{ slide_id: slideId, ...layer }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateSlideLayer(layerId: string, updates: Partial<any>) {
  const { data, error } = await supabase
    .from('slide_layers')
    .update(updates)
    .eq('id', layerId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteSlideLayer(layerId: string) {
  const { error } = await supabase
    .from('slide_layers')
    .delete()
    .eq('id', layerId);
  
  if (error) throw error;
}

// Media operations
export async function getMedia(userId: string) {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function uploadMedia(file: File, userId: string, title: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(fileName, file);
  
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('media')
    .insert([{
      user_id: userId,
      title,
      file_path: fileName,
      type: file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'audio',
      file_size: file.size
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Song operations
export async function getSongs(userId: string) {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getSong(songId: string) {
  const { data, error } = await supabase
    .from('songs')
    .select('*, lyrics(*)')
    .eq('id', songId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createSong(userId: string, title: string, metadata: any = {}) {
  const { data, error } = await supabase
    .from('songs')
    .insert([{ user_id: userId, title, metadata }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateSong(songId: string, updates: Partial<any>) {
  const { data, error } = await supabase
    .from('songs')
    .update(updates)
    .eq('id', songId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Lyric operations
export async function getLyrics(songId: string) {
  const { data, error } = await supabase
    .from('lyrics')
    .select('*')
    .eq('song_id', songId)
    .order('order', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function searchLyrics(userId: string, query: string) {
  const { data, error } = await supabase
    .from('lyrics')
    .select('*, songs(*)')
    .ilike('content', `%${query}%`)
    .order('songs(updated_at)', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createLyric(songId: string, content: string, order: number, section_type: string) {
  const { data, error } = await supabase
    .from('lyrics')
    .insert([{ song_id: songId, content, order, section_type }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateLyric(lyricId: string, updates: Partial<any>) {
  const { data, error } = await supabase
    .from('lyrics')
    .update(updates)
    .eq('id', lyricId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Theme operations
export async function getThemes(userId: string) {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
}

export async function createTheme(userId: string, name: string, theme: Partial<any>) {
  const { data, error } = await supabase
    .from('themes')
    .insert([{ user_id: userId, name, ...theme }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Stage Display Config
export async function getStageDisplayConfig(presentationId: string) {
  const { data, error } = await supabase
    .from('stage_display_configs')
    .select('*')
    .eq('presentation_id', presentationId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

export async function updateStageDisplayConfig(presentationId: string, updates: Partial<any>) {
  const existing = await getStageDisplayConfig(presentationId);
  
  if (existing) {
    const { data, error } = await supabase
      .from('stage_display_configs')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('stage_display_configs')
      .insert([{ presentation_id, ...updates }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

// Beat Detection
export async function getBeatDetection(slideId: string) {
  const { data, error } = await supabase
    .from('beat_detection')
    .select('*')
    .eq('slide_id', slideId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function saveBeatDetection(slideId: string, bpm: number, beats: number[], confidence: number) {
  const existing = await getBeatDetection(slideId);
  
  if (existing) {
    const { data, error } = await supabase
      .from('beat_detection')
      .update({ bpm, beats, confidence, analyzed_at: new Date().toISOString() })
      .eq('slide_id', slideId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('beat_detection')
      .insert([{ slide_id: slideId, bpm, beats, confidence }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
