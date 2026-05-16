'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Upload, Settings, BarChart3, Check } from 'lucide-react';
import Link from 'next/link';
import { Media } from '@/types/database';
import { useState } from 'react';
import { toast } from 'sonner';

interface DashboardRightPanelProps {
  user: any;
  presentations: any[];
  media: Media[];
  mediaLoading: boolean;
}

export function DashboardRightPanel({
  user,
  presentations,
  media,
  mediaLoading,
}: DashboardRightPanelProps) {
  const [selectedLiveMedia, setSelectedLiveMedia] = useState<string | null>(null);
  const [settingMedia, setSettingMedia] = useState(false);

  // async function setLiveMedia(mediaId: string) {
  //   setSettingMedia(true);
  //   try {
  //     const response = await fetch('/api/live-session', {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ media_id: mediaId }),
  //     });

  //     if (!response.ok) throw new Error('Failed to set live media');
      
  //     setSelectedLiveMedia(mediaId);
  //     toast.success('Media set for live display');
  //   } catch (error) {
  //     toast.error('Failed to set live media');
  //   } finally {
  //     setSettingMedia(false);
  //   }
  // }
  async function setLiveMedia(mediaId: string) {
  setSettingMedia(true);

  try {
    console.log('SETTING MEDIA:', mediaId);

    const response = await fetch('/api/live-session', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        media_id: mediaId,
      }),
    });

    const data = await response.json();

    console.log('PUT RESPONSE:', data);

    if (!response.ok) {
      throw new Error(data.error);
    }

    setSelectedLiveMedia(mediaId);

    toast.success('Media set for live display');
  } catch (error: any) {
    console.error(error);

    toast.error(
      error.message || 'Failed to set live media'
    );
  } finally {
    setSettingMedia(false);
  }
}

  async function clearLiveMedia() {
    setSettingMedia(true);
    try {
      const response = await fetch('/api/live-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_id: null }),
      });

      if (!response.ok) throw new Error('Failed to clear live media');
      
      setSelectedLiveMedia(null);
      toast.success('Live media cleared');
    } catch (error) {
      toast.error('Failed to clear live media');
    } finally {
      setSettingMedia(false);
    }
  }
  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
      </div>

      {/* Quick Action Buttons */}
      <div className="px-4 pt-4 pb-4 border-b border-border space-y-2">
        <Link href="/media" className="block">
          <Button variant="outline" className="w-full justify-start gap-2" size="sm">
            <Upload className="w-4 h-4" />
            Upload Media
          </Button>
        </Link>
        <Link href="/settings" className="block">
          <Button variant="outline" className="w-full justify-start gap-2" size="sm">
            <Settings className="w-4 h-4" />
            Pengaturan
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="px-4 py-4 border-b border-border space-y-3">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">Total Presentasi</p>
          <p className="text-2xl font-bold text-foreground">{presentations.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">Media Files</p>
          <p className="text-2xl font-bold text-foreground">{media.length}</p>
        </div>
      </div>

      {/* Media Gallery */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Select for Live</p>
          {selectedLiveMedia && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={clearLiveMedia}
              disabled={settingMedia}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {mediaLoading ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : media.length === 0 ? (
            <p className="text-xs text-muted-foreground">No media files</p>
          ) : (
            media.slice(0, 4).map((item) => (
              <Card
                key={item.id}
                className={`bg-muted border-2 overflow-hidden group cursor-pointer transition-all ${
                  selectedLiveMedia === item.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setLiveMedia(item.id)}
              >
                <div className="aspect-video bg-muted-foreground/10 flex items-center justify-center relative overflow-hidden">
                  {item.type === 'image' ? (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-2xl">🖼️</span>
                    </div>
                  ) : item.type === 'video' ? (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                      <span className="text-2xl">🎬</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                      <span className="text-2xl">📁</span>
                    </div>
                  )}
                  {selectedLiveMedia === item.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Check className="w-8 h-8 text-primary" />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-foreground truncate">
                    {item.name || (item as any).title || 'Untitled'}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Color Palette */}
      <div className="px-4 py-4 border-b border-border">
        <p className="text-sm font-semibold text-foreground mb-3">Tema</p>
        <div className="grid grid-cols-5 gap-2">
          <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:ring-2 ring-primary transition-all" title="Blue Theme" />
          <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 hover:ring-2 ring-primary transition-all" title="Purple Theme" />
          <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-green-500 to-green-600 hover:ring-2 ring-primary transition-all" title="Green Theme" />
          <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 hover:ring-2 ring-primary transition-all" title="Orange Theme" />
          <button className="w-full aspect-square rounded-lg bg-gradient-to-br from-red-500 to-red-600 hover:ring-2 ring-primary transition-all" title="Red Theme" />
        </div>
      </div>

      {/* Help */}
      <div className="px-4 py-4 mt-auto">
        <Card className="bg-muted/50 border-border p-3">
          <p className="text-xs font-medium text-foreground mb-2">Pro Tip</p>
          <p className="text-xs text-muted-foreground">
            Gunakan keyboard shortcuts untuk editing lebih cepat. Tekan <kbd className="px-1.5 py-0.5 bg-background rounded text-xs font-mono border border-border">?</kbd> untuk bantuan.
          </p>
        </Card>
      </div>
    </div>
  );
}
