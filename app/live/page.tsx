'use client';

import {
  useEffect,
  useState,
} from 'react';

import { Media } from '@/types/database';

export default function LivePage() {
  const [section, setSection] = useState<any>(null);

  const [liveMedia, setLiveMedia] =
    useState<Media | null>(null);

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
          p-6
          sm:p-12
          md:p-20
        "
      >
        <div className="max-w-6xl w-full text-center">

          <p
            className="
              text-white
              font-black
              text-2xl
              sm:text-4xl
              md:text-6xl
              lg:text-7xl
              leading-snug
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