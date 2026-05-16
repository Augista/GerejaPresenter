# Architecture Quick Reference

## When You Need To...

### Add a New Feature
1. Create server action in `lib/database/{domain}/actions.ts`
2. Create hook in `lib/hooks/use{Domain}.ts` (if data needs caching)
3. Use hook in component
4. No Supabase imports in component ✅

### Fetch Data in a Component
```typescript
// ❌ WRONG
import { getPresentations } from '@/lib/supabase'

// ✅ RIGHT
import { usePresentations } from '@/lib/hooks/usePresentations'

export function MyComponent() {
  const { presentations } = usePresentations(userId)
  return <>{presentations.map(...)}</>
}
```

### Call a Server Action
```typescript
// ❌ WRONG - calling directly in component
const data = await getPresentations(userId)

// ✅ RIGHT - through hook
const { presentations, createPresentation } = usePresentations(userId)
await createPresentation('New Title')
```

### Handle Errors
```typescript
// Server action throws naturally
export async function deletePresentation(id: string) {
  const supabase = getServerSupabase()
  const { error } = await supabase.from('presentations').delete()...
  if (error) throw error  // ✅ Error propagates to hook
}

// Hook catches
const deletePres = useCallback(async (id: string) => {
  try {
    await deletePresentation(id)
  } catch (err) {
    setError(err)  // Show to user
  }
}, [])
```

### Add Authentication Check
```typescript
// ✅ Use the hook
import { useAuth } from '@/lib/hooks/useAuth'

export function ProtectedComponent() {
  const { user, loading } = useAuth()
  
  if (loading) return <Spinner />
  if (!user) return <Redirect to="/login" />
  
  return <Dashboard />
}
```

### Migrate to Custom Backend (Future)
1. Delete Supabase calls from server actions
2. Replace with `fetch('/api/presentations')` calls
3. Components + hooks unchanged ✅

## Folder Structure Cheat Sheet

```
lib/
├── supabase/
│   └── client.ts
│       └─ getSupabaseClient()
│       └─ isSupabaseConfigured()
│
├── auth/
│   └── actions.ts
│       └─ signUp()
│       └─ signIn()
│       └─ getCurrentUser()
│       └─ signOut()
│
├── database/
│   ├── presentations/
│   │   └── actions.ts
│   │       └─ getPresentations()
│   │       └─ getPresentation()
│   │       └─ createPresentation()
│   │       └─ updatePresentation()
│   │       └─ deletePresentation()
│   │       └─ duplicatePresentation()
│   ├── slides/
│   │   └── actions.ts (slides + layers)
│   ├── songs/
│   │   └── actions.ts (songs + lyrics)
│   └── media/
│       └── actions.ts
│
├── storage/
│   └── actions.ts
│       └─ uploadMediaFile()
│       └─ deleteStorageFile()
│       └─ getSignedUrl()
│
└── hooks/
    ├── useAuth.ts
    │   └─ { user, loading, error, isConfigured }
    ├── usePresentations.ts
    │   └─ { presentations, createPresentation, deletePresentation, ... }
    ├── useSongs.ts
    │   └─ { songs, createSong, deleteSong, ... }
    └── useMedia.ts
        └─ { media, deleteMedia, searchMedia, ... }
```

## Data Flow Quick Diagram

```
Component renders
      ↓
calls usePresentations(userId)
      ↓
SWR caches + auto-refreshes
      ↓
calls async getPresentations(userId)
      ↓
server action runs on server
      ↓
creates Supabase client
      ↓
queries database
      ↓
returns data to hook
      ↓
hook updates cache
      ↓
component re-renders
```

## Common Patterns

### List with Create
```typescript
'use client'

import { usePresentations } from '@/lib/hooks/usePresentations'

export function PresentationsList() {
  const { presentations, createPresentation, loading } = usePresentations(userId)
  
  const handleCreate = async (title: string) => {
    try {
      await createPresentation(title)
      // SWR auto-refetches
    } catch (err) {
      showError(err.message)
    }
  }

  return (
    <>
      {loading ? <Spinner /> : presentations.map(...)}
      <button onClick={() => handleCreate('New')}>Create</button>
    </>
  )
}
```

### Edit + Delete
```typescript
const { presentations, mutate } = usePresentations(userId)

const handleDelete = async (id: string) => {
  try {
    await deletePresentation(id)
    await mutate()  // Manual refresh
  } catch (err) {
    showError(err.message)
  }
}
```

### Search
```typescript
const { searchMedia } = useMedia(userId)
const [results, setResults] = useState([])

const handleSearch = async (query: string) => {
  try {
    const results = await searchMedia(query)
    setResults(results)
  } catch (err) {
    showError(err.message)
  }
}
```

## Import Locations

```typescript
// ✅ DO import from hooks
import { usePresentations } from '@/lib/hooks/usePresentations'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSongs } from '@/lib/hooks/useSongs'
import { useMedia } from '@/lib/hooks/useMedia'

// ❌ DON'T import directly from actions
import { getPresentations } from '@/lib/database/presentations/actions'

// ❌ DON'T import Supabase in components
import { supabase } from '@/lib/supabase'

// ✅ ONLY use in server actions
import { createClient } from '@supabase/supabase-js'
```

## Common Mistakes & Fixes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Import `getPresentations` in component | Direct Supabase | Use `usePresentations` hook |
| `useEffect` + `setLoading` | Duplicate state | Use hook's loading state |
| Try to use `supabase` in browser | Can't find config | Use hooks that call server actions |
| Calling action from client | "use server" error | Call through hook |
| Forgot error handling | Silent failures | Hook catches and stores errors |

## Testing

### Mock a Server Action
```typescript
jest.mock('@/lib/database/presentations/actions', () => ({
  getPresentations: jest.fn(() => Promise.resolve([
    { id: '1', title: 'Test', user_id: 'user1' }
  ]))
}))

// Hook will use mocked action
const { presentations } = usePresentations('user1')
```

### Mock a Hook
```typescript
jest.mock('@/lib/hooks/usePresentations', () => ({
  usePresentations: jest.fn(() => ({
    presentations: [{ id: '1', title: 'Test' }],
    loading: false,
    error: null
  }))
}))

// Component will use mocked hook
render(<PresentationsList />)
```

## Performance Tips

### 1. Conditional Fetching
```typescript
// Only fetch if userId exists
const { presentations } = usePresentations(userId || null)
```

### 2. Pagination (add to actions)
```typescript
export async function getPresentations(userId: string, page: number = 1) {
  const limit = 10
  const offset = (page - 1) * limit
  
  // Add .range(offset, offset + limit) to query
}
```

### 3. Manual Revalidation
```typescript
const { presentations, mutate } = usePresentations(userId)

// After mutation, refresh cache
await createPresentation(title)
await mutate()
```

## Deployment Checklist

- [ ] All imports use hooks, not direct actions
- [ ] No Supabase imports in components
- [ ] All server actions have error handling
- [ ] Build succeeds (`pnpm build`)
- [ ] Environment variables set in production
- [ ] Test auth flow works
- [ ] Test data fetching works
- [ ] Error messages display properly

---

**Key Principle:** Components only know about hooks. Hooks only know about server actions. Server actions only know about Supabase. This isolation enables future backend migration.
