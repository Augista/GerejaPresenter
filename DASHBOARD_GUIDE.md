# Dashboard Guide

## Overview

The dashboard is the main interface for ProPresenter after logging in. It provides a three-column layout for managing presentations, songs, and media files.

## Layout

### Left Sidebar
- **User Info:** Current logged-in user email and logout button
- **Search:** Search presentations and songs
- **Action Buttons:** 
  - "Presentasi Baru" - Create new presentation
  - "Kelola Lagu" - Manage songs
- **Tabs:** Switch between Presentations and Songs
- **List:** Shows presentations or songs, click to select

### Center Column
- **Preview Area:** Shows details of selected presentation or song
- **Toolbar:** Edit and Live buttons for presentations
- **Content:** 
  - For presentations: Grid of slide thumbnails
  - For songs: Lyrics organized by section

### Right Sidebar
- **Quick Actions:** Upload media, Settings
- **Statistics:** Total presentations and media files
- **Recent Media:** Last 4 uploaded media files
- **Theme Colors:** Select theme (cosmetic for now)
- **Pro Tip:** Keyboard shortcuts hint

## Features

### Presentations

1. **View Presentations:**
   - All your presentations are listed in the left sidebar
   - Click any presentation to view details
   - Grid of slide thumbnails in center panel

2. **Create New Presentation:**
   - Click "Presentasi Baru" button
   - Enter title and description
   - Start editing

3. **Edit Presentation:**
   - Select presentation in left sidebar
   - Click "Edit" button in toolbar
   - Navigate to presentation editor

4. **Live Presentation:**
   - Select presentation in left sidebar
   - Click "Live" button to start presentation mode

### Songs

1. **View Songs:**
   - Click "Lagu" tab in left sidebar
   - All songs are listed
   - Click any song to view lyrics

2. **Create New Song:**
   - Click "Kelola Lagu" button
   - Go to Songs page
   - Create and edit songs

3. **Edit Song:**
   - Click "Edit Lirik" button to go to song editor

### Media Management

1. **Upload Media:**
   - Click "Upload Media" in right sidebar
   - Go to Media page
   - Upload images, videos, or audio files

2. **View Recent Media:**
   - See last 4 files in right sidebar
   - Full library available in Media page

## Search

Use the search box in the left sidebar to find:
- Presentations by title
- Songs by title or artist

The search is real-time and updates as you type.

## Statistics

Right sidebar shows:
- **Total Presentations:** Number of presentations you've created
- **Media Files:** Total uploaded media

## Keyboard Shortcuts

Press `?` to view keyboard shortcuts (coming soon):
- `Ctrl+N` - New presentation
- `Ctrl+S` - Save
- `Space` - Play/Pause
- `Esc` - Exit presentation mode
- And more...

## Settings

Click "Pengaturan" (Settings) in right sidebar to:
- Change password
- Update profile
- Manage media
- Theme preferences

## Admin View

If you're an admin, access the admin panel at `/admin` to:
- View all users
- View all presentations and songs
- Manage system settings (coming soon)

## Tips & Tricks

1. **Quick Navigation:**
   - Click presentation title in left sidebar to see slides
   - Click song title to see lyrics
   - Use search to find items quickly

2. **Organization:**
   - Keep presentation titles descriptive
   - Organize songs by artist
   - Use media folders effectively

3. **Performance:**
   - Large presentations may take longer to load
   - Optimize media file sizes before uploading
   - Clear old presentations regularly

4. **Backup:**
   - Regularly export presentations
   - Keep backup copies of important songs
   - Download media files periodically

## Troubleshooting

### Dashboard Not Loading
- Try refreshing the page
- Clear browser cache
- Check internet connection
- Try different browser

### Can't See Presentations
- Make sure you're logged in
- Presentations tab should show count
- Check if presentations exist in database

### Media Not Showing
- Verify media file was uploaded successfully
- Check file format is supported
- Try uploading again

### Slow Performance
- Check file sizes
- Reduce number of slides in presentation
- Close other browser tabs
- Restart browser

## Mobile View

The dashboard is optimized for desktop viewing. Mobile view is limited but includes:
- Left sidebar (may be collapsed)
- Center content area
- Right sidebar (may need scrolling)

For best experience, use desktop with screen width 1600px+.

---

For more information:
- **Getting Started:** See `QUICKSTART.md`
- **Architecture:** See `ARCHITECTURE_REFACTORED.md`
- **Admin Setup:** See `ADMIN_SETUP.md`
