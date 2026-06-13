import { NextResponse } from 'next/server';

export interface BibleLiveData {
  bookCode: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

// Module-level state — works for single-instance deployments (standard church setup)
let liveVerse: BibleLiveData | null = null;

export async function GET() {
  return NextResponse.json(liveVerse);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    liveVerse = body as BibleLiveData;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}

export async function DELETE() {
  liveVerse = null;
  return NextResponse.json({ success: true });
}
