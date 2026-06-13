import { NextResponse } from 'next/server';

export interface BibleLiveData {
  bookCode: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

// Persist on globalThis so HMR module reloads don't wipe the verse
const g = globalThis as any;
if (!('_churchBibleLive' in g)) g._churchBibleLive = null;

export async function GET() {
  return NextResponse.json(g._churchBibleLive);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    g._churchBibleLive = body as BibleLiveData;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}

export async function DELETE() {
  g._churchBibleLive = null;
  return NextResponse.json({ success: true });
}
