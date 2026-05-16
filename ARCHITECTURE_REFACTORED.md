# ProPresenter - Refactored Architecture

## Overview

The application has been refactored from a monolithic Supabase-everywhere approach to a **domain-driven, server-action based architecture**. This design enables:

- Clean separation of concerns
- Easy migration to custom backend in future
- No direct Supabase imports in UI components
- Type-safe data operations
- Better scalability and maintainability

## Project Structure

```
lib/
├── supabase/
│   └── client.ts              # Only Supabase client initialization
│
├── auth/
│   └── actions.ts             # Server actions: signUp, signIn, getCurrentUser, signOut
│
├── database/
│   ├── presentations/
│   │   └── actions.ts         # CRUD for presentations + duplicate
│   ├── slides/
│   │   └── actions.ts         # CRUD for slides + layers
│   ├── songs/
│   │   └── actions.ts         # CRUD for songs + lyrics + search
│   └── media/
│       └── actions.ts         # CRUD for media records
│
├── storage/
│   └── actions.ts             # Server actions: upload, delete, getSignedUrl
│
└── hooks/
    ├── useAuth.ts             # Client hook: subscribes to auth state
    ├── usePresentations.ts     # Client hook: SWR-based presentations
    ├── useSongs.ts            # Client hook: SWR-based songs
    └── useMedia.ts            # Client hook: SWR-based media
```

## Data Flow Architecture

### Client → Server → Database

```
┌─────────────┐
│  Component  │  (UI Layer)
│  (use hook) │
└──────┬──────┘
       │ calls
       ↓
┌──────────────────┐
│  Custom Hook     │  (Caching Layer with SWR)
│  (usePresentations)
└──────┬───────────┘
       │ calls
       ↓
┌──────────────────────┐
│  Server Action       │  (Business Logic Layer)
│  (presentations/)    │
└──────┬───────────────┘
       │ uses
       ↓
┌──────────────────────┐
│  Supabase Client     │  (Only here!)
│  (getServerSupabase) │
└──────┬───────────────┘
       │ queries
       ↓
┌──────────────────────┐
│  Database            │
│  (PostgreSQL)        │
└──────────────────────┘
```

## Layer Responsibilities

### 1. **Supabase Client Layer** (`lib/supabase/client.ts`)
- **Single source of truth** for Supabase initialization
- Client-side only (checks `typeof window`)
- Lazy initialization with caching
- Exports: `getSupabaseClient()`, `isSupabaseConfigured()`

### 2. **Server Actions** (`lib/auth/`, `lib/database/`, `lib/storage/`)
- **All business logic here**
- Each domain (auth, presentations, songs, etc.) has its own file
- Uses `'use server'` directive
- Creates fresh Supabase instance per action
- Can access both public and service role keys
- Throws errors that components catch

**Example structure:**
```typescript
// lib/database/presentations/actions.ts
'use server';

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
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}
```

### 3. **Custom Hooks** (`lib/hooks/`)
- **Client-side data management with SWR**
- Calls server actions
- Handles loading, error, caching
- Provides mutations (create, delete, etc.)
- Returns typed data + helper functions

**Example hook:**
```typescript
// lib/hooks/usePresentations.ts
export function usePresentations(userId: string | null) {
  const { data: presentations = [], mutate } = useSWR(
    userId ? [`presentations-${userId}`] : null,
    async () => {
      if (!userId) return [];
      return await presentationsActions.getPresentations(userId);
    }
  );

  const createPresentation = useCallback(async (title: string) => {
    const presentation = await presentationsActions.createPresentation(userId, title);
    await mutate(); // Revalidate cache
    return presentation;
  }, [userId, mutate]);

  return { presentations, createPresentation, mutate };
}
```

### 4. **Components** (`app/`, `components/`)
- **Only UI logic** - no data fetching or Supabase imports
- Use hooks for data
- Call server actions through hooks
- Never directly access Supabase

**Example component:**
```typescript
// components/MyComponent.tsx
'use client';

import { usePresentations } from '@/lib/hooks/usePresentations';

export function MyComponent() {
  const { presentations, createPresentation } = usePresentations(userId);
  
  // Just render, no data fetching logic
  return (
    <>
      {presentations.map(p => <PresentationCard key={p.id} presentation={p} />)}
      <button onClick={() => createPresentation('New')}>Create</button>
    </>
  );
}
```

## Migration Path to Custom Backend

When moving from Supabase to a custom backend, **only these need to change:**

