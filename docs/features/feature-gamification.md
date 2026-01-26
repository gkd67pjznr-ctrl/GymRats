# Feature: Gamification

## Overview
XP, levels, streaks, currency, and cosmetics. Keeps users engaged beyond just logging workouts. Separate from the Forgerank scoring system (which measures actual strength progress).

**Philosophy:** No pay-to-win. All cosmetics, all optional.

---

## Sub-Features

### Planned - XP System
- [ ] XP calculation from workouts
- [ ] XP display on profile
- [ ] XP history tracking
- [ ] Visual XP bar progression

**Formula:** `baseXP (sets × 10) + volumeBonus + exerciseBonus`

**Key Point:** XP measures activity/engagement. Forgerank measures strength. Different systems, different purposes.

---

### Planned - User Levels
- [ ] Level thresholds (exponential curve)
- [ ] Level display on profile
- [ ] Level on feed posts
- [ ] Level badge next to username

---

### Planned - Level Up Celebration
- [ ] Full-screen animation
- [ ] Confetti effect
- [ ] Currency reward display
- [ ] Share prompt

---

### Planned - Streak System
- [ ] Workout streak counter
- [ ] 5-day break threshold
- [ ] Streak display on profile
- [ ] Post-workout summary shows streak

---

### Planned - Streak Calendar
- [ ] GitHub-style contribution graph
- [ ] 365 days view
- [ ] Color intensity by workouts per day

---

### Planned - Streak Milestones
- [ ] 7-day milestone
- [ ] 30-day milestone
- [ ] 100-day milestone
- [ ] 365-day milestone
- [ ] Currency rewards at each milestone
- [ ] Celebration animation

---

### Planned - Streak Color Progression
- [ ] Streak counter changes color based on length
- [ ] White (0-6) → Green (7-29) → Blue (30-99) → Purple (100-364) → Gold (365+)

---

### Planned - Currency System
- [ ] Currency balance display
- [ ] Earn from leveling up
- [ ] Earn from streak milestones
- [ ] Earn from PR achievements
- [ ] Earn from daily login
- [ ] Earn from referrals

**Currency Earning:**
| Action | Currency |
|--------|----------|
| Level up | 50 |
| 7-day streak | 25 |
| 30-day streak | 100 |
| 100-day streak | 500 |
| Weight PR | 10 |
| e1RM PR | 5 |
| Rank up | 25-100 (tier dependent) |
| Daily login | 5 |
| Referral | 200 |

---

### Planned - Cosmetic Store
- [ ] Store UI with categories
- [ ] Purchase confirmation
- [ ] Preview before buying
- [ ] Equipped item display

**Categories:**

**Themes/Color Schemes:**
- Accent color unlocks (beyond starter 4)
- Premium gradients
- Seasonal themes

**Voice Packs/Personalities:**
- Additional gym buddy personalities
- Special edition voices
- Community-created voices (future)

**Card Skins:**
- How your workout posts appear in feed
- Different frames, backgrounds
- Animated options (premium)

**Profile Customization:**
- Badges to display
- Profile frames/borders
- Username titles/flairs
- Avatar accessories

---

### Planned - Achievements/Badges
- [ ] First workout badge
- [ ] PR badges (first PR, 10 PRs, 100 PRs)
- [ ] Consistency badges (7/30/100/365 day streaks)
- [ ] Strength milestone badges (per tier reached)
- [ ] Social badges (friends, reactions given)
- [ ] Hidden/secret achievements

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

**Streak Display:**
- Flame icon + number
- Color based on streak length
- Tap to see streak calendar

**Store Layout:**
- Category tabs at top
- Grid of items with previews
- Price tag on each item
- "Owned" / "Equipped" badges

---

## Dependencies

- Auth (user identity)
- Workout completion (triggers XP/streak)
- Backend (persistence/sync)
- Settings (equipped items)

---

## Priority

**P1 (Phase 4):**
- XP system
- User levels
- Streak system
- Basic currency earning

**P2 (Phase 4-5):**
- Cosmetic store
- Achievements
- Full currency economy
