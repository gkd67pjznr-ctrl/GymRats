# Avatar & Hangout Room Implementation Plan

## Overview
This plan outlines the implementation of the Avatar & Hangout Room feature for the Forgerank app, which includes:
1. Virtual gym avatar that grows as users work out
2. Shared hangout room where friends' avatars appear
3. Avatar customization and growth system
4. Social presence indicators

## Key Requirements from Feature Documentation
- Finch-inspired avatar growth representing user commitment
- Multiple art styles (Bitmoji, pixel art, retro, 3D)
- Growth driven by volume, sets, and rank progression
- Visual-only social space with real-time friend presence
- Avatar leaves room when friend starts workout, returns when finished
- Room decorations and cosmetics system
- Real-time sync via Supabase

## Existing Codebase Patterns Analysis

### User Profile & Avatar System
- Users stored in `users` table with `avatar_url` field
- Avatar management in `authStore` with `updateAvatar()` and `removeAvatar()` actions
- Supabase Storage used for image uploads with `uploadAvatar()` function
- Uses DiceBear API for default avatar generation

### Real-time Social Features
- Friends system uses `friendsStore` with Zustand persistence
- Real-time subscriptions via `subscribeToUserFriendships()`
- Conflict resolution with `resolveFriendConflict()`
- Sync metadata tracking with `_sync` state

### Gamification Integration
- Gamification data stored in user profile (xp, levels, tokens)
- `gamificationStore` manages Forge Tokens and milestones
- Token spending/earning tracked in user profile

### State Management Patterns
- Zustand with `persist` middleware for AsyncStorage
- Selectors for optimized data access
- Imperative getters for non-React code
- Sync metadata tracking in store state

### Image Handling
- Supabase Storage buckets for avatars and posts
- Base64 encoding/decoding for image uploads
- File size and quality constraints
- Public URL generation for image display

## Technical Architecture

### Updated Data Model Extensions

#### Avatar Model (Extending User Profile)
Since avatars are user-specific, we'll extend the existing user profile rather than create separate tables:

```
// Extend DatabaseUser in types.ts
type DatabaseUserExtended = DatabaseUser & {
  // Avatar properties
  avatar_art_style?: string;    // "bitmoji" | "pixel" | "retro" | "3d"
  avatar_growth_stage?: number; // 1-20
  avatar_height_scale?: number; // 0.3 - 1.0
  avatar_cosmetics?: {
    top?: string | null;
    bottom?: string | null;
    shoes?: string | null;
    accessory?: string | null;
  };

  // Growth metrics (extend existing gamification fields)
  total_volume_kg?: number;
  total_sets?: number;

  // Hangout room properties
  hangout_room_id?: string;
  hangout_room_role?: "owner" | "member";
};

// Avatar growth data structure
type AvatarGrowth = {
  stage: number;         // 1-20 growth stages
  heightScale: number;   // 0.3 (baby) to 1.0 (full grown)
  volumeTotal: number;   // Lifetime volume logged
  setsTotal: number;     // Lifetime sets completed
  avgRank: number;       // Average rank across exercises
};
```

#### Hangout Room Model (New Table)
```
type HangoutRoom = {
  id: string;
  owner_id: string;
  name: string;
  theme: string;
  created_at: string;
  updated_at: string;
  members: string[];        // friend user IDs
};

type RoomDecoration = {
  id: string;
  room_id: string;
  item_id: string;
  item_type: "furniture" | "poster" | "equipment" | "trophies" | "plants";
  position_x: number;
  position_y: number;
  contributed_by: string;    // user ID who added it
  approved: boolean;         // admin approval status
  created_at: string;
};

type UserPresence = {
  id: string;
  user_id: string;
  room_id: string;
  status: "online" | "working_out" | "resting" | "offline";
  activity?: string;        // e.g. "Bench pressing..."
  updated_at: string;
};
```

## Implementation Approach

