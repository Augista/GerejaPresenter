'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UseAuthResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  isConfigured: boolean;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get current user and session
    const getUser = async () => {
      try {
        // First check for existing session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          setLoading(false);
          return;
        }

        // If no session, try to get user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        setUser(authUser);
      } catch (err) {
        console.log(' Auth error:', err);
        setError(err instanceof Error ? err : new Error('Auth error'));
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(' Auth state changed:', _event, !!session?.user);
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    error,
    isConfigured: isSupabaseConfigured(),
  };
}
