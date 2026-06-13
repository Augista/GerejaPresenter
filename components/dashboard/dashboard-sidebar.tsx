'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, LogOut, Music, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Presentation, Song } from '@/types/database';
import { BiblePanel } from '@/components/dashboard/bible-panel';

interface DashboardSidebarProps {
  user: any;
  presentations: Presentation[];
  songs: Song[];
  selectedItem: { type: 'presentation' | 'song'; id: string } | null;
  onSelectItem: (item: { type: 'presentation' | 'song'; id: string } | null) => void;
  onLogout: () => void;
  loading: boolean;
}

export function DashboardSidebar({
  user,
  presentations,
  songs,
  selectedItem,
  onSelectItem,
  onLogout,
  loading,
}: DashboardSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'presentations' | 'songs' | 'alkitab'>(
    'presentations'
  );

  // Normalize text for flexible searching
  // Example:
  // "Ku Berbahagia" => "kuberbahagia"
  // "KU   BERBAHAGIA" => "kuberbahagia"
  const normalizeText = (text: string = '') => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '') // remove spaces
      .replace(/[^\w]/g, ''); // remove symbols
  };

  const normalizedQuery = normalizeText(searchQuery);

  // Presentation Search
  const filteredPresentations = useMemo(() => {
    if (!normalizedQuery) return presentations;

    return presentations.filter((presentation) => {
      const normalizedTitle = normalizeText(
        presentation.title || ''
      );

      return normalizedTitle.includes(normalizedQuery);
    });
  }, [presentations, normalizedQuery]);

  // Song Search (title + artist + lyrics)
  const filteredSongs = useMemo(() => {
    if (!normalizedQuery) return songs;

    return songs.filter((song) => {
      // Title
      const normalizedTitle = normalizeText(song.title || '');

      // Artist
      const normalizedArtist = normalizeText(song.artist || '');

      // Lyrics
      const lyricsText = Array.isArray(song.lyric_sections)
        ? song.lyric_sections
            .map((section: any) => {
              if (typeof section === 'string') return section;

              return (
                section.content ||
                section.lyrics ||
                section.text ||
                ''
              );
            })
            .join(' ')
        : '';

      const normalizedLyrics = normalizeText(lyricsText);

      return (
        normalizedTitle.includes(normalizedQuery) ||
        normalizedArtist.includes(normalizedQuery) ||
        normalizedLyrics.includes(normalizedQuery)
      );
    });
  }, [songs, normalizedQuery]);

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              ChurchPresent 
            </h2>

            <p className="text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={onLogout}
            className="h-8 w-8 p-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Search — hidden on Alkitab tab */}
        {activeTab !== 'alkitab' && (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder={
                activeTab === 'songs'
                  ? 'Cari judul, artist, atau lirik...'
                  : 'Cari presentasi...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b border-border space-y-2">
        <Link href="/presentations/new" className="block">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Presentasi Baru
          </Button>
        </Link>

        <Link href="/songs" className="block">
          <Button variant="outline" className="w-full" size="sm">
            <Music className="w-4 h-4 mr-2" />
            Kelola Lagu
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-4 pt-4">
        <button
          onClick={() => setActiveTab('presentations')}
          className={`text-sm font-medium pb-2 px-2 border-b-2 transition-colors ${
            activeTab === 'presentations'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Presentasi ({presentations.length})
        </button>

        <button
          onClick={() => setActiveTab('songs')}
          className={`text-sm font-medium pb-2 px-2 border-b-2 transition-colors ${
            activeTab === 'songs'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Lagu ({songs.length})
        </button>

        <button
          onClick={() => setActiveTab('alkitab')}
          className={`text-sm font-medium pb-2 px-2 border-b-2 transition-colors ${
            activeTab === 'alkitab'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Alkitab
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {activeTab === 'alkitab' ? (
          <BiblePanel />
        ) : loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Loading...
            </p>
          </div>
        ) : activeTab === 'presentations' ? (
          filteredPresentations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Tidak ada presentasi
              </p>
            </div>
          ) : (
            filteredPresentations.map((presentation) => (
              <button
                key={presentation.id}
                onClick={() =>
                  onSelectItem({
                    type: 'presentation',
                    id: presentation.id,
                  })
                }
                className={`w-full text-left p-3 rounded-lg transition-colors border ${
                  selectedItem?.type === 'presentation' &&
                  selectedItem?.id === presentation.id
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-transparent hover:bg-muted hover:border-border'
                }`}
              >
                <p className="text-sm font-medium truncate">
                  {presentation.title}
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  {Array.isArray(presentation.slides)
                    ? presentation.slides.length
                    : 0}{' '}
                  slide
                </p>
              </button>
            ))
          )
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Tidak ada lagu
            </p>
          </div>
        ) : (
          filteredSongs.map((song) => (
            <button
              key={song.id}
              onClick={() =>
                onSelectItem({
                  type: 'song',
                  id: song.id,
                })
              }
              className={`w-full text-left p-3 rounded-lg transition-colors border ${
                selectedItem?.type === 'song' &&
                selectedItem?.id === song.id
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'border-transparent hover:bg-muted hover:border-border'
              }`}
            >
              <p className="text-sm font-medium truncate">
                {song.title}
              </p>

              <p className="text-xs text-muted-foreground mt-1 truncate">
                {song.artist || 'Unknown'} •{' '}
                {song.lyric_sections?.length || 0} bait
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}