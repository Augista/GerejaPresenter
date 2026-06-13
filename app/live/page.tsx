'use client';

import {
  useEffect,
  useState,
} from 'react';

import { Media } from '@/types/database';
import type { BibleLiveData } from '@/app/api/bible-live/route';

export default function LivePage() {
  const [section, setSection] = useState<any>(null);
  const [liveMedia, setLiveMedia] = useState<Media | null>(null);
  const [bibleVerse, setBibleVerse] = useState<BibleLiveData | null>(null);

  // =====================================================
  // POLLING
  // =====================================================

  useEffect(() => {
    async function poll() {
      try {
        const [sessionRes, bibleRes] = await Promise.all([
          fetch('/api/live-session'),
          fetch('/api/bible-live'),
        ]);

        const sessionData = await sessionRes.json();
        setSection(sessionData.section || null);
        setLiveMedia(sessionData.media || null);

        const bibleData = await bibleRes.json();
        setBibleVerse(bibleData || null);
      } catch (err) {
        console.error(err);
      }
    }

    poll();
    const interval = setInterval(poll, 3000);
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
      {/* CONTENT (LYRICS or BIBLE VERSE) */}
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

          {bibleVerse ? (
            <>
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
                {bibleVerse.text}
              </p>
              <p
                className="
                  text-white/70
                  font-semibold
                  text-base
                  sm:text-xl
                  md:text-2xl
                  mt-6
                  drop-shadow-[0_2px_10px_rgba(0,0,0,1)]
                  tracking-wide
                "
              >
                {bibleVerse.reference}
              </p>
            </>
          ) : (
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
              {section?.content || ' '}
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
