# Migration Guide: Supabase to Custom Backend

This guide shows how to migrate from Supabase to a custom backend without changing any components or hooks.

## Overview

The refactored architecture isolates all Supabase logic in `lib/` server actions. Migration requires:

1. Build API routes in `app/api/`
2. Update server actions to call API routes
3. No changes to components or hooks (zero impact)

## Step-by-Step Migration

### Phase 1: Create API Routes

Create routes that match your server action logic:

#### Example 1: Presentations API

```typescript
// app/api/presentations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Your database client

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  }

  try {
    const presentations = await db.presentations.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' }
    });
    return NextResponse.json(presentations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, title, description } = await request.json();

    const presentation = await db.presentations.create({
      data: { user_id, title, description }
    });

    return NextResponse.json(presentation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
```

```typescript
// app/api/presentations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const presentation = await db.presentations.findUnique({
      where: { id: params.id }
    });

    if (!presentation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(presentation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json();

    const presentation = await db.presentations.update({
      where: { id: params.id },
      data: updates
    });

    return NextResponse.json(presentation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.presentations.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
```

### Phase 2: Update Server Actions

Replace Supabase calls with API calls:

#### Before (Supabase):
```typescript
// lib/database/presentations/actions.ts
'use server';

import { createClient } from '@supabase/supabase-js';

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key);
}

export async function getPresentations(userId: string) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

#### After (Custom API):
```typescript
// lib/database/presentations/actions.ts
'use server';

export async function getPresentations(userId: string) {
  const response = await fetch('/api/presentations?user_id=' + userId);
  
  if (!response.ok) {
    throw new Error('Failed to fetch presentations');
  }

  return await response.json();
}
```

#### Complete Converted File:

```typescript
// lib/database/presentations/actions.ts
'use server';

import type { Presentation } from '@/types/database';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function apiCall<T>(method: string, path: string, body?: any): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API call failed');
  }

  return response.json();
}

export async function getPresentations(userId: string): Promise<Presentation[]> {
  return apiCall('GET', `/api/presentations?user_id=${userId}`);
}

export async function getPresentation(presentationId: string): Promise<Presentation> {
  return apiCall('GET', `/api/presentations/${presentationId}`);
}

export async function createPresentation(
  userId: string,
  title: string,
  description: string = ''
): Promise<Presentation> {
  return apiCall('POST', '/api/presentations', {
    user_id: userId,
    title,
    description,
  });
}

export async function updatePresentation(
  presentationId: string,
  updates: Partial<Presentation>
): Promise<Presentation> {
  return apiCall('PATCH', `/api/presentations/${presentationId}`, updates);
}

export async function deletePresentation(presentationId: string): Promise<void> {
  await apiCall('DELETE', `/api/presentations/${presentationId}`);
}

export async function duplicatePresentation(
  presentationId: string,
  userId: string
): Promise<Presentation> {
  // Fetch original
  const original = await getPresentation(presentationId);

  // Create duplicate via API
  const duplicate = await createPresentation(userId, `${original.title} (Copy)`, original.description);

  // Handle slides duplication via API
  const slidesResponse = await fetch(
    `${API_URL}/api/presentations/${presentationId}/slides`
  );
  const slides = await slidesResponse.json();

  if (Array.isArray(slides) && slides.length > 0) {
    for (const slide of slides) {
      await fetch(`${API_URL}/api/slides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presentation_id: duplicate.id,
          order: slide.order,
          title: slide.title,
        }),
      });
    }
  }

  return duplicate;
}
```

### Phase 3: API Route Structure

Create a consistent API structure:

```
app/api/
├── auth/
│   ├── signup/route.ts
│   ├── signin/route.ts
│   ├── me/route.ts
│   └── logout/route.ts
├── presentations/
│   ├── route.ts          # GET (list), POST (create)
│   └── [id]/
│       └── route.ts      # GET, PATCH, DELETE
├── slides/
│   ├── route.ts
│   └── [id]/route.ts
├── songs/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── search/route.ts
├── media/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── upload/route.ts
└── storage/
    ├── upload/route.ts
    ├── [path]/route.ts
    └── signed-url/route.ts
```

### Phase 4: Environment Variables

Add new backend URL:

```env
# .env.local

# Keep Supabase vars during transition
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Add custom backend
NEXT_PUBLIC_API_URL=http://localhost:3000
# or in production:
NEXT_PUBLIC_API_URL=https://api.yoursite.com
```

### Phase 5: Update Other Domains

Repeat the same pattern for:
- `lib/database/slides/actions.ts`
- `lib/database/songs/actions.ts`
- `lib/database/media/actions.ts`
- `lib/auth/actions.ts`
- `lib/storage/actions.ts`

## Impact Assessment

### Zero Changes Required
- ✅ All components
- ✅ All hooks
- ✅ All pages
- ✅ All UI logic
- ✅ Type definitions

### Only Changes Required
- `lib/database/*/actions.ts` - swap Supabase for fetch calls
- `lib/auth/actions.ts` - swap Supabase auth for API calls
- `lib/storage/actions.ts` - swap Supabase storage for API calls
- `app/api/` - new files (not replacements)

## Testing Migration

### During Transition (Hybrid Mode)

You can run both Supabase and custom API simultaneously:

```typescript
// lib/database/presentations/actions.ts
const USE_CUSTOM_API = process.env.USE_CUSTOM_API === 'true';

export async function getPresentations(userId: string) {
  if (USE_CUSTOM_API) {
    return apiCall('GET', `/api/presentations?user_id=${userId}`);
  }
  
  // Original Supabase code
  const supabase = getServerSupabase();
  const { data, error } = await supabase.from('presentations').select('*');
  if (error) throw error;
  return data;
}
```

Then toggle with env var to test both backends.

### Final Cutover

1. Deploy custom backend with all API routes
2. Update all server actions to use API calls
3. Test thoroughly in staging
4. Set `USE_CUSTOM_API=true` in production
5. Monitor logs for any issues
6. Remove Supabase code once confident

## Benefits of This Approach

1. **Zero UI changes** - components never know about backend
2. **Gradual migration** - can run hybrid mode during transition
3. **Easy rollback** - just flip env var to revert
4. **Team friendly** - frontend team doesn't touch API routes
5. **Type safety maintained** - same types work with both backends

## Debugging Migration Issues

### Check API Response Format

Your API must return the same shape as Supabase:

```typescript
// Supabase returns:
{
  id: "uuid",
  user_id: "uuid",
  title: "string",
  description: "string",
  created_at: "ISO string",
  updated_at: "ISO string"
}

// Your API must return same shape
```

### Add Error Boundaries

Wrap critical API calls:

```typescript
export async function getPresentations(userId: string) {
  try {
    return await apiCall('GET', `/api/presentations?user_id=${userId}`);
  } catch (error) {
    console.error('[API] Failed to get presentations:', error);
    throw new Error('Failed to load presentations. Please try again.');
  }
}
```

## Next Steps

1. Choose your custom backend (Node, Python, Go, etc.)
2. Set up database (PostgreSQL recommended for compatibility)
3. Create API routes following the structure above
4. Update server actions incrementally
5. Test thoroughly before production
6. Monitor logs during rollout
7. Remove Supabase code once fully migrated

The architecture supports this entire journey with zero changes to your UI code!
