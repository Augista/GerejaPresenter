# ProPresenter Architecture & Design

## System Overview

ProPresenter is a modern presentation software designed with a client-centric architecture using Next.js 16 and Supabase. The app provides a complete presentation solution for churches with advanced features like multi-layer slides, lyrics management, beat detection, and AI captions.

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Web Application                   │
│                     (React 19 + TypeScript)                  │
└─────────────────────────────────────────────────────────────┘
           ↓              ↓              ↓              ↓
      ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌──────────┐
      │ Editor  │   │ Lyrics  │   │  Media  │   │ Settings │
      │ Pages   │   │  Pages  │   │  Pages  │   │  Pages   │
      └─────────┘   └─────────┘   └─────────┘   └──────────┘
           ↓              ↓              ↓              ↓
      ┌──────────────────────────────────────────────────────┐
      │              UI Components (shadcn/ui)               │
      └──────────────────────────────────────────────────────┘
           ↓
      ┌──────────────────────────────────────────────────────┐
      │              Utility Libraries                        │
      │   • Beat Detection (wavesurfer.js)                   │
      │   • AI Captions (groq-sdk)                           │
      │   • Animations (framer-motion)                       │
      └──────────────────────────────────────────────────────┘
           ↓
      ┌──────────────────────────────────────────────────────┐
      │              Supabase Client                         │
      │   (Authentication, Database, Storage)                │
      └──────────────────────────────────────────────────────┘
           ↓
      ┌──────────────────────────────────────────────────────┐
      │              Supabase Backend                        │
      │   PostgreSQL | Auth | Storage | Realtime            │
      └──────────────────────────────────────────────────────┘
```

## Data Model

### Core Entities

```
User (via Supabase Auth)
  ├── Presentations (user_id)
  │   ├── Slides (presentation_id)
  │   │   ├── SlideLayer (slide_id)
  │   │   │   └── content (polymorphic: text, image, video, lyrics, etc.)
  │   │   ├── Transition settings
  │   │   └── BeatDetection
  │   ├── StageDisplayConfig
  │   └── Theme
  ├── Songs (user_id)
  │   └── Lyrics (song_id)
  │       └── LyricAnimation
  ├── Media (user_id)
  │   └── MediaBin
  ├── Themes (user_id)
  │   └── Templates
  └── TranslationSettings
```

### Polymorphic Content System

Slide layers use a polymorphic content model:

```typescript
LayerContent = {
  type: 'text' | 'image' | 'video' | 'lyrics' | 'bible' | 'graphic' | 'shape',
  data: Record<string, any>  // Shape depends on type
}
```

Example implementations:
- Text: `{ type: 'text', data: { text: 'Hello', fontSize: 24 } }`
- Lyrics: `{ type: 'lyrics', data: { lyricId: '...', songId: '...' } }`
- Bible: `{ type: 'bible', data: { verse: 'John 3:16', translation: 'KJV' } }`

## Component Architecture

### Page Components (Route Handlers)

```
app/
├── page.tsx                    # Home - Presentation list & navigation
├── auth/
│   ├── login/page.tsx         # Authentication
│   └── signup/page.tsx
├── presentations/
│   ├── new/page.tsx           # Create presentation
│   └── [id]/editor/page.tsx   # Main presentation editor
├── songs/page.tsx             # Song/lyrics management
├── media/page.tsx             # Media library
└── settings/page.tsx          # User settings & AI features
```

### Reusable Components

**Editor Components** (`components/editor/`)
- `presentation-editor.tsx` - Main editor container, coordinates sub-components
- `slides-panel.tsx` - Left sidebar with slide list, drag-to-reorder
- `slide-canvas.tsx` - Center canvas with layer rendering
- `layer-renderer.tsx` - Individual layer visualization and interaction
- `properties-panel.tsx` - Right sidebar for property editing

**Lyrics Components** (`components/lyrics/`)
- `song-editor.tsx` - Song metadata and lyrics sections
- `lyric-section.tsx` - Individual lyric verse/chorus with expandable editor
- `lyric-animation-builder.tsx` - Word-by-word animation builder (fade/slide/scale)

**Media Components** (`components/media/`)
- `media-library.tsx` - Upload, browse, and manage media files

**Feature Components** (`components/features/`)
- `stage-display.tsx` - Fullscreen speaker monitor with notes and timers
- `ai-captions.tsx` - AI caption generation from audio/streams
- `beat-detection.tsx` - (utility module) Beat analysis algorithms

**Presentation Components** (`components/presentations/`)
- `presentation-grid.tsx` - Grid view of presentations with actions

### UI Components

All UI components come from shadcn/ui:
- Button, Input, Card, Select, Slider, Dialog
- Tabs, Accordion, etc.

Located in `components/ui/` (pre-installed with starter template).

## Data Flow

### Creating a Presentation

```
User clicks "New Presentation"
  ↓