1. **Create API routes** (`app/api/presentations/`, etc.)
2. **Update server actions** to call API routes instead of Supabase
3. **Keep hooks unchanged** - they just call updated server actions
4. **Components never touched** - they still use the same hooks

### Before (Supabase):
```typescript
// lib/database/presentations/actions.ts
const supabase = getServerSupabase();
const { data } = await supabase.from('presentations').select('*');
```

### After (Custom Backend):
```typescript
// lib/database/presentations/actions.ts
const response = await fetch('/api/presentations', { ... });
const data = await response.json();
```

**Zero changes needed in:**
- All components
- All hooks
- App structure
- Build configuration

## Benefits of This Architecture

| Aspect | Monolithic | Domain-Driven |
|--------|-----------|---------------|
| **Backend swap** | Rewrite entire app | Only update `lib/` |
| **Component reuse** | Not possible (coupled to Supabase) | ✅ Fully portable |
| **Testing** | Mock Supabase everywhere | Mock server actions only |
| **Type safety** | Scattered types | Centralized per domain |
| **Scalability** | Hard to organize | Clear domains |
| **Future-proof** | Tied to Supabase | Framework-agnostic |

## Type Safety

All server actions are fully typed:

```typescript
// lib/database/presentations/actions.ts
export async function createPresentation(
  userId: string,
  title: string,
  description?: string
): Promise<Presentation> {  // Return type guaranteed
  // ...
}

// Usage in hook
const presentation = await createPresentation(userId, 'My Presentation');
// ✅ TypeScript knows presentation is Presentation type
```

## Error Handling

Server actions throw errors naturally:

```typescript
// Server action
export async function deletePresentation(id: string) {
  const supabase = getServerSupabase();
  const { error } = await supabase.from('presentations').delete().eq('id', id);
  if (error) throw error;  // Throws immediately
}

// Hook catches and manages
const deletePresentation = useCallback(async (id: string) => {
  try {
    await presentationsActions.deletePresentation(id);
    await mutate();
  } catch (err) {
    setError(err);  // Component shows error
  }
}, [mutate]);
```

## Key Files Reference

### Authentication
- **Server actions**: `lib/auth/actions.ts`
  - `signUp(email, password)`
  - `signIn(email, password)`
  - `getCurrentUser()`
  - `signOut()`
- **Hook**: `lib/hooks/useAuth.ts` - subscribes to auth state

### Presentations
- **Server actions**: `lib/database/presentations/actions.ts`
  - `getPresentations(userId)` - list all
  - `getPresentation(id)` - single
  - `createPresentation(userId, title, description)`
  - `updatePresentation(id, updates)`
  - `deletePresentation(id)`
  - `duplicatePresentation(id, userId)`
- **Hook**: `lib/hooks/usePresentations.ts` - cached presentations

### Slides
- **Server actions**: `lib/database/slides/actions.ts`
  - Slide CRUD + reordering
  - Slide layer CRUD
- **Usage**: Called directly in editor, can add hook if needed

### Songs & Lyrics
- **Server actions**: `lib/database/songs/actions.ts`
  - Song CRUD
  - Lyric CRUD
  - `searchLyrics(query)`
- **Hook**: `lib/hooks/useSongs.ts` - cached songs

### Media
- **Server actions**: `lib/database/media/actions.ts` - media records
  - `getMedia(userId)` - list
  - `createMediaRecord(...)` - create DB record
  - `deleteMedia(id)` - delete record
  - `searchMedia(userId, query)`
- **Storage actions**: `lib/storage/actions.ts` - file operations
  - `uploadMediaFile(file, fileName)`
  - `deleteStorageFile(filePath)`
  - `getSignedUrl(filePath)`
- **Hook**: `lib/hooks/useMedia.ts` - cached media

## Testing Strategy

### Unit Test Example
```typescript
// __tests__/lib/database/presentations/actions.test.ts
jest.mock('@supabase/supabase-js');

describe('presentations actions', () => {
  it('should create presentation', async () => {
    const mockSupabase = {...};
    jest.mock('getServerSupabase', () => mockSupabase);
    
    const result = await createPresentation('user1', 'Title');
    expect(result).toHaveProperty('id');
  });
});
```

## Summary

This architecture provides:
- ✅ Clean separation of concerns
- ✅ Zero Supabase knowledge in components
- ✅ Easy backend migration path
- ✅ Full type safety
- ✅ SWR-based caching and revalidation
- ✅ Server-side data validation
- ✅ Scalable to custom backend

The key principle: **Server actions are the only layer that knows about Supabase.** Everything above (components, hooks) is backend-agnostic.