### Phase 1: Avatar Extension to User Profile
1. Update `DatabaseUser` type to include avatar properties
2. Create avatar data migration script
3. Extend `authStore` with avatar customization actions
4. Create avatar growth calculation functions
5. Add avatar data to user profile display

### Phase 2: Avatar Growth System
1. Implement growth stage calculation based on workout metrics
2. Create avatar visualization component with different art styles
3. Add growth animation and milestone celebration
4. Integrate growth with workout completion events

### Phase 3: Hangout Room Core
1. Create hangout room database tables (rooms, decorations, presence)
2. Implement hangout room repository with CRUD operations
3. Create hangout room store with Zustand
4. Build hangout room UI with avatar placement

### Phase 4: Real-time Presence System
1. Implement real-time presence tracking with Supabase subscriptions
2. Create presence repository with insert/update operations
3. Add avatar leave/return animations
4. Integrate with workout start/end events

### Phase 5: Cosmetics & Decorations
1. Implement cosmetic system with equipped items
2. Create decoration system with item management
3. Add Forge Token integration for purchases
4. Implement room admin controls

## File Structure Plan

```
src/
├── lib/
│   ├── avatar/
│   │   ├── avatarTypes.ts         # Avatar types and interfaces
│   │   ├── avatarStore.ts         # Extended Zustand store for avatar state
│   │   ├── avatarRepository.ts    # Supabase database operations for avatars
│   │   ├── growthCalculator.ts    # Avatar growth algorithms
│   │   └── avatarUtils.ts         # Utility functions for avatar handling
│   ├── hangout/
│   │   ├── hangoutTypes.ts        # Hangout room types
│   │   ├── hangoutStore.ts        # Zustand store for room state
│   │   ├── hangoutRepository.ts   # Supabase database operations for rooms
│   │   ├── presenceTracker.ts     # Real-time presence tracking
│   │   └── decorationManager.ts   # Decoration system
│   └── stores/
│       └── authStore.ts           # Extended with avatar actions
├── ui/
│   ├── components/
│   │   ├── Avatar/
│   │   │   ├── AvatarView.tsx     # Avatar display component
│   │   │   ├── AvatarCreator.tsx  # Avatar creation UI
│   │   │   └── AvatarCustomizer.tsx # Cosmetic customization
│   │   └── Hangout/
│   │       ├── HangoutRoom.tsx    # Main hangout room view
│   │       ├── FriendAvatar.tsx   # Individual friend avatar
│   │       ├── RoomDecoration.tsx # Room decoration component
│   │       └── PresenceIndicator.tsx # Avatar status indicator
│   └── screens/
│       ├── AvatarScreen.tsx       # Avatar management screen
│       └── HangoutScreen.tsx      # Hangout room screen
└── app/
    ├── avatar/
    │   └── index.tsx              # Avatar main screen
    └── hangout/
        └── index.tsx              # Hangout room screen
```

## Integration with Existing Systems

### Auth Store Extension
Extend the existing `authStore` to include:
- `updateAvatarStyle(style: string)` - Update avatar art style
- `updateAvatarCosmetics(cosmetics: AvatarCosmetics)` - Update equipped items
- `calculateAvatarGrowth()` - Calculate new growth stage based on metrics

### Friends Store Integration
- Use `useFriendEdges()` to get friend relationships
- Subscribe to friend presence updates via real-time
- Display friends' avatars in hangout room

### Workout Integration
- Hook into workout completion to trigger growth calculations
- Update presence status when workout starts/ends
- Track volume/sets for growth metrics

### Gamification Integration
- Use existing Forge Token system for cosmetic purchases
- Add avatar-related achievements to gamification store
- Track avatar milestones as gamification events

## Database Schema Changes

### User Profile Extension
Add to existing `users` table:
- `avatar_art_style` (TEXT)
- `avatar_growth_stage` (INTEGER)
- `avatar_height_scale` (REAL)
- `avatar_cosmetics` (JSONB)
- `total_volume_kg` (REAL)
- `total_sets` (INTEGER)
- `hangout_room_id` (TEXT)
- `hangout_room_role` (TEXT)

