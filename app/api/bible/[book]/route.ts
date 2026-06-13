import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { parseRTFBible, BibleBook } from '@/lib/utils/bible-parser';

const cache = new Map<string, BibleBook>();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ book: string }> }
) {
  const { book } = await params;
  const code = book.toUpperCase();

  if (cache.has(code)) {
    return NextResponse.json(cache.get(code));
  }

  try {
    const filePath = path.join(process.cwd(), 'app', 'bibledata', `${code}.rtf`);
    const content = await readFile(filePath, 'latin1');
    const parsed = parseRTFBible(content);

    cache.set(code, parsed);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }
}
