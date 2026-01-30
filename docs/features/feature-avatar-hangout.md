# Feature: Avatar & Hangout Room - Implementation Progress

## Overview
A Finch-inspired virtual gym avatar that grows as the user works out, living in a shared hangout room with friends. The avatar represents the user's commitment to self-care and fitness journey — not just gamification, but emotional investment.

## Current Implementation Status
**Status:** In Progress | **Progress:** 4/8 features

### Completed Features (P0 - MVP)
✅ **Avatar Creation**
- Avatar creation UI with art style selection
- Avatar data storage extension in user profile
- Basic avatar display component

✅ **Avatar Growth System**
- Growth calculation algorithms
- Avatar growth state management
- Growth visualization with height scaling

✅ **Hangout Room Core**
- Database schema for hangout rooms, decorations, and presence
- Hangout room repository with CRUD operations
- Hangout room store with Zustand state management

✅ **Basic UI Components**
- AvatarView component for displaying avatars
- HangoutRoom component for main room view
- FriendAvatar component for friends' avatars

## Remaining Features (P1 - Polish)

### Real-time Presence System
- [ ] Real-time presence tracking with Supabase subscriptions
- [ ] Avatar leave/return animations
- [ ] Integration with workout start/end events

### Cosmetics & Decorations
- [ ] Avatar cosmetics system with equipped items
- [ ] Decoration system with item management
- [ ] Forge Token integration for purchases
- [ ] Room admin controls

### UI/UX Polish
- [ ] Room decorations placement and management UI
- [ ] Avatar customization interface
- [ ] Presence status indicators
- [ ] Room theme selection

## Technical Implementation

### File Structure
```
src/
├── lib/
│   ├── avatar/
│   │   ├── avatarTypes.ts         # Avatar types and interfaces
│   │   ├── avatarStore.ts         # Zustand store for avatar state
│   │   ├── avatarRepository.ts    # Supabase database operations
│   │   ├── growthCalculator.ts    # Avatar growth algorithms
│   │   └── avatarUtils.ts         # Utility functions
│   ├── hangout/
│   │   ├── hangoutTypes.ts        # Hangout room types
│   │   ├── hangoutStore.ts        # Zustand store for room state
│   │   ├── hangoutRepository.ts   # Supabase database operations
│   │   ├── presenceTracker.ts     # Real-time presence tracking
│   │   └── decorationManager.ts   # Decoration system
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

### Phase 2 (In Progress - P1 - Polish)
🔄 Real-time presence tracking
🔄 Basic cosmetics and decorations
🔄 Room management and admin controls

### Phase 3 (Pending - P2 - Enhancement)
🕒 Additional art styles (IAP)
🕒 Premium cosmetics system
🕒 Seasonal decorations and themes