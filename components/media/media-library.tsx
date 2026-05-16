'use client';

import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

import { Media } from '@/types/database';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Card } from '@/components/ui/card';

import {
  Upload,
  Trash2,
  Search,
  Image,
  Video,
  Music,
  Play,
} from 'lucide-react';

import { toast } from 'sonner';

interface MediaLibraryProps {
  userId: string;

  onSelectMedia?: (
    media: Media
  ) => void;
}

export function MediaLibrary({
  userId,
  onSelectMedia,
}: MediaLibraryProps) {
  const [media, setMedia] =
    useState<Media[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [filterType, setFilterType] =
    useState<
      | 'all'
      | 'image'
      | 'video'
      | 'audio'
    >('all');

  const [selectedMedia, setSelectedMedia] =
    useState<Media | null>(null);

  const [isBackgroundPlaying, setIsBackgroundPlaying] =
    useState(false);

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    loadMedia();
  }, [userId]);

  async function loadMedia() {
    try {
      const { data, error } =
        await supabase
          .from('media')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', {
            ascending: false,
          });

      if (error) throw error;

      setMedia(data || []);
    } catch (error) {
      console.error(error);

      toast.error(
        'Failed to load media'
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // UPLOAD
  // =====================================================

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const input = e.target;

    const files = input.files;

    if (!files?.length) return;

    setUploading(true);

    try {
      for (const file of Array.from(
        files
      )) {
        const ext =
          file.name.split('.').pop();

        const path = `${userId}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        // =========================
        // STORAGE UPLOAD
        // =========================

        const {
          error: uploadError,
        } = await supabase.storage
          .from('media')
          .upload(path, file);

        if (uploadError)
          throw uploadError;

        // =========================
        // GET PUBLIC URL
        // =========================

        const { data: publicUrl } =
          supabase.storage
            .from('media')
            .getPublicUrl(path);

        // =========================
        // TYPE
        // =========================

        let type:
          | 'image'
          | 'video'
          | 'audio' = 'image';

        if (
          file.type.startsWith(
            'video'
          )
        ) {
          type = 'video';
        } else if (
          file.type.startsWith(
            'audio'
          )
        ) {
          type = 'audio';
        }

        // =========================
        // INSERT DB
        // =========================

        const {
          data,
          error,
        } = await supabase
          .from('media')
          .insert([
            {
              user_id: userId,

              name:
                file.name.replace(
                  /\.[^/.]+$/,
                  ''
                ),

              type,

              url: publicUrl.publicUrl,

              file_size: file.size,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setMedia((prev) => [
          data,
          ...prev,
        ]);

        toast.success(
          `${file.name} uploaded`
        );
      }
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.message ||
          'Upload failed'
      );
    } finally {
      setUploading(false);

      // FIX NULL ERROR
      if (input) {
        input.value = '';
      }
    }
  }

  // =====================================================
  // DELETE
  // =====================================================

  async function handleDelete(
    mediaItem: Media
  ) {
    const confirmed =
      window.confirm(
        'Delete this media?'
      );

    if (!confirmed) return;

    try {
      // extract storage path
      const path =
        mediaItem.url.split(
          '/media/'
        )[1];

      if (path) {
        await supabase.storage
          .from('media')
          .remove([path]);
      }

      const { error } =
        await supabase
          .from('media')
          .delete()
          .eq('id', mediaItem.id);

      if (error) throw error;

      setMedia((prev) =>
        prev.filter(
          (m) =>
            m.id !== mediaItem.id
        )
      );

      toast.success(
        'Media deleted'
      );
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.message ||
          'Delete failed'
      );
    }
  }

  // =====================================================
  // FILTER
  // =====================================================

  const filteredMedia =
    media.filter((m) => {
      const matchesType =
        filterType === 'all' ||
        m.type === filterType;

      const matchesSearch =
        m.name
          ?.toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      return (
        matchesType &&
        matchesSearch
      );
    });

  // =====================================================
  // ICON
  // =====================================================

  function getIcon(
    type: string
  ) {
    switch (type) {
      case 'image':
        return (
          <Image className="w-4 h-4" />
        );

      case 'video':
        return (
          <Video className="w-4 h-4" />
        );

      case 'audio':
        return (
          <Music className="w-4 h-4" />
        );

      default:
        return null;
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-4 h-full flex flex-col">

      {/* UPLOAD */}

      <div className="relative border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">

        <input
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          disabled={uploading}
          onChange={
            handleFileUpload
          }
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />

        <p className="font-medium">
          {uploading
            ? 'Uploading...'
            : 'Upload Media'}
        </p>

        <p className="text-sm text-muted-foreground">
          Images, Videos, Audio
        </p>
      </div>

      {/* SEARCH */}

      <div className="space-y-2">

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

          <Input
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
            placeholder="Search media..."
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {[
            'all',
            'image',
            'video',
            'audio',
          ].map((type) => (
            <Button
              key={type}
              size="sm"
              variant={
                filterType === type
                  ? 'default'
                  : 'outline'
              }
              onClick={() =>
                setFilterType(
                  type as any
                )
              }
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {selectedMedia ? (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Preview</p>
              <p className="text-xs text-muted-foreground">{selectedMedia.name}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isBackgroundPlaying ? 'secondary' : 'outline'}
                onClick={() =>
                  setIsBackgroundPlaying(
                    !isBackgroundPlaying
                  )
                }
              >
                <Play className="w-4 h-4 mr-2" />
                {isBackgroundPlaying
                  ? 'Stop Background'
                  : 'Play Background'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedMedia(null);
                  setIsBackgroundPlaying(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>

          <div className="aspect-video bg-black/5 flex items-center justify-center overflow-hidden">
            {selectedMedia.type === 'video' ? (
              <video
                src={selectedMedia.url}
                controls
                autoPlay={isBackgroundPlaying}
                loop
                className="w-full h-full object-cover"
              />
            ) : selectedMedia.type === 'audio' ? (
              <div className="w-full p-6 grid gap-4">
                <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
                  <Music className="w-12 h-12 text-primary" />
                </div>
                <audio
                  src={selectedMedia.url}
                  controls
                  autoPlay={isBackgroundPlaying}
                  className="w-full"
                />
              </div>
            ) : (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      ) : null}

      {/* GRID */}

      <div className="flex-1 overflow-y-auto">

        {loading ? (
          <p className="text-center py-8 text-muted-foreground">
            Loading...
          </p>
        ) : filteredMedia.length ===
          0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No media
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">

            {filteredMedia.map(
              (item) => (
                <Card
                  key={item.id}
                  onClick={() => {
                    setSelectedMedia(item);
                    onSelectMedia?.(item);
                  }}
                  className={`overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all ${
                    selectedMedia?.id === item.id
                      ? 'ring-2 ring-primary'
                      : ''
                  }`}
                >
                  <div className="aspect-square bg-muted relative flex items-center justify-center overflow-hidden">

                    {item.type ===
                    'image' ? (
                      <img
                        src={
                          item.url
                        }
                        alt={
                          item.name
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getIcon(
                        item.type
                      )
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={(
                        e
                      ) => {
                        e.stopPropagation();

                        handleDelete(
                          item
                        );
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="p-2">
                    <p className="text-sm font-medium truncate">
                      {item.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {item.file_size
                        ? `${(
                            item.file_size /
                            1024 /
                            1024
                          ).toFixed(
                            2
                          )} MB`
                        : '-'}
                    </p>
                  </div>
                </Card>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}