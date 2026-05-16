'use client';

import { useCallback, useState } from 'react';

import useSWR from 'swr';

import type { Song } from '@/types/database';

import * as songsActions from '@/lib/database/songs/actions';

interface UseSongsResult {
  songs: Song[];

  loading: boolean;

  error: Error | null;

  createSong: (
    title: string
  ) => Promise<Song>;

  deleteSong: (
    id: string
  ) => Promise<void>;

  searchSongs: (
    query: string
  ) => Promise<Song[]>;

  mutate: () => void;
}

export function useSongs(
  userId: string | null
): UseSongsResult {
  const [error, setError] =
    useState<Error | null>(null);

  // =====================================================
  // SWR
  // =====================================================

  const {
    data: songs = [],
    isLoading,
    mutate,
  } = useSWR(
    userId
      ? ['songs', userId]
      : null,

    async () => {
      if (!userId) return [];

      try {
        return await songsActions.getSongs(
          userId
        );
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error(
                'Failed to load songs'
              );

        setError(error);

        throw error;
      }
    }
  );

  // =====================================================
  // CREATE
  // =====================================================

  const createSong = useCallback(
    async (
      title: string
    ): Promise<Song> => {
      if (!userId) {
        throw new Error(
          'User not authenticated'
        );
      }

      try {
        const song =
          await songsActions.createSong(
            userId,
            title,
            {}
          );

        await mutate();

        return song;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error(
                'Failed to create song'
              );

        setError(error);

        throw error;
      }
    },

    [userId, mutate]
  );

  // =====================================================
  // DELETE
  // =====================================================

  const deleteSong = useCallback(
    async (
      id: string
    ): Promise<void> => {
      if (!userId) {
        throw new Error(
          'User not authenticated'
        );
      }

      try {
        await songsActions.deleteSong(
          userId,
          id,
        );

        await mutate();
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error(
                'Failed to delete song'
              );

        setError(error);

        throw error;
      }
    },

    [userId, mutate]
  );

  // =====================================================
  // SEARCH
  // =====================================================

  const searchSongs = useCallback(
    async (
      query: string
    ): Promise<Song[]> => {
      try {
        return songs.filter(
          (song) =>
            song.title
              ?.toLowerCase()
              .includes(
                query.toLowerCase()
              ) ||
            song.artist
              ?.toLowerCase()
              .includes(
                query.toLowerCase()
              )
        );
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error(
                'Search failed'
              );

        setError(error);

        throw error;
      }
    },

    [songs]
  );

  return {
    songs,

    loading: isLoading,

    error,

    createSong,

    deleteSong,

    searchSongs,

    mutate,
  };
}