/presentations/new page opens
  ↓
Form submission with title/description
  ↓
Supabase insert into presentations table
  ↓
Redirect to /presentations/[id]/editor
  ↓
Load presentation + initial slides
  ↓
Render PresentationEditor with SlideCanvas
```

### Editing a Slide

```
User clicks slide in left panel
  ↓
selectedSlideId state updates
  ↓
SlideCanvas loads layers for selected slide
  ↓
LayerRenderer displays each layer with borders
  ↓
User clicks layer
  ↓
selectedLayerId state updates
  ↓
PropertiesPanel loads layer data
  ↓
User edits properties
  ↓
Supabase update to slide_layers
  ↓
Component re-renders with new state
```

### Searching Lyrics

```
User types in search box (Songs page)
  ↓
searchQuery state updates
  ↓
useMemo filters songs by title/artist
  ↓
Display filtered results
  ↓
User clicks song
  ↓
Load song + lyrics from database
  ↓
SongEditor displays lyrics sections
```

## State Management

### Client-Side State

Uses React hooks + Supabase for state:

```typescript
// Local UI state
const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState('');

// Data fetching
const { data: slides, error, mutate } = useSWR(
  [`slides`, presentationId],
  () => getSlides(presentationId)
);

// Forms with react-hook-form
const { register, handleSubmit, watch } = useForm();
```

### Database as State

Supabase acts as the source of truth:
- All data persists to PostgreSQL
- Real-time subscriptions can be added
- Authentication scoped to user_id
- RLS (Row Level Security) enforces privacy

## Database Schema

### Key Tables

**presentations**
```sql
id, user_id, title, description, created_at, updated_at
```

**slides**
```sql
id, presentation_id, order, title, duration, 
transition (JSON), beat_detection_enabled, created_at, updated_at
```

**slide_layers**
```sql
id, slide_id, type, order, visible, opacity, blend_mode,
transform (JSON), content (JSON), created_at, updated_at
```

**songs**
```sql
id, user_id, title, artist, ccli_number, metadata (JSON)
```

**lyrics**
```sql
id, song_id, content, order, section_type, tags (array),
embeddings (vector - for future semantic search)
```

**lyric_animations**
```sql
id, lyric_id, word_index, animation_type, duration, delay, direction
```

**media**
```sql
id, user_id, title, file_path, type, file_size, uploaded_at
```

**stage_display_configs**
```sql
id, presentation_id, show_current_slide, show_next_slide, 
show_timer, show_notes, show_clock, countdown_duration
```

**beat_detection**
```sql
id, slide_id, audio_path, bpm, beats (array), confidence
```

## Advanced Features Deep Dive

### Beat Detection Algorithm

Located in `lib/beat-detection.ts`:

1. **Audio Analysis**
   - Load audio file with wavesurfer.js
   - Extract raw audio buffer
   - Apply windowing (2048-sample frames)

2. **Energy Calculation**
   - Compute energy (sum of squared samples) for each frame
   - Normalize to 0-1 range
   - Create energy envelope

3. **Onset Detection**
   - Calculate energy flux (difference between frames)
   - Detect peaks above threshold
   - Get onset times in seconds

4. **BPM Estimation**
   - Test BPM range (80-200)
   - Score each BPM by alignment with inter-onset intervals
   - Return best match with confidence

5. **Beat Finding**
   - Start from first onset
   - Generate beats at detected BPM interval
   - Snap to nearby onsets
   - Return beat times in milliseconds

### AI Caption Generation (Indonesian)

Located in `components/features/ai-captions.tsx`:

1. **Audio Capture**
   - Use MediaRecorder API to record audio
   - Support for system audio via display media

2. **Transcription**
   - Send audio blob to Groq Whisper API
   - Specify language: Indonesian (id)
   - Get back transcribed text

3. **Caption Storage**
   - Save to youtube_captions table
   - Track timestamp and language
   - Enable export as SRT format

4. **UI Feedback**
   - Show recording indicator
   - Display processing status
   - List generated captions with timestamps

### Word Animation Builder

Located in `components/lyrics/lyric-animation-builder.tsx`:

1. **Word Selection**
   - Split lyric content by spaces
   - Click individual words to select
   - Highlight selected word

2. **Animation Configuration**
   - Choose type: fade, slide, or scale
   - Set duration (100-2000ms)
   - Set delay for staggered effect
   - Optional: direction (up/down/left/right)

3. **Database Storage**
   - Save to lyric_animations table
   - Track word index (not word itself)
   - Store animation parameters

4. **Playback**
   - Apply CSS animations or framer-motion
   - Stagger with delay values
   - Preview mode to test

## Authentication & Security

### Supabase Auth

- Email/password authentication
- User sessions via JWT tokens
- Automatic token refresh
- HTTP-only cookies in production

### Row Level Security (RLS)

Database policies ensure users can only access their own data:

```sql
-- Example: Only user can see their presentations
CREATE POLICY "Users can view own presentations"
  ON presentations FOR SELECT
  USING (auth.uid() = user_id);
