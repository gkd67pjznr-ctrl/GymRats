# Feature: Social & Feed

## Overview
Social features for community engagement - friends, feed, posts, reactions. Built specifically for lifters, not general fitness. The social loop is a core differentiator.

**Philosophy:** Public by default - encourages discovery and growth.

---

## Sub-Features

### Done - Feed Screen (Shell)
- [x] Feed tab in navigation
- [x] Feed screen layout
- [x] Mock data display

**Implementation:** `app/(tabs)/feed.tsx`

### Done - Friends Screen (Shell)
- [x] Friends screen layout
- [x] Friends list display (mock)
- [x] Add friend button

**Implementation:** `app/friends.tsx`

---

### Scaffolded - Social Data Models
- [x] Post type defined
- [x] Reaction type defined
- [x] Comment type defined
- [x] Friendship type defined

**Implementation:** `src/lib/socialModel.ts`

### Scaffolded - Social Stores
- [x] Social store (Zustand)
- [x] Feed store (Zustand)
- [x] Friends store (Zustand)
- [x] Chat store (Zustand)

**Implementation:** `src/lib/stores/socialStore.ts`, etc.

### Scaffolded - Database Schema
- [x] Posts table designed
- [x] Reactions table designed
- [x] Comments table designed
- [x] Friendships table designed
- [x] RLS policies defined

**Implementation:** `supabase/migrations/`

---

### Planned - Feed Tabs
- [ ] Global feed tab (all public posts)
- [ ] Friends feed tab (friends only)
- [ ] Easy tab switching
- [ ] Remember last viewed tab

---

### Planned - Post Creation
- [ ] Post creation screen
- [ ] Workout stats display (exercises, sets, PRs)
- [ ] Caption input
- [ ] Optional photo upload
- [ ] Body model default image (if no photo)
- [ ] Rank badges earned display
- [ ] Privacy selection (public/friends)
- [ ] One-tap share to feed

---

### Planned - Feed Display
- [ ] Infinite scroll pagination
- [ ] Pull to refresh
- [ ] Real-time updates (new posts appear)
- [ ] Post cards with consistent styling
- [ ] Card skins (cosmetic customization)

---

### Planned - Reactions
- [ ] Quick emote buttons (fire, skull, crown, bolt, clap)
- [ ] Reaction counts
- [ ] Reaction animations
- [ ] Real-time reaction updates
- [ ] See who reacted

---

### Planned - Comments
- [ ] Comment input
- [ ] Comment thread display
- [ ] Reply to comments
- [ ] Comment notifications

---

### Planned - Friend Requests
- [ ] Send friend request
- [ ] Accept/decline UI
- [ ] Request notifications
- [ ] Friend request list

---

### Planned - User Discovery
- [ ] Search by username
- [ ] Algorithm-suggested users
- [ ] User profile preview
- [ ] "People you may know"

---

### Planned - User Profiles
- [ ] Public profile page
- [ ] Rank badges display
- [ ] Level and streak display
- [ ] Recent workouts
- [ ] Stats summary
- [ ] Add friend button
- [ ] Block option

---

### Planned - Content Moderation
- [ ] Report post button
- [ ] Report user button
- [ ] Block user functionality
- [ ] AI pre-filtering (future)
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
- `app/friends.tsx` - Friends screen
- `app/create-post.tsx` - Post creation
- `app/post/[id].tsx` - Post detail
- `app/u/[id].tsx` - User profile
- `src/lib/stores/socialStore.ts` - Social state
- `src/lib/stores/feedStore.ts` - Feed state
- `src/lib/stores/friendsStore.ts` - Friends state
- `src/lib/socialModel.ts` - Data types

**Data Models:**
```typescript
type Post = {
  id: string;
  authorId: string;
  caption?: string;
  photoUrl?: string;
  bodyModelData?: MuscleVolumeMap; // for default image
  privacy: 'public' | 'friends';
  workoutSnapshot: WorkoutSnapshot;
  ranksEarned: RankBadge[];
  reactionCounts: Record<string, number>;
  commentCount: number;
  createdAtMs: number;
};

type WorkoutSnapshot = {
  exercises: string[];
  totalSets: number;
  totalVolume: number;
  durationMs: number;
  prs: PR[];
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
```

**Database Tables:**
- `posts` - Social feed posts (JSONB: workout_snapshot)
- `reactions` - Post reactions
- `comments` - Post comments
- `friendships` - Friend relationships
- `notifications` - User notifications

**Real-Time Subscriptions:**
```typescript
// Subscribe to new posts
supabase
  .channel('public:posts')
  .on('INSERT', payload => handleNewPost(payload))
  .subscribe();

// Subscribe to reactions on your posts
supabase
  .channel('user:reactions')
  .on('INSERT', payload => handleNewReaction(payload))
  .subscribe();
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
- Body Model (for default post images)
- Cosmetics (for card skins)

---

## Priority

**P0 (Phase 3):**
- Global + Friends feed tabs
- Workout posts with stats
- Reactions
- Friend requests

**P1 (Phase 3-4):**
- Comments
- User profiles
- User search
- Content moderation

**P2 (Post-Launch):**
- Algorithm suggestions
- Advanced privacy controls
- AI moderation
