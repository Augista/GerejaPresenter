'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Media } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Search, Upload, Image, Video, Music } from 'lucide-react';
import { toast } from 'sonner';

interface LiveMediaSelectorProps {
  userId: string;
  onSelectMedia: (media: Media) => void;
  selectedMediaId?: string;
  onClearMedia: () => void;
}

export function LiveMediaSelector({
  userId,
  onSelectMedia,
  selectedMediaId,
  onClearMedia,
}: LiveMediaSelectorProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio'>('all');

  useEffect(() => {
    loadMedia();
  }, [userId]);

  async function loadMedia() {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Failed to load media:', error);
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  }

  const filteredMedia = media.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-card border-l border-border shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Media Library</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onClearMedia}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            className="pl-8 h-8 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1">
          {['all', 'image', 'video', 'audio'].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setFilterType(type as any)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading media...</p>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground mb-2">No media found</p>
            <p className="text-xs text-muted-foreground/60">
              Upload media from the Media Library
            </p>
          </div>
        ) : (
          filteredMedia.map((item) => (
            <Card
              key={item.id}
              className={`p-3 cursor-pointer transition-all border-2 ${
                selectedMediaId === item.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onSelectMedia(item)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1 text-primary">
                  {getMediaIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {item.type}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/50">
        <p className="text-xs text-muted-foreground text-center">
          Click to select media for live display
        </p>
      </div>
    </div>
  );
}
