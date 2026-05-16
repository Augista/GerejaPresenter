'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Get Supabase client for server actions
 * Uses service role if available, otherwise anon key
 */
function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }

  return createClient(url, key);
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResult<T> {
  data: T | null;
  error: AuthError | null;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string): Promise<AuthResult<{ id: string; email: string }>> {
  try {
    const supabase = getServerSupabase();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return {
      data: {
        id: data.user.id,
        email: data.user.email || '',
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Signup failed' },
    };
  }
}

/**
 * Sign in user with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResult<{ access_token: string; refresh_token: string; user: { id: string; email: string } }>> {
  try {
    const supabase = getServerSupabase();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return {
      data: {
        access_token: data.session?.access_token || '',
        refresh_token: data.session?.refresh_token || '',
        user: {
          id: data.user.id,
          email: data.user.email || '',
        },
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Sign in failed' },
    };
  }
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<AuthResult<{ id: string; email: string }>> {
  try {
    const supabase = getServerSupabase();
    const cookieStore = await cookies();
    
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    return {
      data: {
        id: data.user.id,
        email: data.user.email || '',
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Failed to get user' },
    };
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<AuthResult<null>> {
  try {
    const supabase = getServerSupabase();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Sign out failed' },
    };
  }
}
