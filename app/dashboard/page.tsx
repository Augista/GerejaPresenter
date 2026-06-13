'use client';

export const dynamic = 'force-dynamic';

import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePresentations } from '@/lib/hooks/usePresentations';
import { useSongs } from '@/lib/hooks/useSongs';
import { useMedia } from '@/lib/hooks/useMedia';
import { signOut } from '@/lib/auth/actions';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardCenter } from '@/components/dashboard/dashboard-center';
import { DashboardRightPanel } from '@/components/dashboard/dashboard-right-panel';

function LiveMiniPreview() {
  const [liveData, setLiveData] = useState<{ section: any; media: any } | null>(null);
  const [bibleVerse, setBibleVerse] = useState<any>(null);

  useEffect(() => {
    async function poll() {
      try {
        const [sessionRes, bibleRes] = await Promise.all([
          fetch('/api/live-session'),
          fetch('/api/bible-live'),
        ]);
        if (sessionRes.ok) setLiveData(await sessionRes.json());
        if (bibleRes.ok) setBibleVerse(await bibleRes.json());
      } catch {}
    }
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, []);

  const displayText = bibleVerse?.text
    ? `${bibleVerse.text}\n— ${bibleVerse.reference}`
    : (liveData?.section?.content || '');
  const isLive = !!(bibleVerse?.text || liveData?.section?.content || liveData?.media);

  return (
    <div className="fixed bottom-4 z-50" style={{ left: 'calc(320px + 1rem)' }}>
      <p className="text-[10px] text-muted-foreground mb-1 font-medium flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isLive ? 'bg-red-500 animate-pulse' : 'bg-muted-foreground/40'
          }`}
        />
        Live Preview
      </p>
      <div className="w-48 aspect-video bg-black rounded-lg border border-border/60 overflow-hidden relative flex items-center justify-center shadow-xl">
        {/* Background media */}
        {liveData?.media?.type === 'image' && liveData.media.url && (
          <img
            src={liveData.media.url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {liveData?.media?.type === 'video' && liveData.media.url && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={liveData.media.url}
          />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45" />
        {/* Text content — bible verse or lyric */}
        <p className="relative z-10 text-white text-[7px] font-bold text-center px-2 leading-snug drop-shadow whitespace-pre-wrap">
          {displayText}
        </p>
        {/* LIVE badge */}
        {isLive && (
          <div className="absolute top-1 left-1 bg-red-600 text-white text-[6px] font-bold px-1 py-0.5 rounded-sm tracking-wide">
            LIVE
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { presentations, loading: presentationsLoading } = usePresentations(user?.id || null);
  const { songs, loading: songsLoading } = useSongs(user?.id || null);
  const { media, loading: mediaLoading, mutate: refreshMedia } = useMedia(user?.id || null);
  const [selectedItem, setSelectedItem] = useState<{type: 'presentation' | 'song', id: string} | null>(null);
  const [liveSectionId, setLiveSectionId] = useState<string | null>(null);

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
        liveSectionId={liveSectionId}
        onSectionLive={setLiveSectionId}
      />

      {/* Right Panel */}
      <DashboardRightPanel
        user={user}
        presentations={presentations}
        media={media}
        mediaLoading={mediaLoading}
        onMediaRefresh={refreshMedia}
        onClearLyricsSuccess={() => setLiveSectionId(null)}
      />

      {/* Mini live preview — bottom-left of center area */}
      <LiveMiniPreview />
    </div>
  );
}
