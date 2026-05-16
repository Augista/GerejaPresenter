'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { useState } from 'react';
import {
  Play,
  Edit2,
} from 'lucide-react';

import Link from 'next/link';

import type {
  Presentation,
  Song,
  LyricSection,
} from '@/types/database';

interface DashboardCenterProps {
  selectedItem: {
    type: 'presentation' | 'song';
    id: string;
  } | null;

  presentations: Presentation[];

  songs: Song[];
}



const goLive = async (
  song: Song,
  sectionId: string
) => {
  try {
    const response = await fetch('/api/live-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: song.user_id,
        current_song_id: song.id,
        current_section_id: sectionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Live session API error:', errorData);
    }
  } catch (error) {
    console.error('Live session request failed:', error);
  }
};

export function DashboardCenter({
  selectedItem,
  presentations,
  songs,
}: DashboardCenterProps) {
  const [liveSectionId, setLiveSectionId] =
  useState<string | null>(null);
  // =====================================================
  // EMPTY STATE
  // =====================================================

  if (!selectedItem) {
    return (
      <div className="flex-1 bg-linear-to-br from-background to-muted flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            CorneliusPresenter
          </h1>

          <p className="text-muted-foreground mb-6">
            Pilih presentasi atau lagu dari sidebar
            untuk memulai
          </p>

          <Link href="/presentations/new">
            <Button className="w-full">
              Buat Presentasi Baru
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // PRESENTATION VIEW
  // =====================================================

  if (selectedItem.type === 'presentation') {
    const presentation =
      presentations.find(
        (p) =>
          p.id === selectedItem.id
      );

    if (!presentation) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            Presentation not found
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col bg-background">
        {/* TOOLBAR */}

        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {presentation.title}
          </h2>

          <div className="flex items-center gap-2">
            <Link
              href={`/presentations/${presentation.id}/editor`}
            >
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            </Link>

            <Button
              size="sm"
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Live
            </Button>
          </div>
        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">

            {Array.isArray(presentation.slides) &&
            presentation.slides.length >
              0 ? (
              presentation.slides.map(
                (
                  slide: any,
                  index: number
                ) => (
                  <Card
                    key={slide.id}
                    className="overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-muted-foreground/40">
                          {index + 1}
                        </p>

                        <p className="text-sm text-muted-foreground mt-2">
                          {slide.title ||
                            `Slide ${
                              index + 1
                            }`}
                        </p>
                      </div>
                    </div>

                    <div className="p-3">
                      <p className="font-medium truncate">
                        {slide.title ||
                          `Slide ${
                            index + 1
                          }`}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        {slide.layers
                          ?.length || 0}{' '}
                        layers
                      </p>
                    </div>
                  </Card>
                )
              )
            ) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-muted-foreground">
                  Tidak ada slide
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // SONG VIEW
  // =====================================================

  const song = songs.find(
    (s) =>
      s.id === selectedItem.id
  );

  if (!song) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">
          Song not found
        </p>
      </div>
    );
  }

  const sortedSections = [
    ...(song.lyric_sections || []),
  ].sort(
    (
      a: LyricSection,
      b: LyricSection
    ) =>
      (a.order_index || 0) -
      (b.order_index || 0)
  );

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* TOOLBAR */}


      <div className="border-b border-border px-6 py-4 flex items-center justify-between">

        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {song.title}
          </h2>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">

            <span>
              {song.artist ||
                'Unknown Artist'}
            </span>

            {song.key && (
              <span>
                Key: {song.key}
              </span>
            )}

            {song.bpm && (
              <span>
                {song.bpm} BPM
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/songs/${song.id}`}
        >
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Lirik
          </Button>
        </Link>
              <Link href="/live">
        <Button className="gap-2">
          <Play className="w-4 h-4" />
          Open Live
        </Button>
      </Link>
      </div>

      {/* CONTENT */}

      <div className="flex-1 overflow-y-auto p-6">

        <div className="space-y-5 max-w-3xl">

          {sortedSections.length >
          0 ? (
            sortedSections.map(
              (
                section,
                index
              ) => (
                  <Card
                    key={section.id}
                    onClick={() => {
                      setLiveSectionId(section.id);

                      goLive(song, section.id);
                    }}
className={`
  p-5
  bg-card
  border-border
  cursor-pointer
  transition-all
  hover:ring-2
  hover:ring-primary

  ${
    liveSectionId ===
    section.id
      ? 'ring-2 ring-primary border-primary'
      : ''
  }
`}
                  >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {section.type}{' '}
                      {index + 1}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Section{' '}
                      {index + 1}
                    </p>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                    {
                      section.content
                    }
                  </p>
                </Card>
              )
            )
          ) : (
            <Card className="p-10 text-center">
              <p className="text-muted-foreground">
                Tidak ada lirik
              </p>

              <Link
                href={`/songs/${song.id}`}
              >
                <Button className="mt-4">
                  Tambah Lirik
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}