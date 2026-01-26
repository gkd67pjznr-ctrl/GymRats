# Feature: Social & Feed

## Overview
Social features for community engagement - friends, feed, posts, reactions. Built to help lifters share achievements and motivate each other.

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

### Planned - Global Feed
- [ ] Fetch public posts from Supabase
- [ ] Infinite scroll pagination
- [ ] Pull to refresh
- [ ] Real-time updates

### Planned - Friends Feed
- [ ] Filter by friends
- [ ] Friend-only visibility

### Planned - Post Workout
- [ ] Post creation screen
- [ ] Workout stats display
- [ ] Caption input
- [ ] Photo upload
- [ ] Privacy selection

### Planned - Reactions
- [ ] Emote buttons (fire, skull, crown, etc.)
- [ ] Reaction counts
- [ ] Reaction animations
- [ ] Real-time reaction updates

### Planned - Comments
- [ ] Comment input
- [ ] Comment thread display
- [ ] Reply to comments

### Planned - Friend Requests
- [ ] Send friend request
- [ ] Accept/decline UI
- [ ] Request notifications

### Planned - User Search
- [ ] Search by username
- [ ] Search results display
- [ ] User profile preview

### Planned - User Profiles
- [ ] Public profile page
- [ ] Rank badges display
- [ ] Recent workouts
- [ ] Stats summary

### Planned - Notifications
- [ ] Friend request alerts
- [ ] Reaction notifications
- [ ] Comment notifications

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
  title: string;
  caption?: string;
  privacy: 'public' | 'friends';
  workoutSnapshot: WorkoutSnapshot;
  likeCount: number;
  commentCount: number;
  createdAtMs: number;
}

type Friendship = {
  userId: string;
  friendId: string;
  status: 'requested' | 'pending' | 'friends' | 'blocked';
}

type Reaction = {
  postId: string;
  userId: string;
  emote: 'like' | 'fire' | 'skull' | 'crown' | 'bolt' | 'clap';
}
```

**Database Tables:**
- `posts` - Social feed posts
- `reactions` - Post reactions
- `comments` - Post comments
- `friendships` - Friend relationships
- `notifications` - User notifications

---

## Privacy Model

- **Public**: Visible to all users
- **Friends**: Visible to friends only
- **Default**: Public (encourages discovery)

---

## Dependencies

- Backend (Supabase) for data persistence
- Auth for user identity
- Real-time subscriptions for updates
