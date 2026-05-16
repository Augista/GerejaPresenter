'use client';

import { useCallback, useState, useEffect } from 'react';
import useSWR from 'swr';
import type { Presentation } from '@/types/database';
import * as presentationsActions from '@/lib/database/presentations/actions';

interface UsePresentationsResult {
  presentations: Presentation[];
  loading: boolean;
  error: Error | null;
  createPresentation: (title: string, description?: string) => Promise<Presentation>;
  deletePresentation: (id: string) => Promise<void>;
  duplicatePresentation: (id: string) => Promise<Presentation>;
  mutate: () => void;
}

export function usePresentations(userId: string | null): UsePresentationsResult {
  const [error, setError] = useState<Error | null>(null);

  const { data: presentations = [], isLoading, mutate } = useSWR(
    userId ? [`presentations-${userId}`] : null,
    async () => {
      if (!userId) return [];
      try {
        return await presentationsActions.getPresentations(userId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load presentations');
        setError(error);
        throw error;
      }
    }
  );

  const createPresentation = useCallback(
    async (title: string, description?: string): Promise<Presentation> => {
      if (!userId) throw new Error('User not authenticated');
      try {
        const presentation = await presentationsActions.createPresentation(userId, title, description);
        await mutate();
        return presentation;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create presentation');
        setError(error);
        throw error;
      }
    },
    [userId, mutate]
  );

  const deletePresentation = useCallback(
    async (id: string): Promise<void> => {
      try {
        await presentationsActions.deletePresentation(id);
        await mutate();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete presentation');
        setError(error);
        throw error;
      }
    },
    [mutate]
  );

  const duplicatePresentation = useCallback(
    async (id: string): Promise<Presentation> => {
      if (!userId) throw new Error('User not authenticated');
      try {
        const presentation = await presentationsActions.duplicatePresentation(id, userId);
        await mutate();
        return presentation;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to duplicate presentation');
        setError(error);
        throw error;
      }
    },
    [userId, mutate]
  );

  return {
    presentations,
    loading: isLoading,
    error,
    createPresentation,
    deletePresentation,
    duplicatePresentation,
    mutate,
  };
}
