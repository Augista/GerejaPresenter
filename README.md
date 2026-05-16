# ProPresenter - Modern Church Presentation Software

A comprehensive, next-generation presentation software for churches built with Next.js, designed for worship leaders, tech operators, and speakers.

## Features

### Core Presentation Tools
- **Multi-layer slide system** - Unlimited layers per slide with backgrounds, content, overlays, and masks
- **Unlimited slides & playlists** - Create presentations with multiple playlists for service planning
- **Drag-and-drop editing** - Intuitive interface for arranging elements on slides
- **Live editing during presentation** - Make changes without interrupting output
- **Slide reordering** - Reorder slides on-the-fly without stopping the presentation
- **Stage display** - Separate output for speakers with notes, timer, next slide preview

### Media Management
- **Support for images, video, and audio** - Upload and organize media files
- **Smart media library** - Organize media into bins with search and filter capabilities
- **Media playback controls** - Loop, trim, and set cue points for media files
- **Media preview** - Preview media before sending to the presentation
- **Auto-play** - Media can automatically play when slides appear

### Lyrics & Song Management
- **Song library** - Import and organize worship songs
- **Lyrics editor** - Add lyrics with verse, chorus, bridge, and other section types
- **Keyword-based search** - Search songs and lyrics by title, artist, or content
- **Word animation builder** - Create simple animations (fade, slide, scale) for individual words
- **Lyrics arrangement** - Organize lyrics by section with tagging support
- **Verse/Chorus markup** - Tag sections with V1, C, B, etc. for organization

### Advanced Features
- **Beat detection** - Automatically detect BPM and beats in audio files for sync'd transitions
- **Automatic slide transitions** - Slides advance automatically based on detected audio tempo
- **AI caption generation** - Generate Indonesian captions from live YouTube streams using Groq AI
- **Multi-display support** - Configure separate outputs for stage, audience, and presenter monitors
- **Bible integration** - Built-in Bible search and display (foundation for future expansion)
- **Translation support** - Switch between Indonesian and English throughout the app

### Themes & Design
- **Theme editor** - Customize colors, fonts, and styles
- **Slide templates** - Create reusable slide layouts
- **Dynamic text positioning** - Position text anywhere on slides with visual editing
- **Color presets** - Pre-defined color schemes for quick styling
- **Lower thirds & graphics** - Template-based broadcast-style graphics

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL) for data & auth
- **AI/ML**: Groq SDK for caption generation, wavesurfer.js for beat detection
- **State Management**: React hooks + SWR for caching
- **Animation**: Framer Motion for smooth transitions

## Installation

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account (for database and auth)
- Groq API key (for AI captions)

### Setup

1. **Clone and install**
   ```bash
   git clone <repository>
   cd propresenter
   pnpm install
   ```

2. **Set up Supabase**
   - Create a new project at supabase.com
   - Get your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Run migrations (schema creation scripts provided in `db/migrations`)

