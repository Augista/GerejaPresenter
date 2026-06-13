'use client';

import { useEffect, useState } from 'react';

import type {
  Song,
  LyricSection as LyricSectionType,
} from '@/types/database';

import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import {
  Plus,
  Trash2,
  Save,
  Upload,
  ClipboardPaste,
  X,
} from 'lucide-react';

import { toast } from 'sonner';

interface SongEditorProps {
  song: Song;

  onUpdate: (
    updatedSong: Song
  ) => void;
}

const SECTION_TYPES = [
  'verse',
  'chorus',
  'bridge',
  'pre-chorus',
  'intro',
  'outro',
];

export function SongEditor({
  song,
  onUpdate,
}: SongEditorProps) {
  // =====================================================
  // LOCAL STATES
  // =====================================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [sections, setSections] =
    useState<
      LyricSectionType[]
    >([]);

  const [pasteText, setPasteText] =
    useState('');

  // SONG META LOCAL
  // IMPORTANT:
  // local state only
  // biar typing smooth
  // =====================================================

  const [title, setTitle] =
    useState(song.title || '');

  const [artist, setArtist] =
    useState(song.artist || '');

  const [bpm, setBpm] =
    useState<number | ''>(
      song.bpm || ''
    );

  const [key, setKey] =
    useState(song.key || '');

  // =====================================================
  // LOAD SECTIONS
  // =====================================================

  useEffect(() => {
    setTitle(song.title || '');

    setArtist(song.artist || '');

    setBpm(song.bpm || '');

    setKey(song.key || '');

    loadSections();
  }, [song.id]);

  async function loadSections() {
    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from('lyric_sections')
        .select('*')
        .eq('song_id', song.id)
        .order('order_index', {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setSections(data || []);
    } catch (error: any) {
      console.error(error);

      toast.error(
        'Failed loading sections'
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // ADD SECTION
  // =====================================================

  async function handleAddSection() {
    try {
      const {
        data,
        error,
      } = await supabase
        .from('lyric_sections')
        .insert([
          {
            song_id: song.id,

            type: 'verse',

            content: '',

            order_index:
              sections.length,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSections((prev) => [
        ...prev,
        data,
      ]);

      toast.success(
        'Section added'
      );
    } catch (error: any) {
      console.error(error);

      toast.error(
        'Failed adding section'
      );
    }
  }

  // =====================================================
  // DELETE SECTION
  // =====================================================

  async function handleDeleteSection(
    sectionId: string
  ) {
    const confirmed =
      window.confirm(
        'Delete section?'
      );

    if (!confirmed) return;

    try {
      const { error } =
        await supabase
          .from(
            'lyric_sections'
          )
          .delete()
          .eq('id', sectionId);

      if (error) {
        throw error;
      }

      setSections((prev) =>
        prev.filter(
          (s) => s.id !== sectionId
        )
      );

      toast.success(
        'Section deleted'
      );
    } catch (error: any) {
      console.error(error);

      toast.error(
        'Delete failed'
      );
    }
  }

  // =====================================================
  // PARSE PASTE TEXT
  // =====================================================

  function parseLyricText(
    text: string
  ): { type: string; content: string }[] {
    const markerRegex =
      /^\{(verse|chorus|bridge|pre-chorus|intro|outro)\}/i;

    const lines = text.split(/\r?\n/);
    const hasMarkers = lines.some((l) =>
      markerRegex.test(l.trim())
    );

    if (hasMarkers) {
      const result: {
        type: string;
        content: string;
      }[] = [];
      let currentType = 'verse';
      let currentLines: string[] = [];

      for (const line of lines) {
        const match =
          line.trim().match(markerRegex);
        if (match) {
          const joined =
            currentLines.join('\n').trim();
          if (joined) {
            result.push({
              type: currentType,
              content: joined,
            });
            currentLines = [];
          }
          currentType =
            match[1].toLowerCase();
        } else {
          currentLines.push(line);
        }
      }

      const last =
        currentLines.join('\n').trim();
      if (last) {
        result.push({
          type: currentType,
          content: last,
        });
      }

      return result;
    }

    // No markers: every 2 non-empty lines = 1 section
    const nonEmpty = lines
      .map((l) => l.trim())
      .filter(Boolean);

    const result: {
      type: string;
      content: string;
    }[] = [];

    for (let i = 0; i < nonEmpty.length; i += 2) {
      result.push({
        type: 'verse',
        content: nonEmpty
          .slice(i, i + 2)
          .join('\n'),
      });
    }

    return result;
  }

  // =====================================================
  // IMPORT FROM PASTE
  // =====================================================

  async function handleImportFromPaste() {
    const text = pasteText.trim();
    if (!text) {
      toast.error('Nothing to import');
      return;
    }

    const parsed = parseLyricText(text);
    if (parsed.length === 0) {
      toast.error('Could not parse any sections');
      return;
    }

    try {
      const inserts = parsed.map(
        (section, index) => ({
          song_id: song.id,
          type: section.type,
          content: section.content,
          order_index:
            sections.length + index,
        })
      );

      const { data, error } =
        await supabase
          .from('lyric_sections')
          .insert(inserts)
          .select();

      if (error) throw error;

      setSections((prev) => [
        ...prev,
        ...(data || []),
      ]);

      setPasteText('');
      toast.success(
        `${parsed.length} sections imported`
      );
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.message || 'Import failed'
      );
    }
  }

  // =====================================================
  // IMPORT TXT
  // =====================================================

async function handleImportText(
  file: File
) {
  try {
    // ============================================
    // READ TXT
    // ============================================

    const text =
      await file.text();

    // WINDOWS + UNIX SAFE
    const lines = text
      .split(/\r?\n/)
      .map((line) =>
        line.trim()
      )
      .filter(Boolean);

    if (lines.length === 0) {
      toast.error(
        'Empty file'
      );

      return;
    }

    // ============================================
    // EVERY 2 LINES = 1 SECTION
    // ============================================

    const chunks: string[] =
      [];

    for (
      let i = 0;
      i < lines.length;
      i += 2
    ) {
      chunks.push(
        lines
          .slice(i, i + 2)
          .join('\n')
      );
    }

    // ============================================
    // BULK INSERT
    // ============================================

    const inserts =
      chunks.map(
        (
          chunk,
          index
        ) => ({
          song_id:
            song.id,

          type: 'verse',

          content: chunk,

          order_index:
            sections.length +
            index,
        })
      );

    const {
      data,
      error,
    } = await supabase
      .from(
        'lyric_sections'
      )
      .insert(inserts)
      .select();

    // ============================================
    // ERROR
    // ============================================

    if (error) {
      console.error(
        'SUPABASE IMPORT ERROR:',
        error
      );

      toast.error(
        error.message ||
          'Database insert failed'
      );

      return;
    }

    // ============================================
    // UPDATE UI
    // ============================================

    setSections((prev) => [
      ...prev,
      ...(data || []),
    ]);

    toast.success(
      `${chunks.length} sections imported`
    );
  } catch (error: any) {
    console.error(
      'IMPORT TXT ERROR:',
      error
    );

    toast.error(
      error?.message ||
        'Import failed'
    );
  }
}

  // =====================================================
  // SAVE ALL
  // =====================================================

  async function handleSaveAll() {
    try {
      setSaving(true);

      // SONG UPDATE
      const {
        data: updatedSong,
        error:
          updateSongError,
      } = await supabase
        .from('songs')
        .update({
          title,

          artist,

          bpm:
            bpm === ''
              ? null
              : bpm,

          key,
        })
        .eq('id', song.id)
        .select()
        .single();

      if (updateSongError) {
        throw updateSongError;
      }

      // SECTIONS UPDATE
      await Promise.all(
        sections.map(
          async (
            section,
            index
          ) => {
            const { error } =
              await supabase
                .from(
                  'lyric_sections'
                )
                .update({
                  content:
                    section.content,

                  type:
                    section.type,

                  order_index:
                    index,
                })
                .eq(
                  'id',
                  section.id
                );

            if (error) {
              throw error;
            }
          }
        )
      );

      onUpdate(updatedSong);

      toast.success(
        'Song saved'
      );
    } catch (error: any) {
      console.error(error);

      toast.error(
        'Save failed'
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <Card className="p-8 text-center">
        Loading...
      </Card>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">

      {/* SONG DETAILS */}

      <Card className="p-6 space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Song Editor
          </h2>

          <Button
            onClick={
              handleSaveAll
            }
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />

            {saving
              ? 'Saving...'
              : 'Save'}
          </Button>
        </div>

        <div>
          <label className="text-sm font-medium">
            Title
          </label>

          <Input
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            placeholder="Song title"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="text-sm font-medium">
              Artist
            </label>

            <Input
              value={artist}
              onChange={(e) =>
                setArtist(
                  e.target.value
                )
              }
              placeholder="Artist"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              BPM
            </label>

            <Input
              type="number"
              value={bpm}
              onChange={(e) =>
                setBpm(
                  Number(
                    e.target.value
                  ) || ''
                )
              }
              placeholder="120"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Key
            </label>

            <Input
              value={key}
              onChange={(e) =>
                setKey(
                  e.target.value
                )
              }
              placeholder="C"
            />
          </div>
        </div>
      </Card>

      {/* IMPORT */}

      <Card className="p-6 space-y-4">

        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            Import Lyrics
          </h3>

          <label>
            <input
              type="file"
              accept=".txt"
              hidden
              onChange={async (
                e
              ) => {
                const file =
                  e.target
                    .files?.[0];

                if (!file)
                  return;

                await handleImportText(
                  file
                );
              }}
            />

            <Button asChild variant="outline" size="sm">
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Import TXT
              </span>
            </Button>
          </label>
        </div>

        {/* PASTE LYRICS */}

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <ClipboardPaste className="w-4 h-4" />
            Paste Lyrics
          </label>

          <Textarea
            value={pasteText}
            onChange={(e) =>
              setPasteText(e.target.value)
            }
            placeholder={`Paste lyrics here...\n\nUse {verse}, {chorus}, {bridge}, {pre-chorus}, {intro}, {outro} markers to auto-detect section types.\n\nWithout markers: every 2 lines = 1 section.`}
            className="min-h-40 resize-y font-mono text-sm"
          />

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleImportFromPaste}
              disabled={!pasteText.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Parse & Import
            </Button>

            {pasteText.trim() && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPasteText('')}
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Example: <span className="font-mono">{'{verse}'}</span> or <span className="font-mono">{'{chorus}'}</span> on its own line sets the section type and is removed from the lyrics.
          </p>
        </div>
      </Card>

      {/* SECTIONS */}

      <Card className="p-6">

        <div className="flex items-center justify-between mb-4">

          <h3 className="font-semibold">
            Lyrics Sections
          </h3>

          <Button
            size="sm"
            onClick={
              handleAddSection
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>

        <div className="space-y-4">

          {sections.length ===
          0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sections yet
            </div>
          ) : (
            sections.map(
              (
                section,
                index
              ) => (
                <Card
                  key={
                    section.id
                  }
                  className="p-4"
                >

                  <div className="flex items-center justify-between mb-3">

                    <div className="flex gap-2">

                      <select
                        value={
                          section.type
                        }
                        onChange={(
                          e
                        ) => {
                          const value =
                            e
                              .target
                              .value;

                          setSections(
                            (
                              prev: any[]
                            ) =>
                              prev.map(
                                (
                                  s
                                ) =>
                                  s.id ===
                                  section.id
                                    ? {
                                        ...s,

                                        type: value,
                                      }
                                    : s
                              )
                          );
                        }}
                        className="border rounded-md px-3 py-2 bg-background"
                      >
                        {SECTION_TYPES.map(
                          (
                            type
                          ) => (
                            <option
                              key={
                                type
                              }
                              value={
                                type
                              }
                            >
                              {type}
                            </option>
                          )
                        )}
                      </select>

                      <div className="px-3 py-2 text-sm rounded-md bg-muted">
                        #
                        {index +
                          1}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDeleteSection(
                          section.id
                        )
                      }
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <Textarea
                    value={
                      section.content
                    }
                    onChange={(
                      e
                    ) => {
                      const value =
                        e.target
                          .value;

                      setSections(
                        (
                          prev
                        ) =>
                          prev.map(
                            (
                              s
                            ) =>
                              s.id ===
                              section.id
                                ? {
                                    ...s,

                                    content:
                                      value,
                                  }
                                : s
                          )
                      );
                    }}
                    placeholder="Type lyrics..."
                    className="min-h-30 resize-y"
                  />
                </Card>
              )
            )
          )}
        </div>
      </Card>
    </div>
  );
}