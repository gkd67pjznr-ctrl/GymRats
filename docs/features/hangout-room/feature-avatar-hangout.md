# Feature: Avatar & Hangout Room - Implementation Progress

## Overview
A Finch-inspired virtual gym avatar that grows as the user works out, living in a shared hangout room with friends. The avatar represents the user's commitment to self-care and fitness journey — not just gamification, but emotional investment.

## Current Implementation Status
**Status:** In Progress | **Progress:** 8/8 features

---

## Recent Updates (2026-02-03)

### Design System Migration
- **HangoutScreen.tsx** migrated to new design system:
  - Added `ScreenHeader` component for proper safe area handling
  - Added `LinearGradient` backgrounds (`screenDepth`, `topGlow`)
  - Using `Text` primitive from `@/src/design`
  - Using semantic tokens (`surface`, `backgroundGradients`)
- **HangoutRoom.tsx** updated:
  - Added `onAddDecoration` prop to interface for decoration functionality

### Completed Features (P0 - MVP)
✅ **Avatar Creation**
- Avatar creation UI with art style selection
- Avatar data storage extension in user profile
- Basic avatar display component

✅ **Avatar Growth System**
- Growth calculation algorithms
- Avatar growth state management (now unified in `userStatsStore`)
- Growth visualization with height scaling
- **Workout integration:** Avatar grows automatically after each workout
- **Milestone celebrations:** Special toasts at stages 5, 10, 15, 20
- **Unified Stats Store (NEW):** Growth is now derived from `userStatsStore` - single source of truth for all user statistics

✅ **Hangout Room Core**
- Database schema for hangout rooms, decorations, and presence
- Hangout room repository with CRUD operations
- Hangout room store with Zustand state management

✅ **Basic UI Components**
- AvatarView component for displaying avatars
- HangoutRoom component for main room view
- FriendAvatar component for friends' avatars

✅ **Real-time Presence System** (ENHANCED 2026-02-03)
- **Supabase Presence API** for instant real-time updates (no database round-trips)
- **Database subscriptions** for persistent presence tracking (postgres_changes)
- Presence tracking with online/working_out/resting/offline statuses
- FriendAvatar leave/return animations with join notifications
- Heartbeat mechanism (30s interval) with automatic stale detection (60s timeout)
- Online count badge in hangout room header
- Workout activity updates showing current exercise name
- React hooks: `useRealtimePresence()`, `useWorkoutPresenceUpdater()`
- Comprehensive test coverage

✅ **Shop Extension** (NEW)
- Added `room_decorations` and `avatar_cosmetics` to ShopCategory
- 33 new purchasable items with Forge Token integration
- UserInventory updated with equippedHairstyle, equippedOutfit, equippedAccessories, ownedDecorations
- Shop system handles all 8 categories (personalities, themes, card_skins, profile_badges, profile_frames, titles, room_decorations, avatar_cosmetics)

## Completed Features (P1 - Polish)

### ✅ Shop UI (Complete - 2026-02-03)
- [x] Shop screen with category tabs for browsing items
- [x] Purchase confirmation modal with cost breakdown
- [x] Filter by affordable/owned items
- [x] Sort by rarity or cost
- [x] Rarity indicator lines on cards
- [x] Icons for each category
- [x] Item count display
- [x] Auto-equip after purchase
- [x] Haptic feedback throughout
- [x] New design system integration (gradients, semantic tokens)

### Avatar Customization UI (Partial)
- [x] AvatarCosmeticsModal with Hair/Outfit/Accessories tabs
- [x] Category selection with filtering and sorting
- [ ] Live avatar preview while selecting items

### Room Decoration Management (Deferred)
- [ ] Decoration placement UI (drag-and-drop in room)
- [ ] Room admin controls (approve/reject decorations)
- [ ] Room theme selection UI

## Technical Implementation