3. **Environment variables**
   Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```
   Visit http://localhost:3000

## Project Structure

```
propresenter/
├── app/                          # Next.js pages
│   ├── page.tsx                  # Home (presentations list)
│   ├── auth/                     # Authentication pages
│   ├── presentations/[id]/       # Presentation editor
│   ├── songs/                    # Lyrics management
│   ├── media/                    # Media library
│   └── settings/                 # User settings
├── components/
│   ├── editor/                   # Presentation editor components
│   │   ├── presentation-editor.tsx
│   │   ├── slide-canvas.tsx
│   │   ├── layer-renderer.tsx
│   │   └── properties-panel.tsx
│   ├── lyrics/                   # Song & lyrics components
│   │   ├── song-editor.tsx
│   │   ├── lyric-section.tsx
│   │   └── lyric-animation-builder.tsx
│   ├── media/                    # Media library
│   │   └── media-library.tsx
│   ├── features/                 # Advanced features
│   │   ├── beat-detection.ts
│   │   ├── ai-captions.tsx
│   │   └── stage-display.tsx
│   ├── presentations/            # Presentation components
│   │   └── presentation-grid.tsx
│   └── ui/                       # Shadcn components
├── lib/
│   ├── supabase.ts              # Supabase client & queries
│   └── beat-detection.ts        # Beat detection algorithms
├── types/
│   └── database.ts              # TypeScript type definitions
└── README.md                     # This file
```

## Core Features Explained

### Multi-Layer Slide System
Each slide can contain multiple layers:
- **Background**: Images, videos, or solid colors
- **Content**: Text, lyrics, Bible verses, or media
- **Overlay**: Graphics, lower thirds, or additional elements
- **Mask**: Alpha channel/transparency masks

Layers support:
- Opacity and blend modes
- Transform (position, scale, rotation)
- Z-order management
- Visibility toggling

### Presentation Editor
The main editor provides:
- **Slide panel** (left): List of slides with drag-to-reorder
- **Canvas** (center): Visual slide editing with layer rendering
- **Properties panel** (right): Edit selected layer properties

### Beat Detection
Analyzes audio files to:
1. Calculate BPM (80-200 range)
2. Detect individual beats/onsets
3. Provide confidence score
4. Enable automatic slide transitions synced to music

### AI Captions (Indonesian)
- Uses Groq's Whisper model for transcription
- Records live audio from YouTube streams
- Generates captions in Indonesian language
- Exports as SRT format for video players

### Stage Display
Separate fullscreen display for speakers showing:
- Current slide content
- Next slide preview
- Presentation timer
- Countdown timer
- Current time
- Speaker notes
- Configurable display elements

## API Routes

The app uses Supabase for all data operations via client-side queries. No custom API routes are needed.

### Database Tables
- `presentations` - User presentations
- `slides` - Slides within presentations
- `slide_layers` - Layers within slides
- `media` - Uploaded media files
- `songs` - Song library
- `lyrics` - Lyrics for songs
- `lyric_animations` - Word animations for lyrics
- `themes` - Custom themes
- `stage_display_configs` - Stage display settings
- `beat_detection` - Cached beat analysis results
- `youtube_captions` - Generated captions
- `translation_settings` - User language preferences

## Authentication

Uses Supabase Auth with email/password:
- Sign up: `/auth/signup`
- Sign in: `/auth/login`
- Auto-login on return visit
- Logout from settings page

All user data is scoped to their user ID in the database.

## Multi-Display Support

ProPresenter can manage multiple displays:
1. **Presenter View** - Full editor with all tools
2. **Stage Display** - For musicians/speakers with notes and timers
3. **Audience Display** - Main presentation output
4. **Confidence Monitor** - Extended notes for speakers

Stage display is a separate fullscreen route designed for extended monitors or projectors.

## Customization

### Changing Colors
Edit the color variables in `app/globals.css`:
```css
:root {
  --primary: oklch(0.45 0.19 240);      /* Blue */
  --accent: oklch(0.55 0.18 160);       /* Teal */
  /* ... more colors */
}
```

### Adding Slide Templates
Create new templates in the theme editor, store in `themes` table.

### Extending Animations
Add new animation types in `LyricAnimationBuilder`:
```typescript
const ANIMATION_TYPES = ['fade', 'slide', 'scale', 'bounce', 'spin'];
```

## Performance Optimization

- Lazy-loaded components with Next.js dynamic imports
- SWR for data fetching with caching
- Optimized image loading from Supabase storage
- Minimal re-renders with React hooks
- CSS animations for smooth transitions

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires modern audio/media APIs

## Limitations & Future Work

- Beat detection works best with clear, rhythmic audio
- AI captions currently support Indonesian only
- Multi-display requires web browser tabs/windows (no native window management API yet)
- Bible integration is foundational, needs translation data

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# AI/ML
NEXT_PUBLIC_GROQ_API_KEY=gsk_...
```

## Database Migrations

To set up Supabase:

1. Create the tables (SQL provided below)
2. Enable RLS (Row Level Security)
3. Set up auth policies

See `db/migrations` directory for full SQL schema.

## Contributing

This is a comprehensive presentation software. To contribute:
1. Fork the repository
2. Create a feature branch
3. Make changes following the existing code style
4. Submit a pull request

## License

MIT - Feel free to use for church presentations!

## Support

For issues or questions:
- Check the documentation
- Review database schema in `types/database.ts`
- Inspect component props for usage examples
- Enable debug logging with `console.log(" ...")`

---

**ProPresenter** - Built for churches, by developers who understand worship technology.