```

### Client-Side Security

- Never store passwords
- Validate input on form submission
- Use parameterized queries (via Supabase client)
- CORS headers managed by Supabase

## Performance Optimization

### Frontend

1. **Code Splitting**
   - Dynamic imports for editor components
   - Route-based splitting with Next.js

2. **Caching**
   - SWR for data fetching with stale-while-revalidate
   - Media library caches thumbnail URLs

3. **Rendering**
   - Memoized components with React.memo
   - useCallback for stable function refs
   - Avoid unnecessary re-renders

4. **Assets**
   - Supabase storage for media files
   - CDN-backed image optimization
   - Lazy-load heavy components

### Database

1. **Query Optimization**
   - Selective `select()` to avoid fetching everything
   - `order()` at database level
   - Composite indexes on common filters

2. **Caching**
   - Supabase caches frequent queries
   - Client-side SWR cache
   - Media file URL caching

## Extensibility

### Adding New Layer Types

1. Update `LayerContent` in `types/database.ts`
2. Add case in `LayerRenderer` component
3. Create settings UI in `PropertiesPanel`
4. Store/retrieve from database

### Adding New Animations

1. Add to `ANIMATION_TYPES` in `LyricAnimationBuilder`
2. Update database schema if needed (new fields)
3. Implement CSS/framer-motion animations
4. Update animation builder UI

### Adding New AI Features

1. Create component in `components/features/`
2. Use appropriate AI service (Groq, fal, etc.)
3. Store results in database
4. Add settings UI in settings page

## Testing & Debugging

### Enable Debug Logging

```typescript
console.log(" Debug message:", data);
```

Look for these in browser console to trace execution.

### Common Debugging Scenarios

**Slide not updating:**
1. Check selectedSlideId state
2. Verify slide ID exists in database
3. Inspect network tab for failed requests

**Media not showing:**
1. Verify file uploaded to storage
2. Check storage bucket permissions
3. Inspect image URL in network tab

**Animations not playing:**
1. Check animation record exists
2. Verify animation_type is valid
3. Inspect CSS/framer-motion in dev tools

## Deployment

### Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_GROQ_API_KEY
```

### Vercel Deployment

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy automatically

### Self-Hosting

Requirements:
- Node.js 18+
- Supabase backend
- Optional: Groq API for AI features

Deploy with:
```bash
pnpm build
pnpm start
```

## Future Roadmap

- WebSocket real-time collaboration
- Native desktop app (Electron/Tauri)
- Video background blur/effects
- Custom animation builder
- Advanced media effects (chroma key, etc.)
- Hardware control (MIDI/OSC)
- NDI/SDI output support
- Live statistics dashboard
- Community template library

---

For implementation details, see:
- Database types: `types/database.ts`
- API helpers: `lib/supabase.ts`
- Component examples: `components/` directory
- Utility modules: `lib/` directory
