export interface BibleVerse {
  verse: number;
  text: string;
}

export interface BibleChapter {
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleBook {
  bookName: string;
  chapters: BibleChapter[];
}

function cleanRTFText(raw: string): string {
  return raw
    .replace(/\\u(\d+)\?/g, (_, n) => String.fromCharCode(+n))
    .replace(/\\pard?\\plain\\hyphpar/g, ' ')
    .replace(/\\par\b/g, ' ')
    .replace(/\\[a-zA-Z]+\d*[ \t]?/g, '')
    .replace(/[{}]/g, '')
    .replace(/\*/g, '')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseRTFBible(content: string): BibleBook {
  const pageBlocks = content.split(/\{\s*\\page\s*\}/);

  const chapters: BibleChapter[] = [];
  let bookName = '';

  for (const block of pageBlocks) {
    // Chapter headers live inside {\s2 ...} style blocks
    const headerMatch = block.match(/\{\\s2[\s\S]*?\{\\b\s*[\r\n]+(.+?)\s+(\d+)\\par/);
    if (!headerMatch) continue;

    if (!bookName) bookName = headerMatch[1].trim();
    const chapterNum = parseInt(headerMatch[2]);

    // Verse markers: {\b\n<number>}
    const verseMarkers = Array.from(block.matchAll(/\{\\b\s*[\r\n]+(\d+)\}/g));
    if (verseMarkers.length === 0) continue;

    const verses: BibleVerse[] = [];

    for (let i = 0; i < verseMarkers.length; i++) {
      const m = verseMarkers[i];
      const verseNum = parseInt(m[1]);
      const start = (m.index ?? 0) + m[0].length;
      const end =
        i + 1 < verseMarkers.length
          ? (verseMarkers[i + 1].index ?? block.length)
          : block.length;

      const text = cleanRTFText(block.slice(start, end));
      if (text) verses.push({ verse: verseNum, text });
    }

    if (verses.length > 0) {
      chapters.push({ chapter: chapterNum, verses });
    }
  }

  return { bookName: bookName || 'Unknown', chapters };
}
