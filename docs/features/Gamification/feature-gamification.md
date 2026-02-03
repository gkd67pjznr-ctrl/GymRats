# Feature: Gamification

## Overview
XP, levels, streaks, currency, and cosmetics. Keeps users engaged beyond just logging workouts. Separate from the GymRats scoring system (which measures actual strength progress).

**Philosophy:** No pay-to-win. All cosmetics, all optional.

**Status:** 12/12 sub-features complete. Remaining work is streak color progression (planned) and future enhancements.

---

## Sub-Features

### Done - XP System
- [x] XP calculation from workouts
- [x] XP display on profile
- [x] XP history tracking
- [x] Visual XP bar progression
- [x] XP-based level thresholds

**Formula:** `baseXP (sets x 10) + volumeBonus + exerciseBonus`

**Implementation:** `src/lib/stores/gamificationStore.ts`

**Key Point:** XP measures activity/engagement. GymRats measures strength. Different systems, different purposes.

---

### Done - User Levels
- [x] Level thresholds (exponential curve)
- [x] Level display on profile
- [x] Level-up modal with animation
- [x] XP progress bar
- [x] Level calculation based on total XP

**Implementation:** `src/ui/components/Gamification/LevelUpModal.tsx`, `src/lib/stores/gamificationStore.ts`

**Level Thresholds:**
```
Level 1: 0 XP
Level 2: 100 XP
Level 3: 250 XP
Level 4: 500 XP
Level 5: 1,000 XP
Level 6: 2,000 XP
... (doubles each level)
```

---

### Done - Level Up Celebration
- [x] Full-screen modal animation
- [x] Confetti effect (canvas-based)
- [x] Currency reward display
- [x] Level-up sound effect
- [x] Haptic feedback
- [x] Dismiss to continue

**Implementation:** `src/ui/components/Gamification/LevelUpModal.tsx`

---

### Done - Streak System
- [x] Workout streak counter
- [x] 5-day break threshold
- [x] Streak display on profile
- [x] Post-workout streak summary
- [x] Automatic streak calculation
- [x] Streak persistence to backend

**Implementation:** `src/lib/stores/gamificationStore.ts`

**Streak Rules:**
- Streak increments on workout (max 1/day)
- Streak resets after 5 consecutive days without workout
- Streak count visible on profile and stats card

---

### Done - Currency System
- [x] Currency balance display (Forge Tokens)
- [x] Earn from leveling up
- [x] Store currency in backend
- [x] Currency sync with gamification data

**Currency Earning (Implemented):**
| Action | Currency |
|--------|----------|
| Level up | 50 |
| Streak milestone | Variable |

**Currency Earning (Planned):**
| Action | Currency |
|--------|----------|
| 7-day streak | 25 |
| 30-day streak | 100 |
| 100-day streak | 500 |
| Weight PR | 10 |
| e1RM PR | 5 |
| Rank up | 25-100 (tier dependent) |
| Daily login | 5 |
| Referral | 200 |

---

### Done - Stats & Ranks Card
- [x] Level display with progress bar
- [x] Current streak with fire icon
- [x] Total XP counter
- [x] Forge Tokens balance
- [x] Visual rank badges
- [x] Tap to view details

**Implementation:** `src/ui/components/Gamification/StatsAndRanksCard.tsx`

---

### Done - Backend Integration
- [x] Gamification repository (`gamificationRepository.ts`)
- [x] Gamification store with sync
- [x] Database table (user_gamification)
- [x] Sync on workout completion
- [x] Real-time sync support

**Implementation:** `src/lib/stores/gamificationStore.ts`

---

### Done - Streak Calendar
- [x] GitHub-style contribution graph
- [x] 365 days view
- [x] Color intensity by workouts per day

**Implementation:** `src/ui/components/Gamification/WorkoutCalendar.tsx`

---

### Done - Streak Milestones
- [x] 7-day milestone celebration
- [x] 30-day milestone celebration
- [x] 100-day milestone celebration
- [x] 365-day milestone celebration
- [x] Currency rewards at each milestone
- [x] Celebration animation

**Implementation:** `src/ui/components/Gamification/StreakMilestoneModal.tsx`, `src/lib/stores/gamificationStore.ts`

---

