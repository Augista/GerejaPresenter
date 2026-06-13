'use client';

export const dynamic = 'force-dynamic';

import { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings, LogOut, Music, Image, Play } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePresentations } from '@/lib/hooks/usePresentations';
import { useSongs } from '@/lib/hooks/useSongs';
import { useMedia } from '@/lib/hooks/useMedia';
import { signOut } from '@/lib/auth/actions';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardCenter } from '@/components/dashboard/dashboard-center';
import { DashboardRightPanel } from '@/components/dashboard/dashboard-right-panel';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { presentations, loading: presentationsLoading } = usePresentations(user?.id || null);
  const { songs, loading: songsLoading } = useSongs(user?.id || null);
  const { media, loading: mediaLoading, mutate: refreshMedia } = useMedia(user?.id || null);
  const [selectedItem, setSelectedItem] = useState<{type: 'presentation' | 'song', id: string} | null>(null);

  const handleLogout = useCallback(async () => {
    await signOut();
    router.push('/auth/login');
  }, [router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar */}
      <DashboardSidebar 
        user={user}
        presentations={presentations}
        songs={songs}
        selectedItem={selectedItem}
        onSelectItem={setSelectedItem}
        onLogout={handleLogout}
        loading={presentationsLoading || songsLoading}
      />

      {/* Center Content Area */}
      <DashboardCenter 
        selectedItem={selectedItem}
        presentations={presentations}
        songs={songs}
      />

      {/* Right Panel */}
      <DashboardRightPanel
        user={user}
        presentations={presentations}
        media={media}
        mediaLoading={mediaLoading}
        onMediaRefresh={refreshMedia}
      />
    </div>
  );
}