### File Structure
```
src/
├── lib/
│   ├── avatar/
│   │   ├── avatarTypes.ts         # Avatar types and interfaces
│   │   ├── avatarStore.ts         # Zustand store for art style & cosmetics
│   │   ├── avatarRepository.ts    # Supabase database operations
│   │   ├── growthCalculator.ts    # Avatar growth algorithms (legacy)
│   │   └── avatarUtils.ts         # Utility functions
│   ├── userStats/                 # NEW: Unified statistics module
│   │   ├── types.ts               # ExerciseStats, LifetimeStats, GymRank, etc.
│   │   ├── gymRankCalculator.ts # GymRank (40/30/20/10 formula)
│   │   ├── deriveAvatarGrowth.ts  # Avatar growth derived from stats
│   │   ├── statsCalculators.ts    # PR detection, volume tracking
│   │   └── index.ts               # Module exports
│   ├── stores/
│   │   └── userStatsStore.ts      # NEW: Single source of truth for user stats
│   ├── hangout/
│   │   ├── hangoutTypes.ts        # Hangout room types + presence types
│   │   ├── hangoutStore.ts        # Zustand store for room state
│   │   ├── hangoutRepository.ts   # Supabase database operations
│   │   ├── presenceTracker.ts     # Database presence tracking (postgres_changes)
│   │   ├── realtimePresence.ts    # Supabase Presence API integration (NEW)
│   │   ├── useRealtimePresence.ts # React hooks for presence (NEW)
│   │   ├── decorationManager.ts   # Decoration system
│   │   └── index.ts               # Module exports (NEW)
├── ui/
│   ├── components/
│   │   ├── Avatar/
│   │   │   ├── AvatarView.tsx     # Avatar display component
│   │   │   ├── AvatarCreator.tsx  # Avatar creation UI
│   │   │   └── AvatarCustomizer.tsx # Cosmetic customization
│   │   └── Hangout/
│   │       ├── HangoutRoom.tsx    # Main hangout room view
│   │       ├── FriendAvatar.tsx   # Individual friend avatar
│   │       └── RoomDecoration.tsx # Room decoration component
│   └── screens/
│       ├── AvatarScreen.tsx       # Avatar management screen
│       └── HangoutScreen.tsx      # Hangout room screen
└── app/
    ├── avatar/
    │   └── index.tsx              # Avatar main screen route
    └── hangout/
        └── index.tsx              # Hangout room screen route
```

### Database Schema

#### Updated Users Table
Added columns to existing `users` table:
- `avatar_art_style` (TEXT)
- `avatar_growth_stage` (INTEGER)
- `avatar_height_scale` (REAL)
- `avatar_cosmetics` (JSONB)
- `total_volume_kg` (REAL)
- `total_sets` (INTEGER)
- `hangout_room_id` (TEXT)
- `hangout_room_role` (TEXT)

#### New Tables
1. **hangout_rooms**
   - `id` (UUID)
   - `owner_id` (UUID)
   - `name` (TEXT)
   - `theme` (TEXT)
   - `members` (UUID[])
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **room_decorations**
   - `id` (UUID)
   - `room_id` (UUID)
   - `item_id` (TEXT)
   - `item_type` (TEXT)
   - `position_x` (REAL)
   - `position_y` (REAL)
   - `contributed_by` (UUID)
   - `approved` (BOOLEAN)
   - `created_at` (TIMESTAMP)

3. **user_presence**
   - `id` (UUID)
   - `user_id` (UUID)
   - `room_id` (UUID)
   - `status` (TEXT)
   - `activity` (TEXT)
   - `updated_at` (TIMESTAMP)

## Testing
- Unit tests for avatar growth calculation
- Unit tests for avatar store actions
- Unit tests for hangout store actions
- Unit tests for utility functions

## Dependencies
- Auth (user identity)
- Friends system (room membership)
- Backend sync (real-time avatar presence)
- Gamification store (Forge Tokens for purchases)
- Settings (equipped cosmetics)

## Priority Implementation Order

### Phase 1 (Completed - P0 - MVP)
✅ Avatar extension to user profile
✅ Basic creation UI
✅ Avatar growth system implementation
✅ Hangout room core with static avatars

### Phase 2 (Completed - P1 - Polish)
✅ Real-time presence tracking (complete with subscriptions)
✅ Shop extension (decorations and cosmetics added as purchasable)
✅ Shop UI for browsing and purchasing items
✅ Avatar customization interface
✅ Slot-based room decoration system
⏸️ Room admin controls (deferred - optional polish)

### Phase 3 (Pending - P2 - Enhancement)
🕒 Additional art styles (IAP)
🕒 Premium cosmetics system
🕒 Seasonal decorations and themes