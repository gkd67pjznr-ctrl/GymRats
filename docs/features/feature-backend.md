# Feature: Backend & Sync

## Overview
Supabase backend integration for data persistence, cloud sync, and real-time features.

---

## Sub-Features

### Done - Supabase Client
- [x] Supabase JS client installed
- [x] Client initialization
- [x] Environment variables configured
- [x] Health check function

**Implementation:** `src/lib/supabase/client.ts`

### Done - Database Schema
- [x] Users table
- [x] Workouts table
- [x] Routines table
- [x] Friendships table
- [x] Posts table
- [x] Reactions table
- [x] Comments table
- [x] Notifications table
- [x] Appropriate indexes

**Implementation:** `supabase/migrations/001_initial_schema.sql`

### Done - Row Level Security
- [x] RLS enabled on all tables
- [x] User data isolation
- [x] Friend-based access control
- [x] Privacy level enforcement

**Implementation:** `supabase/migrations/002_enhanced_rls_policies.sql`

---

### Scaffolded - TypeScript Types
- [x] Database types generated
- [x] Mapper functions
- [x] Type tests (100% coverage)

**Implementation:** `src/lib/supabase/types.ts`

---

### Planned - Cloud Sync
- [ ] Workout sync to Supabase
- [ ] Routine sync to Supabase
- [ ] Settings sync
- [ ] Automatic on workout complete

### Planned - Offline Queue
- [ ] Queue changes when offline
- [ ] Persist queue to AsyncStorage
- [ ] Flush on reconnect
- [ ] Retry logic

### Planned - Conflict Resolution
- [ ] Last-write-wins strategy
- [ ] Timestamp comparison
- [ ] Merge logic for complex data

### Planned - Sync Status
- [ ] Syncing indicator
- [ ] Sync error display
- [ ] Manual sync button
- [ ] Last synced timestamp

### Planned - Data Migration
- [ ] Local to cloud migration
- [ ] v1 to v2 data format
- [ ] Import from other apps

### Planned - Real-time Subscriptions
- [ ] Feed updates
- [ ] Friend requests
- [ ] Reactions
- [ ] Comments

### Planned - File Storage
- [ ] Photo uploads for posts
- [ ] Avatar uploads
- [ ] Image optimization

---

## Technical Notes

**Key Files:**
- `src/lib/supabase/client.ts` - Supabase client
- `src/lib/supabase/types.ts` - TypeScript types
- `supabase/migrations/` - SQL migrations
- `supabase/tests/` - RLS tests

**Environment Variables:**
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Database Tables:**
| Table | Purpose | JSONB Columns |
|-------|---------|---------------|
| users | User profiles | - |
| workouts | Workout sessions | sets |
| routines | Saved routines | exercises |
| friendships | Friend relationships | - |
| posts | Social feed | workout_snapshot |
| reactions | Post reactions | - |
| comments | Post comments | - |
| notifications | User alerts | - |

**Sync Architecture (Planned):**
```
Local Store (Zustand)
    ↓
Sync Manager
    ↓
Offline Queue (AsyncStorage)
    ↓
Supabase (when online)
```

**Network Detection:**
```typescript
import NetInfo from '@react-native-community/netinfo';

NetInfo.addEventListener(state => {
  if (state.isConnected) {
    syncManager.flushQueue();
  }
});
```

---

## Documentation

- `docs/SUPABASE_SETUP.md` - Setup instructions
- `docs/OAUTH_SETUP.md` - OAuth configuration

---

## Dependencies

- Supabase project (created)
- Auth (for user identity)
- Network connectivity detection
