# Feature: Social & Feed

## Overview
Social features for community engagement - friends, feed, posts, reactions. Built specifically for lifters, not general fitness. The social loop is a core differentiator.

**Philosophy:** Public by default - encourages discovery and growth.

---

## Sub-Features

### Done - Feed Screen UI
- [x] Feed tab in navigation
- [x] Feed screen layout with ScrollView
- [x] Pull-to-refresh functionality
- [x] RefreshControl integration
- [x] Loading states
- [x] Empty state handling
- [x] Sync status indicator

**Implementation:** `app/(tabs)/feed.tsx`

### Done - Friends Screen UI
- [x] Friends screen layout
- [x] Friends list display (sync-connected)
- [x] Real-time user search bar
- [x] User search functionality (searchUserProfiles)
- [x] Send friend request button
- [x] Accept/decline friend request UI
- [x] Open DM from friends list
- [x] Pull-to-refresh
- [x] Sync status indicator

**Implementation:** `app/friends.tsx`

### Done - Post Creation Screen
- [x] Post creation layout
- [x] Caption input
- [x] Character counter
- [x] Keyboard-aware scroll view
- [x] Loading states
- [x] Error handling

**Implementation:** `app/create-post.tsx`

### Done - Direct Messaging Screen
- [x] Chat screen layout
- [x] Message list display
- [x] Message input
- [x] Send button
- [x] Typing indicators
- [x] Real-time updates
- [x] Pull-to-refresh
- [x] Sync status indicator

**Implementation:** `app/chat.tsx`, `app/dm/[id].tsx`

### Done - Social Data Models
- [x] Post type defined
- [x] Reaction type defined
- [x] Comment type defined
- [x] Friendship type defined
- [x] User profile type defined

**Implementation:** `src/lib/socialModel.ts`

### Done - Social Stores
- [x] Social store (Zustand) with sync
- [x] Feed store (Zustand) with sync
- [x] Friends store (Zustand) with sync
- [x] Chat store (Zustand) with sync
- [x] User profile store (Zustand) with caching

**Implementation:**
- `src/lib/stores/socialStore.ts`
- `src/lib/stores/feedStore.ts`
- `src/lib/stores/friendsStore.ts`
- `src/lib/stores/chatStore.ts`
- `src/lib/stores/userProfileStore.ts`

### Done - Database Schema
- [x] Posts table designed
- [x] Reactions table designed
- [x] Comments table designed
- [x] Friendships table designed
- [x] Chat messages table designed
- [x] User profiles table designed
- [x] RLS policies defined
- [x] User search function (search_users)

**Implementation:** `supabase/migrations/`
- `001_initial_schema.sql`
- `002_enhanced_rls_policies.sql`
- `003_social_tables.sql`
- `004_gamification.sql`
- `005_user_search.sql`

### Done - Backend Sync System
- [x] SyncOrchestrator for coordination
- [x] NetworkMonitor for online/offline detection
- [x] Repository layer for all 9 tables
- [x] RealtimeManager for Supabase subscriptions
- [x] PendingOperationsQueue for offline queuing
- [x] ConflictResolver with merge strategies
- [x] Store integration (all stores sync-enabled)
- [x] Real-time subscriptions (posts, friends, chat)
- [x] Sync status indicators (compact, full)
- [x] useSyncStatus hooks for UI

**Implementation:** `src/lib/sync/`

### Done - User Discovery
- [x] User search by name/email
- [x] Debounced search input
- [x] Search results filtering
- [x] Search loading states
- [x] userProfileRepository for queries
- [x] userProfileStore for caching

**Implementation:** `app/friends.tsx`, `src/lib/repositories/userProfileRepository.ts`

---

### Done - Feed Tabs
- [x] Global feed tab (all public posts)
- [x] Friends feed tab (friends only)
- [x] Easy tab switching via ToggleChip components
- [ ] Remember last viewed tab (persisting preference - deferred)

**Implementation:** `app/(tabs)/feed.tsx` - FeedMode toggle with Public/Friends filtering

---

### Done - Feed Display Features
- [x] Infinite scroll pagination (FlatList with onEndReached)
- [x] Real-time post updates (new posts banner with tap to scroll)
- [x] Post cards with consistent styling
- [ ] Card skins (cosmetic customization - deferred)
- [x] Workout stats in posts (exercises, sets, duration)
- [x] Rank badges earned display

**Implementation:** `app/(tabs)/feed.tsx` - FlatList with pagination, NewPostsBanner component

---

### Done - Reactions
- [x] Quick emote buttons (like, fire, crown)
- [x] Reaction counts displayed
- [x] Reaction animations (pop scale effect with haptic feedback)
- [x] Real-time reaction updates via socialStore sync
- [ ] See who reacted (future enhancement)

**Implementation:** `src/ui/components/Social/WorkoutPostCard.tsx` - AnimatedEmoteButton component

---

### Done - Comments
- [x] Comment input on posts (CommentInput component with send button)
- [x] Comment thread display (CommentList with threading)
- [x] Reply to comments (parentCommentId support)
- [x] Delete own comments
- [ ] Comment notifications (planned)

