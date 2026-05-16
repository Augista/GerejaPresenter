import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create the Supabase client
 * Only initialized on client-side with proper environment variables
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    // Server-side: return null, use server actions instead
    return null;
  }

  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key && url !== 'your-supabase-url') {
      supabaseClient = createClient(url, key);
    }
  }

  return supabaseClient;
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-supabase-url'
  );
}
