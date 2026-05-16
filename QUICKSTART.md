# ProPresenter Quick Start Guide

## Getting Started in 5 Minutes

### 1. **Initial Setup**
```bash
# Install dependencies
pnpm install

# Set up environment variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_GROQ_API_KEY=your_groq_key

# Start dev server
pnpm dev
```

### 2. **Create Account**
- Visit http://localhost:3000
- Click "Get Started"
- Sign up with email/password
- You're logged in!

### 3. **Create First Presentation**
1. Click "New Presentation"
2. Enter title (e.g., "Sunday Service - May 15")
3. Add optional description
4. Click "Create Presentation"

### 4. **Build Your First Slide**
In the presentation editor:
- **Left panel**: See all slides
- **Center**: Drag slide to zoom
- **Right panel**: Edit selected layer properties

Click "Add Slide" to create new slides, then "Add Layer" to add content:
- **Background**: Images or solid colors
- **Content**: Text, lyrics, or Bible verses
- **Overlay**: Graphics and lower thirds

### 5. **Add Lyrics**
1. Go to "Songs" from main menu
2. Click "New Song"
3. Enter title and artist
4. Add lyric sections (Verse 1, Chorus, etc.)
5. Use "Word Animation Builder" to animate individual words (fade, slide, scale)

### 6. **Add Media**
1. Go to "Media" from main menu
2. Drag/upload images, videos, audio files
3. Organize into collections
4. Use in slides by adding media layers

### 7. **Stage Display (For Presenters)**
1. In presentation editor: "Preview" → "Stage Display"
2. Shows:
   - Current slide
   - Next slide
   - Timer (elapsed time)
   - Speaker notes
   - Current time
3. Open in separate window/monitor for stage setup

### 8. **Live Captions (Indonesian)**
1. Go to "Settings"
2. Under "AI Features":
   - Click "Start Recording"
   - Speak/play audio from YouTube stream
   - AI generates Indonesian captions automatically
   - Export as SRT file

### 9. **Automatic Beat Sync**
1. Upload audio file to media library
2. In slide properties: Enable "Beat Detection"
3. System analyzes BPM and detects beats
4. Slides automatically advance to music tempo

### 10. **Save & Present**
- All changes auto-save to Supabase
- Click "Preview" in editor to present
- Use stage display for speaker notes
- Switch between slides with arrow keys or manual selection

## Key Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Add Slide | Shift + A |
| Delete Layer | Delete |
| Next Slide | → or Space |
| Previous Slide | ← |
| Fullscreen Preview | F |
| Stage Display | Shift + S |

## Common Tasks

### Animate Lyrics Word-by-Word
1. Go to Songs page
2. Select song
3. Expand lyric section
4. Click "Word Animation Builder"
5. Click words to animate
6. Choose animation type (fade/slide/scale)
7. Adjust duration and delay

### Create Reusable Theme
1. Settings → Design Tools
2. Create custom color palette
3. Save as theme
4. Apply to presentations

### Add Bible Verses
1. In slide editor: Add "Content" layer
2. Select type: "Bible"
3. Search verses (future: multiple translations)
4. Auto-formats with reference

### Multi-Monitor Setup
1. Open presentation in main browser
2. Open stage display in separate window
3. Drag stage display to second monitor
4. Both update in real-time

## Troubleshooting

### Media Not Uploading
- Check file size (keep under 100MB)
- Ensure Supabase storage bucket exists
- Verify user permissions in database

### Captions Not Generating
- Check GROQ_API_KEY is set
- Verify microphone/audio input
- Ensure internet connection
- Check browser console for errors

### Slides Not Saving
- Verify Supabase connection
- Check `NEXT_PUBLIC_SUPABASE_URL` in .env
- Look for network errors in dev tools
- Try refreshing the page

### Beat Detection Accuracy
- Works best with clear, rhythmic audio
- Try increasing sensitivity in settings
- Manual BPM setting available as fallback
- Check confidence score (>0.5 is good)

## Feature Guide Quick Links

| Feature | Location | Purpose |
|---------|----------|---------|
| Presentations | Home | Create/manage presentations |
| Editor | Presentations → [name] | Build slides with layers |
| Songs | Songs menu | Manage lyrics, add animations |
| Media | Media menu | Upload and organize media |
| Settings | Settings menu | Language, AI features, accounts |
| Stage Display | Preview → Stage | Speaker monitor with notes |
| AI Captions | Settings → AI Features | Generate Indonesian captions |
| Themes | Settings → Design | Create custom color schemes |

## Next Steps

1. **Set up Supabase**: Create project, get credentials, set env vars
2. **Add your first song**: Practice with a familiar worship song
3. **Create a presentation**: Build slides for a service
4. **Test stage display**: Open on second monitor
5. **Try beat detection**: Upload a song and enable auto-sync
6. **Generate captions**: Record audio and see AI captions

## Tips for Best Results

- **Keep slide count reasonable**: 20-30 slides for typical service
- **Organize media**: Use bins to keep library manageable
- **Test animations**: Preview before live presentation
- **Use stage display**: Keep speaker notes visible
- **Set up keyboard shortcuts**: Practice on your device
- **Record backup**: Always have presentation downloaded

## Support & Learning

- Check README.md for detailed feature documentation
- Review component code for implementation examples
- Enable debug logs: `console.log(" ...")`
- Inspect database types in `types/database.ts`

---

**You're ready to present!** Start building your first presentation now.
