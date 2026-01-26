# Feature: Gamification

## Overview
XP, levels, streaks, currency, and rewards. Keeps users engaged beyond just logging workouts. Separate from the Forgerank scoring system.

---

## Sub-Features

### Planned - XP System
- [ ] XP calculation from workouts
- [ ] XP display on profile
- [ ] XP history tracking

**Formula:** `baseXP (sets × 10) + volumeBonus + exerciseBonus`

### Planned - User Levels
- [ ] Level thresholds (100, 250, 500, 1000, 2000...)
- [ ] Level display on profile
- [ ] Level on feed posts

### Planned - Level Up Celebration
- [ ] Full-screen animation
- [ ] Confetti effect
- [ ] Currency reward display

### Planned - Streak System
- [ ] Workout streak counter
- [ ] 5-day break threshold
- [ ] Streak display on profile

### Planned - Streak Calendar
- [ ] GitHub-style contribution graph
- [ ] 365 days view
- [ ] Color intensity by workouts

### Planned - Streak Milestones
- [ ] 7-day milestone
- [ ] 30-day milestone
- [ ] 100-day milestone
- [ ] 365-day milestone
- [ ] Currency rewards

### Planned - Currency System
- [ ] Currency balance display
- [ ] Earn from leveling
- [ ] Earn from streaks
- [ ] Earn from PRs

### Planned - Gym Buddy Personalities
- [ ] Default personality
- [ ] 4+ additional personalities
- [ ] Personality picker in settings
- [ ] Personality picker in onboarding

### Planned - PR Cues
- [ ] Personality-specific messages
- [ ] Randomized from pool
- [ ] Consistent tone per personality

### Planned - Rank-Up Cues
- [ ] Celebration messages
- [ ] Personality-specific
- [ ] Shareable moments

### Planned - Achievements/Badges
- [ ] First workout badge
- [ ] PR badges
- [ ] Consistency badges
- [ ] Strength milestone badges

### Planned - Cosmetic Store
- [ ] Theme/color schemes
- [ ] Voice packs
- [ ] Card skins
- [ ] Profile customization

---

## Technical Notes

**Proposed Data Structures:**

```typescript
// User Level
type UserLevel = {
  userId: string;
  level: number;
  xpTotal: number;
  xpCurrent: number;  // XP toward next level
  currency: number;
}

// Streak
type StreakData = {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string;
  workoutDates: Record<string, number>;  // { "2026-01-26": 2 }
}

// Personality
type Personality = {
  id: string;
  name: string;
  description: string;
  tone: 'motivational' | 'funny' | 'stoic' | 'aggressive' | 'friendly';
  prCues: string[];
  rankUpCues: string[];
}
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
- Streak resets after 5 days without workout
- Streak color progression: white → green → blue → purple → gold

**Proposed Personalities:**
1. **Coach** (default) - Balanced, encouraging
2. **Motivator** - Intense, pushing
3. **Comedian** - Lighthearted, funny
4. **Stoic** - Minimal, respectful
5. **Hype** - High energy, emoji-heavy

---

## Dependencies

- Auth (for user identity)
- Workout completion (for XP/streak triggers)
- Backend (for persistence/sync)
