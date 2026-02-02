# Feature: Backend & Sync

## Overview
Supabase backend integration for data persistence, cloud sync, and real-time features.

---

## Sub-Features

### Done - Supabase Client
- [x] Supabase JS client installed
- [x] Client initialization with environment variables
- [x] Health check function
- [x] Type-safe queries

**Implementation:** `src/lib/supabase/client.ts`

### Done - Database Schema
- [x] users table (user profiles)
- [x] workouts table (workout sessions)
- [x] workout_sets table (individual sets)
- [x] routines table (saved routines)
- [x] routine_exercises table (routine structure)
- [x] workout_plans table (premade plans)
- [x] friendships table (friend relationships)
- [x] posts table (social feed)
- [x] post_reactions table (post reactions)
- [x] post_comments table (post comments)
- [x] chat_threads table (DM conversations)
- [x] chat_messages table (chat messages)
- [x] user_gamification table (XP, levels, streaks)
- [x] Appropriate indexes for performance

**Implementation:** `supabase/migrations/`
- `001_initial_schema.sql`
- `002_enhanced_rls_policies.sql`
- `003_social_tables.sql`
- `004_gamification.sql`
- `005_user_search.sql`

### Done - Row Level Security
- [x] RLS enabled on all tables
- [x] User data isolation (users can only see their own data)
- [x] Friend-based access control (friends can see friends-only data)
- [x] Privacy level enforcement (public vs friends)
- [x] Admin bypass for moderation

**Implementation:** `supabase/migrations/002_enhanced_rls_policies.sql`

---

### Done - TypeScript Types
- [x] Database types generated from schema
- [x] Mapper functions for all tables
- [x] Type tests (100% coverage)

**Implementation:** `src/lib/supabase/types.ts`

---

### Done - Backend Sync System (Complete)
- [x] SyncOrchestrator for coordinating sync operations
- [x] NetworkMonitor for online/offline detection
- [x] Repository layer for all 9 database tables
- [x] RealtimeManager for Supabase realtime subscriptions
- [x] PendingOperationsQueue for offline mutation queuing
- [x] ConflictResolver with smart merge strategies
- [x] Store integration (all Zustand stores sync-enabled)
- [x] Real-time subscriptions (feed, friends, chat)
- [x] Sync status indicators (compact, full modes)
- [x] Utility hooks (useSyncStatus, useSyncState)

**Implementation:** `src/lib/sync/`

**Phase 1: Core Infrastructure** ✅
- `syncTypes.ts` - Core sync types (SyncStatus, SyncResult, ConflictStrategy)
- `NetworkMonitor.ts` - Online/offline detection with NetInfo
- `workoutRepository.ts` - Workout CRUD operations
- `routineRepository.ts` - Routine CRUD operations
- `SyncOrchestrator.ts` - Central sync coordinator
- `PendingOperationsQueue.ts` - Offline mutation queue
- `ConflictResolver.ts` - Smart merge strategies
- `RealtimeManager.ts` - Supabase realtime wrapper

**Phase 2: Store Integration** ✅
- `workoutStore.ts` - Sync + conflict resolution
- `routinesStore.ts` - Sync integration
- `workoutPlanStore.ts` - Sync integration

**Phase 3: Social Sync** ✅
- `friendsStore.ts` - Sync + realtime
- `socialStore.ts` - Sync + realtime
- `feedStore.ts` - Sync + realtime

**Phase 4: Chat Sync** ✅
- `chatStore.ts` - Sync + realtime + typing indicators

**Phase 5: Utility Hooks** ✅
- `useSyncStatus.ts` - Individual store sync status
- `useSyncState.ts` - Combined sync state for UI

### Done - Cloud Sync
- [x] Workout sync to Supabase
- [x] Routine sync to Supabase
- [x] Settings sync
- [x] Social data sync (friends, posts, chat)
- [x] Gamification data sync (XP, levels, streaks)
- [x] Automatic sync on app foreground
- [x] Automatic sync after authentication

### Done - Offline Queue
- [x] Queue changes when offline
- [x] Persist queue to AsyncStorage
- [x] Automatic flush on reconnect
- [x] Retry logic with exponential backoff
- [x] Queue status tracking

### Done - Conflict Resolution
- [x] Last-write-wins strategy (default)
- [x] Timestamp comparison (updated_at)
- [x] Server-wins for auth-related data
- [x] Client-wins for local workout data
- [x] Merge logic for complex data (routines)

### Done - Sync Status
- [x] Syncing indicator component
- [x] Sync error display
- [x] Last synced timestamp
- [x] Pending operations count
- [x] Compact display mode (for headers)
- [x] Full display mode (for debug)

**Implementation:** `src/ui/components/SyncStatusIndicator.tsx`

