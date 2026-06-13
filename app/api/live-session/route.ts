import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase server environment variables'
    );
  }

  return createClient(url, key);
}

// =====================================================
// GET LIVE SESSION
// =====================================================

export async function GET() {
  try {
    const supabase = getServerSupabase();

    // GET ACTIVE SESSION + MEDIA RELATION
    const {
      data: liveSession,
      error: sessionError,
    } = await supabase
      .from('live_sessions')
      .select(`
        *,
        media (*)
      `)
      .eq('is_live', true)
      .limit(1)
      .maybeSingle();

    if (sessionError) {
      console.error(
        'Live session fetch error:',
        sessionError
      );

      return NextResponse.json(
        {
          error:
            sessionError.message ||
            'Failed to fetch live session',
        },
        { status: 500 }
      );
    }

    // NO SESSION
    if (!liveSession) {
      return NextResponse.json({
        liveSession: null,
        section: null,
        media: null,
      });
    }

    // GET SECTION
    const {
      data: section,
      error: sectionError,
    } = await supabase
      .from('lyric_sections')
      .select('*')
      .eq(
        'id',
        liveSession.current_section_id
      )
      .maybeSingle();

    if (sectionError) {
      console.error(
        'Lyric section fetch error:',
        sectionError
      );

      return NextResponse.json(
        {
          error:
            sectionError.message ||
            'Failed to fetch lyric section',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      liveSession,
      section,
      media: liveSession.media || null,
    });
  } catch (error: any) {
    console.error(
      'Live session GET error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          'Unexpected error',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// START / UPDATE LIVE SESSION
// =====================================================

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const {
      user_id,
      current_song_id,
      current_section_id,
    } = body;

    if (
      !user_id ||
      !current_song_id ||
      !current_section_id
    ) {
      return NextResponse.json(
        {
          error:
            'user_id, current_song_id, and current_section_id are required',
        },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    const payload = {
      user_id,
      current_song_id,
      current_section_id,
      is_live: true,
    };

    // UPDATE EXISTING
    const {
      data: updatedRows,
      error: updateError,
    } = await supabase
      .from('live_sessions')
      .update(payload)
      .eq('user_id', user_id)
      .select();

    if (updateError) {
      console.error(
        'Live session update error:',
        updateError
      );

      return NextResponse.json(
        {
          error:
            updateError.message ||
            'Failed to update live session',
        },
        { status: 500 }
      );
    }

    // INSERT NEW IF NONE UPDATED
    if (
      !updatedRows ||
      updatedRows.length === 0
    ) {
      const { error: insertError } =
        await supabase
          .from('live_sessions')
          .insert([payload]);

      if (insertError) {
        console.error(
          'Live session insert error:',
          insertError
        );

        return NextResponse.json(
          {
            error:
              insertError.message ||
              'Failed to create live session',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error(
      'Live session POST error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          'Unexpected error',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// CLEAR LYRICS (PATCH)
// =====================================================

export async function PATCH() {
  try {
    const supabase = getServerSupabase();

    const { data: liveSession, error: sessionError } = await supabase
      .from('live_sessions')
      .select('id')
      .eq('is_live', true)
      .limit(1)
      .maybeSingle();

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    if (!liveSession) {
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase
      .from('live_sessions')
      .update({ current_section_id: null, current_song_id: null })
      .eq('id', liveSession.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unexpected error' }, { status: 500 });
  }
}

// =====================================================
// UPDATE LIVE MEDIA
// =====================================================

export async function PUT(
  request: Request
) {
  try {
    const body = await request.json();

    const { media_id } = body;

    const supabase = getServerSupabase();

    // GET ACTIVE SESSION
    const {
      data: liveSession,
      error: sessionError,
    } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('is_live', true)
      .limit(1)
      .maybeSingle();

    if (sessionError) {
      console.error(sessionError);

      return NextResponse.json(
        {
          error: sessionError.message,
        },
        { status: 500 }
      );
    }

    // NO ACTIVE SESSION
    if (!liveSession) {
      // If clearing, nothing to do — treat as success
      if (media_id === null) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json(
        {
          error:
            'No active live session. Start presentation first.',
        },
        { status: 400 }
      );
    }

    // UPDATE MEDIA
    const { error: updateError } =
      await supabase
        .from('live_sessions')
        .update({
          media_id,
        })
        .eq('id', liveSession.id);

    if (updateError) {
      console.error(updateError);

      return NextResponse.json(
        {
          error:
            updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error(
      'Live session PUT error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          'Unexpected error',
      },
      { status: 500 }
    );
  }
}