### New Tables
1. **hangout_rooms**
   - id (UUID)
   - owner_id (UUID)
   - name (TEXT)
   - theme (TEXT)
   - members (JSONB array)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. **room_decorations**
   - id (UUID)
   - room_id (UUID)
   - item_id (TEXT)
   - item_type (TEXT)
   - position_x (REAL)
   - position_y (REAL)
   - contributed_by (UUID)
   - approved (BOOLEAN)
   - created_at (TIMESTAMP)

3. **user_presence**
   - id (UUID)
   - user_id (UUID)
   - room_id (UUID)
   - status (TEXT)
   - activity (TEXT)
   - updated_at (TIMESTAMP)

## UI/UX Implementation

### Avatar Creation Flow
1. Onboarding step for avatar creation (skippable)
2. Art style selection with previews
3. Basic customization options
4. Growth stage visualization
5. Save and integrate with profile

### Hangout Room Screen
1. Full-screen room view with themed background
2. Grid/floor layout for avatar placement
3. Animated avatars with breathing/idle animations
4. Status indicators below avatars
5. Decoration layering system
6. "Add Decoration" floating action button
7. Room management controls for owners

### Navigation Integration
1. Add hangout room tab to main navigation
2. Avatar management in profile settings
3. Quick access from workout summary screen
4. Presence notifications in main feed

## Real-time Features Implementation

### Presence Tracking
1. Subscribe to `user_presence` table changes
2. Update local state on presence changes
3. Trigger avatar animations (leave/return)
4. Show status badges in UI

### Room Updates
1. Subscribe to room decoration changes
2. Real-time decoration placement/removal
3. Approval status updates for decorations
4. Room member list updates

### Avatar Updates
1. Subscribe to avatar data changes
2. Update avatar appearance in real-time
3. Show growth animations when stages change
4. Reflect cosmetic changes immediately

## Testing Strategy

### Unit Tests
1. Avatar growth calculation algorithms
2. Avatar customization validation
3. Presence status logic
4. Room membership management

### Integration Tests
1. Real-time sync with Supabase
2. Avatar data persistence
3. Room decoration placement
4. Presence status updates

### UI Tests
1. Avatar creation flow
2. Hangout room rendering
3. Avatar animations
4. Decoration management

### End-to-End Tests
1. Complete avatar creation workflow
2. Hangout room with multiple users
3. Presence tracking during workouts
4. Decoration purchase with Forge Tokens

## Dependencies and Considerations

### Supabase Setup
1. New database tables with appropriate RLS policies
2. Real-time subscriptions configuration
3. Storage buckets for decoration images (if needed)
4. Database functions for growth calculations

### Performance Considerations
1. Efficient avatar rendering with sprite sheets
2. Presence update batching to reduce network traffic
3. Caching of avatar data for offline access
4. Lazy loading of room decorations

### Offline Support
1. Local avatar state persistence
2. Queued presence updates
3. Cached room decoration data
4. Graceful degradation when offline

### Security
1. RLS policies for avatar customization
2. Decoration approval workflow
3. Presence data privacy controls
4. Room membership validation

## Priority Implementation Order

### Phase 1 (P0 - MVP): 2-3 weeks
1. **Week 1**: Avatar extension to user profile, basic creation UI
2. **Week 2**: Avatar growth system implementation
3. **Week 3**: Hangout room core with static avatars

### Phase 2 (P1 - Polish): 2-3 weeks
1. **Week 1**: Real-time presence tracking
2. **Week 2**: Basic cosmetics and decorations
3. **Week 3**: Room management and admin controls

### Phase 3 (P2 - Enhancement): 2-3 weeks
1. **Week 1**: Additional art styles (IAP)
2. **Week 2**: Premium cosmetics system
3. **Week 3**: Seasonal decorations and themes