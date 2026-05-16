# Supabase Setup Guide

## Prerequisites

- Supabase account (create one at https://app.supabase.com)
- This Next.js ProPresenter app
- Node.js 18+ and pnpm

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: ProPresenter
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
4. Click **Create new project** and wait for initialization (2-3 minutes)

## Step 2: Get Your Credentials

Once your project is created:

1. Go to **Settings → API**
2. You'll see:
   - **Project URL** → Copy this for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → Copy this for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → Copy this for `SUPABASE_SERVICE_ROLE_KEY`
   - **JWT Secret** → Copy this for `SUPABASE_JWT_SECRET`

3. For PostgreSQL connection info, go to **Settings → Database**:
   - **Host** → `POSTGRES_HOST`
   - **User** → `POSTGRES_USER` (usually `postgres`)
   - **Password** → The password you created in Step 1
   - **Database** → `POSTGRES_DATABASE` (usually `postgres`)
   - **Connection string** → `POSTGRES_URL`

## Step 3: Update .env.local

Open `.env.local` in your project and replace the placeholder values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key...
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...same-as-NEXT_PUBLIC...
SUPABASE_JWT_SECRET=your-jwt-secret

POSTGRES_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-db-password
POSTGRES_DATABASE=postgres
POSTGRES_HOST=db.supabase.co
```

## Step 4: Create Database Tables

Run the SQL migration script to create all necessary tables. In Supabase:

1. Go to **SQL Editor** → Click **New Query**
2. Copy and paste the migration SQL below
3. Click **Run**

### Database Migration SQL

```sql
-- Users & Authentication (Supabase Auth handles this, but we can add profile data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Presentations
CREATE TABLE IF NOT EXISTS presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slides
CREATE TABLE IF NOT EXISTS slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  duration INTEGER DEFAULT 0,
  transition_type TEXT DEFAULT 'fade',
  transition_duration INTEGER DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Layers (multi-layer system)
CREATE TABLE IF NOT EXISTS layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_id UUID NOT NULL REFERENCES slides(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'background', 'content', 'overlay', 'mask'
  order_index INTEGER NOT NULL,
  content JSONB, -- Stores text, colors, media references
  opacity FLOAT DEFAULT 1.0,
  blend_mode TEXT DEFAULT 'normal',
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Library
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'image', 'video', 'audio'
  url TEXT NOT NULL,
  file_size INTEGER,
  duration INTEGER, -- For video/audio in seconds
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs/Lyrics
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT,
  key TEXT,
  bpm INTEGER,
  lyrics TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lyric Sections (Verse, Chorus, etc)
CREATE TABLE IF NOT EXISTS lyric_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'verse', 'chorus', 'bridge', 'pre-chorus', 'outro', 'intro'
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lyric Animations
CREATE TABLE IF NOT EXISTS lyric_animations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lyric_section_id UUID NOT NULL REFERENCES lyric_sections(id) ON DELETE CASCADE,
  animation_type TEXT NOT NULL, -- 'fade', 'slide', 'scale'
  word_animation BOOLEAN DEFAULT FALSE,
  duration INTEGER DEFAULT 500,
  delay INTEGER DEFAULT 0,
  stagger FLOAT DEFAULT 0.1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Beat Detection Results
CREATE TABLE IF NOT EXISTS beat_detection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  bpm FLOAT NOT NULL,
  confidence FLOAT,
  beat_frames INTEGER[] NOT NULL,
  beat_times FLOAT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- YouTube Captions (AI Generated)
CREATE TABLE IF NOT EXISTS youtube_captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  youtube_url TEXT NOT NULL,
  raw_transcript TEXT,
  caption_text TEXT,
  srt_content TEXT,
  language TEXT DEFAULT 'id', -- Indonesian
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stage Display Configuration
CREATE TABLE IF NOT EXISTS stage_display_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  presentation_id UUID REFERENCES presentations(id) ON DELETE SET NULL,
  show_current_slide BOOLEAN DEFAULT TRUE,
  show_next_slide BOOLEAN DEFAULT TRUE,
  show_timer BOOLEAN DEFAULT TRUE,
  show_notes BOOLEAN DEFAULT TRUE,
  show_clock BOOLEAN DEFAULT TRUE,
  background_color TEXT DEFAULT '#f5f5f5',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Themes
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  colors JSONB, -- { primary, secondary, background, text }
  fonts JSONB, -- { heading, body }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_presentations_user ON presentations(user_id);
CREATE INDEX idx_slides_presentation ON slides(presentation_id);
CREATE INDEX idx_layers_slide ON layers(slide_id);
CREATE INDEX idx_media_user ON media(user_id);
CREATE INDEX idx_songs_user ON songs(user_id);
CREATE INDEX idx_lyric_sections_song ON lyric_sections(song_id);
CREATE INDEX idx_beat_detection_media ON beat_detection(media_id);
CREATE INDEX idx_youtube_captions_user ON youtube_captions(user_id);
CREATE INDEX idx_stage_display_user ON stage_display_config(user_id);
CREATE INDEX idx_themes_user ON themes(user_id);

-- Enable Row Level Security
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyric_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyric_animations ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_display_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies (users can only see their own data)
CREATE POLICY "Users can view their own presentations" ON presentations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presentations" ON presentations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentations" ON presentations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentations" ON presentations
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own media" ON media
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media" ON media
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media" ON media
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media" ON media
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own songs" ON songs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own songs" ON songs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own songs" ON songs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own songs" ON songs
  FOR DELETE USING (auth.uid() = user_id);
```

## Step 5: Set Up Storage Buckets

For media uploads (images, videos, audio):

1. Go to **Storage** in Supabase
2. Click **Create new bucket** and create these buckets:
   - `presentations` (for slide thumbnails)
   - `media` (for user media files - set to Public)
   - `captions` (for generated caption files)

3. Set permissions for the `media` bucket to allow uploads

## Step 6: Enable Authentication

1. Go to **Authentication → Providers**
2. Ensure **Email** is enabled (it's on by default)
3. Go to **Authentication → Email Templates** to customize if needed

## Step 7: Run the App

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev
```

The app will be available at `http://localhost:3000`

## Step 8: Test the Setup

1. **Sign Up**: Create a test account at `/auth/signup`
2. **Create Presentation**: Click "New Presentation" on the home page
3. **Edit Slides**: Add content and layers
4. **Upload Media**: Go to Media page and upload files
5. **Manage Songs**: Go to Songs page and create test songs

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` is in the project root
- All `NEXT_PUBLIC_*` variables must be set
- Restart `pnpm dev` after updating `.env.local`

### "Connection refused" or "Cannot reach Supabase"
- Verify your `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check if your Supabase project is running
- Ensure you're not behind a firewall blocking the connection

### "Auth error: Invalid JWT"
- Verify `SUPABASE_JWT_SECRET` is correct
- Check that Supabase auth is enabled

### Storage buckets not accessible
- Go to Storage → Set the bucket policy to "Public" if you want public access
- For private files, keep it private and use signed URLs

## Advanced: Additional Groq Setup (Optional)

For AI caption generation from YouTube:

1. Sign up at [https://console.groq.com](https://console.groq.com)
2. Create an API key
3. Add to `.env.local`:
   ```
   GROQ_API_KEY=your-groq-api-key
   ```

## Next Steps

- Customize your themes in the **Settings** page
- Import songs from CCLI or other sources
- Set up stage display for live events
- Configure beat detection for automatic transitions

For more information, see the main [README.md](./README.md) and [ARCHITECTURE.md](./ARCHITECTURE.md) files.
