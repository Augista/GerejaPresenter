'use client';

import {
  useEffect,
  useState,
} from 'react';

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Media } from '@/types/database';

export default function LivePage() {
  const [section, setSection] = useState<any>(null);
  const [supabase, setSupabase] =
    useState<SupabaseClient | null>(null);

  const [liveMedia, setLiveMedia] =
    useState<Media | null>(null);

  // =====================================================
  // INIT
  // =====================================================

  useEffect(() => {
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) return;

    setSupabase(createClient(url, key));
  }, []);

  // =====================================================
  // LOAD LIVE SESSION
  // =====================================================

  // async function loadCurrent() {
  //   try {
  //     const res = await fetch('/api/live-session');

  //     if (!res.ok) return;

  //     const data = await res.json();

  //     setSection(data.section || null);
  //     setLiveMedia(data.media || null);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }
  async function loadCurrent() {
  try {
    const res = await fetch('/api/live-session');

    const data = await res.json();

    console.log('LIVE DATA:', data);

    setSection(data.section || null);
    setLiveMedia(data.media || null);
  } catch (err) {
    console.error(err);
  }
}

  // =====================================================
  // POLLING
  // =====================================================

  useEffect(() => {
    loadCurrent();

    const interval = setInterval(() => {
      loadCurrent();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">

      {/* ================================================= */}
      {/* SECTION BACKGROUND (LOWEST LAYER) */}
      {/* ================================================= */}

      {section?.background_type === 'image' &&
        section?.background_url && (
          <img
            src={section.background_url}
            alt="Background"
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
              z-0
            "
          />
        )}

      {section?.background_type === 'video' &&
        section?.background_url && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
              z-0
            "
          >
            <source
              src={section.background_url}
            />
          </video>
        )}

      {/* ================================================= */}
      {/* LIVE MEDIA (ABOVE BACKGROUND) */}
      {/* ================================================= */}

      {liveMedia?.type === 'image' && (
        <img
          src={liveMedia.url}
          alt={liveMedia.name}
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            z-10
          "
        />
      )}

      {liveMedia?.type === 'video' && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            z-10
          "
        >
          <source src={liveMedia.url} />
        </video>
      )}

      {/* ================================================= */}
      {/* DARK OVERLAY */}
      {/* ================================================= */}

      <div
        className="
          absolute
          inset-0
          bg-black/45
          z-20
        "
      />

      {/* ================================================= */}
      {/* LYRICS */}
      {/* ================================================= */}

      <div
        className="
          relative
          z-30
          flex
          items-center
          justify-center
          w-full
          h-full
          p-20
        "
      >
        <div className="max-w-6xl text-center">

          <p
            className="
              text-white
              font-black
              text-6xl
              md:text-7xl
              leading-tight
              whitespace-pre-wrap
              drop-shadow-[0_4px_30px_rgba(0,0,0,1)]
            "
          >
            {section?.content || 'No Live Lyric'}
          </p>

        </div>
      </div>
    </div>
  );
}