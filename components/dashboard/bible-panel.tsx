'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Square, BookOpen } from 'lucide-react';
import type { BibleBook } from '@/lib/utils/bible-parser';

interface Book {
  code: string;
  name: string;
}

export function BiblePanel() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>('JHN');
  const [bookData, setBookData] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [liveKey, setLiveKey] = useState<string | null>(null);
  const [loadingBook, setLoadingBook] = useState(false);

  useEffect(() => {
    fetch('/api/bible')
      .then((r) => r.json())
      .then(setBooks)
      .catch(console.error);
  }, []);

  const loadBook = useCallback(async (code: string) => {
    setLoadingBook(true);
    setBookData(null);
    setSelectedChapter(1);
    try {
      const res = await fetch(`/api/bible/${code}`);
      const data: BibleBook = await res.json();
      setBookData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBook(false);
    }
  }, []);

  useEffect(() => {
    loadBook(selectedBook);
  }, [selectedBook, loadBook]);

  const bookName =
    books.find((b) => b.code === selectedBook)?.name ?? selectedBook;

  const currentChapterData = bookData?.chapters.find(
    (ch) => ch.chapter === selectedChapter
  );

  const handleLive = async (verseNum: number, text: string) => {
    const key = `${selectedBook}-${selectedChapter}-${verseNum}`;

    if (liveKey === key) {
      await fetch('/api/bible-live', { method: 'DELETE' });
      setLiveKey(null);
      return;
    }

    const reference = `${bookName} ${selectedChapter}:${verseNum}`;
    await fetch('/api/bible-live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookCode: selectedBook,
        bookName,
        chapter: selectedChapter,
        verse: verseNum,
        text,
        reference,
      }),
    });
    setLiveKey(key);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Book selector */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Kitab
          </span>
        </div>
        <select
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
          className="w-full text-sm rounded-md border border-border bg-background px-2 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {books.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chapter navigation */}
      {bookData && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Pasal
          </p>
          <div className="flex flex-wrap gap-1">
            {bookData.chapters.map((ch) => (
              <button
                key={ch.chapter}
                onClick={() => setSelectedChapter(ch.chapter)}
                className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                  selectedChapter === ch.chapter
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {ch.chapter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Verse list */}
      <div>
        {loadingBook ? (
          <p className="text-xs text-muted-foreground text-center py-6">Memuat...</p>
        ) : !currentChapterData ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            Pilih kitab dan pasal
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Ayat — {bookName} {selectedChapter}
            </p>
            {currentChapterData.verses.map((v) => {
              const key = `${selectedBook}-${selectedChapter}-${v.verse}`;
              const isLive = liveKey === key;
              return (
                <div
                  key={v.verse}
                  className={`flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors group ${
                    isLive
                      ? 'bg-red-500/15 border border-red-500/50'
                      : 'hover:bg-muted border border-transparent'
                  }`}
                  onClick={() => handleLive(v.verse, v.text)}
                >
                  <span
                    className={`text-xs font-bold w-5 shrink-0 mt-0.5 ${
                      isLive ? 'text-red-500' : 'text-primary'
                    }`}
                  >
                    {v.verse}
                  </span>
                  <span className="text-xs flex-1 leading-relaxed line-clamp-3 text-foreground">
                    {v.text}
                  </span>
                  <button
                    className={`shrink-0 mt-0.5 transition-colors ${
                      isLive
                        ? 'text-red-500'
                        : 'text-muted-foreground group-hover:text-primary'
                    }`}
                    title={isLive ? 'Stop' : 'Live'}
                  >
                    {isLive ? (
                      <Square className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
