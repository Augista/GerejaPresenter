'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';

import type { Song } from '@/types/database';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';

import Link from 'next/link';

import { toast } from 'sonner';

import { SongEditor } from '@/components/lyrics/song-editor';

export const dynamic = 'force-dynamic';

export default function SongsPage() {
  const [user, setUser] = useState<any>(null);

  const [songs, setSongs] = useState<Song[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [selectedSongId, setSelectedSongId] =
    useState<string | null>(null);

  const [showEditor, setShowEditor] =
    useState(false);

  // =====================================================
  // SUPABASE
  // =====================================================

  const supabase: SupabaseClient | null =
    useMemo(() => {
      const url =
        process.env.NEXT_PUBLIC_SUPABASE_URL;

      const key =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        console.error(
          'Supabase env missing'
        );

        return null;
      }

      return createClient(url, key);
    }, []);

  // =====================================================
  // LOAD USER + SONGS
  // =====================================================

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const loadSongs = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        setUser(user);

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } =
          await supabase
            .from('songs')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', {
              ascending: false,
            });

        if (error) {
          throw error;
        }

        setSongs(data || []);
      } catch (error: any) {
        console.error(error);

        toast.error(
          error.message ||
            'Failed to load songs'
        );
      } finally {
        setLoading(false);
      }
    };

    loadSongs();
  }, [supabase]);

  // =====================================================
  // CREATE SONG
  // =====================================================

  const handleAddSong = async () => {
    if (!supabase || !user) return;

    try {
      const { data, error } =
        await supabase
          .from('songs')
          .insert([
            {
              user_id: user.id,

              title: 'New Song',

              artist: '',

              key: '',

              bpm: 120,

            //   lyrics: '',

              tags: [],
            },
          ])
          .select()
          .single();

      if (error) {
        throw error;
      }

      setSongs((prev) => [data, ...prev]);

      setSelectedSongId(data.id);

      setShowEditor(true);

      toast.success('Song created');
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.message ||
          'Failed to create song'
      );
    }
  };

  // =====================================================
  // DELETE SONG
  // =====================================================

  const handleDeleteSong = async (
    songId: string
  ) => {
    if (!supabase) return;

    const confirmed = window.confirm(
      'Delete this song?'
    );

    if (!confirmed) return;

    try {
      const { error } =
        await supabase
          .from('songs')
          .delete()
          .eq('id', songId);

      if (error) {
        throw error;
      }

      setSongs((prev) =>
        prev.filter((s) => s.id !== songId)
      );

      if (selectedSong?.id === songId) {
        setSelectedSong(null);
        setShowEditor(false);
      }

      toast.success('Song deleted');
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.message ||
          'Failed to delete song'
      );
    }
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredSongs = songs.filter(
    (song) =>
      song.title
        ?.toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        ) ||
      song.artist
        ?.toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        )
  );

    const [selectedSong, setSelectedSong] =
    useState<Song | null>(null);

  // =====================================================
  // LOGIN CHECK
  // =====================================================

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Please login to access songs
          </p>

          <Link href="/auth/login">
            <Button>
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-background">

      {/* HEADER */}

      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>

            <h1 className="text-2xl font-bold">
              Songs & Lyrics
            </h1>
          </div>

          <Button onClick={handleAddSong}>
            <Plus className="w-4 h-4 mr-2" />
            New Song
          </Button>
        </div>
      </header>

      {/* CONTENT */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* SONG LIST */}

          <div className="lg:col-span-1 space-y-4">

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <Input
                placeholder="Search songs..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-150 overflow-y-auto">

              {loading ? (
                <p className="text-center py-4 text-muted-foreground">
                  Loading songs...
                </p>
              ) : filteredSongs.length ===
                0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  {searchQuery
                    ? 'No songs found'
                    : 'No songs yet'}
                </p>
              ) : (
                filteredSongs.map((song) => (
                  <Card
                    key={song.id}
                    onClick={() => {
                    setSelectedSong(song);

                    setShowEditor(true);
                    }}
                    className={`p-4 cursor-pointer transition-all ${
                        selectedSong?.id === song.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">

                      <div className="flex-1 min-w-0">

                        <p className="font-medium truncate">
                          {song.title}
                        </p>

                        <p className="text-sm text-muted-foreground truncate">
                          {song.artist ||
                            'Unknown Artist'}
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          {song.bpm
                            ? `${song.bpm} BPM`
                            : 'No BPM'}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();

                          handleDeleteSong(
                            song.id
                          );
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* EDITOR */}

          <div className="lg:col-span-2">

            {showEditor &&
            selectedSong ? (
              <SongEditor
                song={selectedSong}
                onUpdate={(
                  updatedSong
                ) => {
                  setSongs((prev) =>
                    prev.map((song) =>
                      song.id ===
                      updatedSong.id
                        ? updatedSong
                        : song
                    )
                  );
                }}
              />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {filteredSongs.length ===
                  0
                    ? 'Create a new song to get started'
                    : 'Select a song to edit'}
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}