**Implementation:**
- `src/ui/components/Social/CommentInput.tsx` - Enhanced input with send button
- `src/ui/components/Social/CommentItem.tsx` - Comment display with reply/delete
- `app/post/[id].tsx` - Post detail with full comment system

---

### Planned - Friend Requests
- [ ] Request notifications
- [ ] Friend request list screen
- [ ] Request badges on tab
- [ ] Decline with reason (optional)

---

### Done - User Profiles
- [x] Public profile page (`/u/[id]`)
- [x] GymRank score display with tier coloring
- [x] Level and streak display
- [x] Recent posts display (with WorkoutPostCard)
- [x] Lifetime stats (workouts, PRs, volume)
- [x] Top exercises by rank (ProfileStatsCard)
- [x] Add friend button
- [x] Message friend button
- [ ] Block option (UI exists via PostOptions)

**Implementation:** `app/u/[id].tsx` - Enhanced profile with stats cards and posts

---

### Planned - Content Moderation
- [ ] Report post button
- [ ] Report user button
- [ ] Block user functionality
- [ ] Moderation queue (admin)

---

### Planned - Privacy Controls
- [ ] Public by default (encourages discovery)
- [ ] Friends-only option per post
- [ ] Private account option
- [ ] Per-post privacy selection
- [ ] Clear privacy indicators

---

## Technical Notes

**Key Files:**
- `app/(tabs)/feed.tsx` - Feed screen
- `app/friends.tsx` - Friends screen with search
- `app/create-post.tsx` - Post creation
- `app/chat.tsx` - Chat list
- `app/dm/[id].tsx` - Direct messaging
- `app/post/[id].tsx` - Post detail
- `app/u/[id].tsx` - User profile (planned)
- `src/lib/stores/socialStore.ts` - Social state
- `src/lib/stores/feedStore.ts` - Feed state
- `src/lib/stores/friendsStore.ts` - Friends state
- `src/lib/stores/chatStore.ts` - Chat state
- `src/lib/stores/userProfileStore.ts` - User profile cache
- `src/lib/socialModel.ts` - Data types

**Data Models:**
```typescript
type Post = {
  id: string;
  authorId: string;
  caption?: string;
  photoUrl?: string;
  privacy: 'public' | 'friends';
  createdAtMs: number;
  // Workout snapshot stored separately in workout_posts table
};

type Friendship = {
  userId: string;
  friendId: string;
  status: 'requested' | 'pending' | 'friends' | 'blocked';
  createdAtMs: number;
};

type Reaction = {
  id: string;
  postId: string;
  userId: string;
  emote: 'fire' | 'skull' | 'crown' | 'bolt' | 'clap' | 'heart';
  createdAtMs: number;
};

type ChatMessage = {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  createdAtMs: number;
};

type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: number;
  updatedAt: number;
};
```

**Database Tables:**
| Table | Purpose | JSONB Columns |
|-------|---------|---------------|
| users | User profiles | - |
| posts | Social feed | - |
| post_reactions | Post reactions | - |
| post_comments | Post comments | - |
| friendships | Friend relationships | - |
| chat_threads | DM conversations | - |
| chat_messages | Chat messages | - |
| notifications | User alerts | - |

**Real-Time Subscriptions:**
```typescript
// Subscribe to new posts
supabase
  .channel('public:posts')
  .on('INSERT', payload => feedStore.handleNewPost(payload))
  .subscribe();

// Subscribe to friend requests
supabase
  .channel('user:friendships')
  .on('INSERT', payload => friendsStore.handleNewRequest(payload))
  .subscribe();

// Subscribe to chat messages
supabase
  .channel('thread:messages')
  .on('INSERT', payload => chatStore.handleNewMessage(payload))
  .subscribe();
```

**Sync System:**
```typescript
// Pull data from server
await feedStore.pullFromServer();
await friendsStore.pullFromServer();

// Setup real-time updates
const cleanup = setupPostsRealtime(userId);
const cleanupFriends = setupFriendsRealtime(userId);
const cleanupChat = setupChatRealtime(userId);

// Check sync status
const syncStatus = useSyncStatus('feed');
// Returns: { isSyncing, lastSync, error, pendingOperations }
```

---

## Privacy Model

| Setting | Visibility |
|---------|------------|
| Public (default) | All users |
| Friends | Friends only |
| Private account | Only you see your posts |

**Why Public Default:** Encourages discovery, community growth, and app virality. Users can always opt out.

---

## Content Moderation

**v1 Approach (Simple):**
- Report + Block functionality
- Manual review queue
- User blocking persists

**Future (v2+):**
- AI content filtering
- Automated flagging
- Moderation tools for admins

---

## Dependencies

- Backend (Supabase) for data persistence
- Auth for user identity
- Real-time subscriptions for updates
- Network detection for offline support
- Body Model (for default post images) - planned
- Cosmetics (for card skins) - planned

---

## Priority

**P0 (Phase 2):**
- Complete feed UI polish
- Reactions system
- Friend request notifications

**P1 (Phase 2-3):**
- Comments
- User profiles
- Content moderation
- Privacy controls

**P2 (Post-Launch):**
- Algorithm suggestions
- Advanced privacy controls
- AI moderation