### Done - Real-time Subscriptions
- [x] Feed updates (new posts)
- [x] Friend requests
- [x] Chat messages
- [x] Typing indicators
- [x] Reactions (prepared for future)

### Done - File Storage
- [x] Avatar uploads to Supabase Storage
- [x] Image optimization (2MB max for avatars)
- [x] Public URL generation
- [x] Delete image functionality
- [x] Default avatar generation (DiceBear API)

**Implementation:** `src/lib/supabase/storage.ts`

---

### Planned - Data Migration
- [ ] Local to cloud migration script
- [ ] v1 to v2 data format converter
- [ ] Import from other apps (Strong, etc.)

### Done - User Search Migration
- [x] Migration file created (`005_user_search.sql`)
- [ ] Apply to production Supabase

### Done - Sync System Integration
- [x] Sync orchestrator initialization in app layout
- [x] Store registration system for all sync-enabled stores
- [x] Auth integration triggers sync on sign in/sign out
- [x] Network monitoring for online/offline sync
- [x] Real-time subscription management

---

## Technical Notes

**Key Files:**
- `src/lib/supabase/client.ts` - Supabase client
- `src/lib/supabase/types.ts` - TypeScript types
- `src/lib/supabase/storage.ts` - File storage
- `src/lib/sync/` - Complete sync system
  - `SyncOrchestrator.ts` - Main coordinator
  - `NetworkMonitor.ts` - Online/offline detection
  - `PendingOperationsQueue.ts` - Offline queue
  - `ConflictResolver.ts` - Merge strategies
  - `RealtimeManager.ts` - Realtime wrapper
  - `repositories/` - Data access layer
- `src/lib/stores/` - All stores sync-enabled
- `supabase/migrations/` - SQL migrations
- `src/ui/components/SyncStatusIndicator.tsx` - Sync UI

**Environment Variables:**
```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Database Tables:**
| Table | Purpose | JSONB Columns |
|-------|---------|---------------|
| users | User profiles | - |
| workouts | Workout sessions | - |
| workout_sets | Individual sets | - |
| routines | Saved routines | - |
| routine_exercises | Routine structure | - |
| workout_plans | Premade plans | - |
| friendships | Friend relationships | - |
| posts | Social feed | - |
| post_reactions | Post reactions | - |
| post_comments | Post comments | - |
| chat_threads | DM conversations | - |
| chat_messages | Chat messages | - |
| user_gamification | XP, levels, streaks | - |

**Sync Architecture:**
```
Local Store (Zustand)
    ↓
Sync Orchestrator
    ↓
Pending Operations Queue (AsyncStorage)
    ↓
Supabase (when online)
    ↓
Real-time Updates (push to clients)
```

**Network Detection:**
```typescript
import { networkMonitor } from '@/src/lib/sync/NetworkMonitor';

// Subscribe to network changes
const unsubscribe = networkMonitor.subscribe((isOnline) => {
  if (isOnline) {
    syncOrchestrator.flushQueue();
  }
});
```

**Repository Pattern:**
```typescript
// All database operations go through repositories
import { workoutRepository } from '@/src/lib/repositories/workoutRepository';

// CRUD operations
await workoutRepository.create(userId, workoutData);
await workoutRepository.update(userId, workoutId, updates);
await workoutRepository.delete(userId, workoutId);
const workouts = await workoutRepository.findAll(userId);
```

**Real-time Subscriptions:**
```typescript
import { realtimeManager } from '@/src/lib/sync/RealtimeManager';

// Subscribe to changes
const subscription = realtimeManager.subscribe(
  'posts',
  { event: 'INSERT', filter: `author_id=eq.${userId}` },
  (payload) => {
    // Handle new post
    feedStore.handleNewPost(payload);
  }
);

// Cleanup
subscription.unsubscribe();
```

---

## Documentation

- `docs/SUPABASE_SETUP.md` - Setup instructions
- `docs/OAUTH_SETUP.md` - OAuth configuration

---

## Dependencies

- Supabase project (created and configured)
- @supabase/supabase-js (installed)
- @react-native-community/netinfo (installed)
- Auth (for user identity)
- AsyncStorage (for local persistence)

---

## API Routes (Future)

For v2, consider Supabase Edge Functions for:
- Push notification sending
- Email digest generation
- Leaderboard calculation
- Achievement unlocking
- Anti-cheat detection

---

## Testing

**Repository Tests:**
- Each repository has CRUD tests
- Conflict resolution tests
- Offline queue tests

**Integration Tests:**
- Full sync flow tests
- Real-time subscription tests
- Conflict resolution tests

---

## Monitoring

**Sync Health Metrics:**
- Sync success rate
- Average sync time
- Queue depth (pending operations)
- Conflict frequency
- Real-time subscription count

**Debug Screen:**
- `app/debug/sync-status.tsx` - Detailed sync monitoring
- Shows all stores, sync status, pending operations
