# Environment Setup Guide

## What's Included

The `.env.local` file is already created in your project with placeholder values. You need to replace these with your actual Supabase credentials.

## Step-by-Step Setup

### 1. Get Your Supabase Credentials

**If you don't have a Supabase account yet:**
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the form:
   - **Name**: ProPresenter
   - **Database Password**: Create a strong password
   - **Region**: Choose your region
4. Click "Create new project" (wait 2-3 minutes for initialization)

**To find your credentials:**
1. In Supabase Dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL** → Your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → Your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → Your `SUPABASE_SERVICE_ROLE_KEY`
   - **JWT Secret** → Your `SUPABASE_JWT_SECRET`

### 2. Update `.env.local`

Open `/vercel/share/v0-project/.env.local` and replace all placeholder values:

```env
# Replace these with your actual values from Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...your-actual-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5...your-service-key...
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...same-as-NEXT_PUBLIC...
SUPABASE_JWT_SECRET=your-jwt-secret-from-settings
```

### 3. Create Database Tables

In Supabase, go to **SQL Editor** and run the migration SQL found in `SUPABASE_SETUP.md`:

1. Click **New Query**
2. Copy and paste the SQL from SUPABASE_SETUP.md
3. Click **Run**

This creates all necessary tables for presentations, slides, media, songs, and more.

### 4. Set Up Storage Buckets

In Supabase, go to **Storage** and create three buckets:
- `presentations` (for slide thumbnails)
- `media` (for user media files - set to Public)
- `captions` (for AI-generated captions)

### 5. Run Locally

```bash
# Install dependencies (if needed)
pnpm install

# Start dev server
pnpm dev
```

Visit `http://localhost:3000`

## Verifying Setup

1. **Can you see the login page?** ✅ Basic setup works
2. **Can you sign up?** ✅ Supabase Auth configured
3. **Can you create a presentation?** ✅ Database connected
4. **Can you upload media?** ✅ Storage configured

If any step fails, check:
- All env vars are set correctly (no typos, spaces, or wrong values)
- Supabase project is running
- SQL migrations were executed
- Storage buckets were created

## Environment Variables Explained

| Variable | Purpose | Where from |
|----------|---------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public key for client-side auth | Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key | Settings → API → service_role secret |
| `SUPABASE_URL` | Same as NEXT_PUBLIC (server-side) | Same project URL |
| `SUPABASE_ANON_KEY` | Same as NEXT_PUBLIC (server-side) | Same public key |
| `SUPABASE_JWT_SECRET` | Secret for JWT verification | Settings → API → JWT Secret |
| `GROQ_API_KEY` | (Optional) AI captions | https://console.groq.com |

## Deploying to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add ProPresenter app"
   git push
   ```

2. **In Vercel Dashboard**
   - Import project from GitHub
   - Add same env vars in Settings → Environment Variables
   - Deploy!

## Troubleshooting

### "Supabase not configured" error
- Check `.env.local` exists in project root
- Verify all NEXT_PUBLIC_* vars are set
- Restart `pnpm dev`

### "Auth error" when logging in
- Make sure email auth is enabled in Supabase
- Check SUPABASE_JWT_SECRET is correct

### "Connection refused" error
- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Check your Supabase project is running
- Ensure you're not behind a firewall

### "Table doesn't exist" error
- Run the SQL migration from SUPABASE_SETUP.md
- Make sure all queries executed successfully

## Next Steps After Setup

1. ✅ Users can sign up and log in
2. ✅ Create presentations with multiple slides
3. ✅ Add media (images, videos, audio)
4. ✅ Manage songs and lyrics
5. ✅ Edit slide properties and transitions
6. ✅ (Optional) Enable AI captions with Groq API key
7. ✅ Deploy to Vercel

See `README.md` for feature documentation and `ARCHITECTURE.md` for technical details.