### Done - Cosmetic Store
- [x] Store UI with categories
- [x] Purchase confirmation
- [x] Preview before buying (placeholder)
- [x] Equipped item display

**Implementation:** `app/shop.tsx`, `src/lib/gamification/shop.ts`

**Categories:** personalities, themes, card_skins, profile_badges, profile_frames, titles

**Note:** Avatar cosmetics (accessories, frames, visual customization) are purchasable through the store using Forge Tokens. Forge Seasons will add limited-time seasonal items to the store inventory (e.g., holiday themes, seasonal card skins, exclusive profile frames) that rotate with each season.

---

### Done - Achievements/Badges
- [x] Achievements card component
- [x] Milestone tracking display
- [x] Progress toward next milestone
- [x] Completed achievements showcase

**Implementation:** `src/ui/components/Gamification/AchievementsCard.tsx`

---

### Planned - Streak Color Progression
- [ ] Streak counter changes color based on length
- [ ] White (0-6) -> Green (7-29) -> Blue (30-99) -> Purple (100-364) -> Gold (365+)

---

## Related Features

**Forge Milestones:** Tiered rarity milestones (Common / Rare / Epic / Legendary) are tracked separately in `docs/features/feature-forge-milestones.md`. Forge Milestones extend the gamification system with structured progression goals that award milestone badges based on rarity tiers, distinct from the achievements/badges system here which tracks general workout accomplishments.

---

## Technical Notes

**Data Structures:**

```typescript
// User Level & Currency
type UserProgress = {
  userId: string;
  level: number;
  xpTotal: number;
  xpToNextLevel: number;
  currency: number;
};

// Streak
type StreakData = {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string; // ISO date
  workoutDates: Record<string, number>; // { "2026-01-26": 2 }
};

// Gamification Profile (combined)
type GamificationProfile = {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  forgeTokens: number;
  lastWorkoutDate: string | null;
  workoutDates: Record<string, number>;
  createdAt: string;
  updatedAt: string;
};

// Cosmetic Item
type CosmeticItem = {
  id: string;
  name: string;
  category: 'theme' | 'voice' | 'card_skin' | 'profile';
  cost: number;
  previewUrl?: string;
  description: string;
};

// User Inventory
type UserInventory = {
  userId: string;
  ownedItems: string[]; // item IDs
  equippedTheme: string;
  equippedPersonality: string;
  equippedCardSkin: string;
  equippedBadges: string[]; // max 3
};
```

**Level Thresholds:**
```
Level 1: 0 XP
Level 2: 100 XP
Level 3: 250 XP
Level 4: 500 XP
Level 5: 1,000 XP
Level 6: 2,000 XP
Level 7: 4,000 XP
Level 8: 8,000 XP
... (doubles each level)
```

**Streak Rules:**
- Streak increments on workout (max 1/day)
- Streak resets after 5 consecutive days without workout
- Streak count visible on profile and post-workout summary

---

## UI Design

**XP Bar:**
- Thin progress bar under level badge
- Shows current XP / XP needed
- Fills up visually
- Animated on XP gain

**Streak Display:**
- Flame icon + number
- Color based on streak length
- Tap to see streak calendar (future)

**Level Up Modal:**
- Full-screen celebration
- Large level number with animation
- Currency reward display
- Confetti effect
- Dismiss button

**Store Layout:**
- Category tabs at top
- Grid of items with previews
- Price tag on each item
- "Owned" / "Equipped" badges

---

## Database Schema

**user_gamification table:**
```sql
CREATE TABLE user_gamification (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  forge_tokens INTEGER DEFAULT 0,
  last_workout_date DATE,
  workout_dates JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Dependencies

- Auth (user identity)
- Workout completion (triggers XP/streak)
- Backend (persistence/sync)
- Settings (equipped items)

---

## Priority

**Done (12/12 sub-features complete):**
- XP system
- User levels
- Level up celebration
- Streak system
- Currency system
- Stats & ranks card
- Backend integration
- Streak calendar
- Streak milestones
- Cosmetic store
- Achievements/badges

**Remaining:**
- Streak color progression (visual enhancement, low priority)

**Future enhancements (tracked in separate feature files):**
- Forge Milestones with tiered rarity system (see `feature-forge-milestones.md`)
- Forge Seasons with limited-time seasonal store items
- Expanded currency economy (PR rewards, daily login, referrals)
