'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';

import { useParams } from 'next/navigation';

import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { SongEditor } from '@/components/lyrics/song-editor';

import type {
  Song,
  LyricSection,
} from '@/types/database';

export default function SongDetailPage() {
  const params = useParams();

  const id = params.id as string;

  const [song, setSong] =
    useState<Song | null>(null);

  const [loading, setLoading] =
    useState(true);

  const supabase: SupabaseClient =
    useMemo(() => {
      return createClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,
        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }, []);

  useEffect(() => {
    if (!id) return;

    loadSong();
  }, [id]);

  async function loadSong() {
    try {
      setLoading(true);

      // SONG
      const {
        data: songData,
        error: songError,
      } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .single();

      if (songError) {
        throw songError;
      }

      // LYRIC SECTIONS
      const {
        data: sections,
        error: sectionError,
      } = await supabase
        .from('lyric_sections')
        .select('*')
        .eq('song_id', id)
        .order('order_index', {
          ascending: true,
        });

      if (sectionError) {
        throw sectionError;
      }

      setSong({
        ...songData,

        lyric_sections:
          sections || [],
      });
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.message ||
          'Failed to load song'
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Song not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/songs">
            <Button
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>

          <h1 className="text-xl font-bold">
            {song.title}
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <SongEditor
          song={song}
          onUpdate={(updated) =>
            setSong(updated)
          }
        />
      </main>
    </div>
  );
}