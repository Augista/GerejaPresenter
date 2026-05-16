# ProPresenter - Setup Instructions

## Quick Start (3 Steps)

### Step 1: Start Dev Server
```bash
pnpm dev
# App runs on http://localhost:3000
```

### Step 2: Create Admin Account
1. Visit http://localhost:3000/setup
2. Click "Create Admin Account" button
3. You'll see: "Admin account created successfully!"

### Step 3: Log In
1. Go to http://localhost:3000/auth/login
2. Use credentials:
   - Email: `admin@propresenter.local`
   - Password: `AdminProPresenter123!`
3. Click Sign In → Automatically redirected to **Dashboard**

## Dashboard Layout

After login, you see a professional three-column layout:

```
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD (Default)                  │
├──────────────┬──────────────────────┬──────────────────┤
│              │                      │                  │
│  LEFT PANEL  │   CENTER PANEL       │  RIGHT PANEL     │
│              │                      │                  │
│ • Search     │ • Preview slides     │ • Quick actions  │
│ • New Pres.  │ • Edit/Live buttons  │ • Statistics     │
│ • New Song   │ • Media library      │ • Theme colors   │
│ • Pres List  │ • Slide thumbnails   │ • Pro tips       │
│ • Songs List │ • Lyrics view        │ • Recent media   │
│              │                      │                  │
└──────────────┴──────────────────────┴──────────────────┘
```

## Available Features

### For All Users
- ✅ Create presentations with unlimited slides
- ✅ Multi-layer slide system (background, content, overlay)
- ✅ Drag-and-drop media management
- ✅ Song/lyrics library with search
- ✅ Word animation builder (fade, slide, scale)
- ✅ Stage display for presenter view
- ✅ Beat detection for auto-transitions
- ✅ AI caption generation
- ✅ English/Indonesian language toggle
- ✅ Theme customization

### Admin-Only Features
- Access `/admin` panel after login
- View all users in the system
- View all presentations from all users
- View all songs from all users
- Manage database records

## File Structure

```
app/
├── dashboard/page.tsx          ← Main dashboard (after login)
├── admin/page.tsx              ← Admin panel
├── setup/page.tsx              ← Admin account creation
├── auth/login/page.tsx         ← Sign in
├── auth/signup/page.tsx        ← Create account
└── api/admin/setup/route.ts    ← Admin setup API

components/dashboard/
├── dashboard-sidebar.tsx       ← Left panel
├── dashboard-center.tsx        ← Center panel
└── dashboard-right-panel.tsx   ← Right panel
```

## Environment Variables

Your `.env.local` already has these set:
```
NEXT_PUBLIC_SUPABASE_URL=https://ftseydghgkvwepyzmsqj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

These are configured and working.

## Troubleshooting

### "Admin account already exists"
- This is normal! It means the admin account was already created.
- Just sign in with the admin credentials.

### Login fails with 400 error
- Make sure the admin account was created first (Step 2)
- Check credentials are exactly: `admin@propresenter.local` / `AdminProPresenter123!`
- Refresh page and try again

### Dashboard doesn't load
- Check browser console for errors
- Make sure you're logged in (redirect to /dashboard happens automatically)
- Try logging out and back in

### Admin panel shows no data
- Click the tabs (Users, Presentations, Songs) to load data
- Data only shows for your own records (unless you're admin)

## Architecture

The app uses:
- **Next.js 16** - Full-stack framework
- **Supabase** - Authentication + Database + Storage
- **Server Actions** - All data operations
- **SWR** - Client-side caching
- **Tailwind CSS** - Styling
- **shadcn/ui** - Components

All Supabase operations are isolated in:
- `lib/supabase/client.ts` - Single client instance
- `lib/auth/actions.ts` - Authentication
- `lib/database/*/actions.ts` - Data CRUD by feature
- `lib/storage/actions.ts` - File operations

## Next Steps

1. ✅ Dev server running
2. ✅ Admin account created
3. ✅ Logged in to dashboard
4. → Create your first presentation!
   - Click "New Presentation" in left sidebar
   - Add slides with content
   - Click "Live" to present

## Support

For detailed feature docs, see:
- `README.md` - Full feature reference
- `ARCHITECTURE_QUICK_REFERENCE.md` - Code organization
- `DASHBOARD_GUIDE.md` - Dashboard usage
- `ADMIN_SETUP.md` - Admin configuration

---

**ProPresenter is ready to use!** 🎉
