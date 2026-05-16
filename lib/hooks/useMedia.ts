'use client';

import { useCallback, useState } from 'react';
import useSWR from 'swr';
import type { Media } from '@/types/database';
import * as mediaActions from '@/lib/database/media/actions';

interface UseMediaResult {
  media: Media[];
  loading: boolean;
  error: Error | null;
  deleteMedia: (id: string) => Promise<void>;
  searchMedia: (query: string) => Promise<Media[]>;
  mutate: () => void;
}

export function useMedia(userId: string | null): UseMediaResult {
  const [error, setError] = useState<Error | null>(null);

  const { data: media = [], isLoading, mutate } = useSWR(
    userId ? [`media-${userId}`] : null,
    async () => {
      if (!userId) return [];
      try {
        return await mediaActions.getMedia(userId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load media');
        setError(error);
        throw error;
      }
    }
  );

  const deleteMedia = useCallback(
    async (id: string): Promise<void> => {
      try {
        await mediaActions.deleteMedia(id);
        await mutate();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete media');
        setError(error);
        throw error;
      }
    },
    [mutate]
  );

  const searchMedia = useCallback(
    async (query: string): Promise<Media[]> => {
      if (!userId) return [];
      try {
        return await mediaActions.searchMedia(userId, query);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Search failed');
        setError(error);
        throw error;
      }
    },
    [userId]
  );

  return {
    media,
    loading: isLoading,
    error,
    deleteMedia,
    searchMedia,
    mutate,
  };
}
