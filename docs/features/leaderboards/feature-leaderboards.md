# Feature: Leaderboards & Competitions

## Overview

Competition among friends and the broader community through various ranking systems and opt-in challenges. Encourages engagement and friendly competition without affecting core GymRats scoring integrity. All competitive features are designed to be **supportive, not toxic** -- we steer away from body comparison and toward celebrating effort, strength progress, and consistency.

**Launch status:** Phase 1 implemented (scope toggle, overall tab, user visibility).

---

## Sub-Features

### 1. Per-Exercise Leaderboard
- [x] Rank friends by GymRats score per exercise
- [x] Show top 5 per exercise (with user visible if outside top 5)
- [x] Display score and rank tier
- [x] Filter by exercise category
- [x] See your position highlighted (accent background + primary text)
- [x] Toggle between friends-only and global views

---

### 2. Overall GymRats Leaderboard
- [x] Average GymRats across all exercises
- [ ] Or total combined score option
- [x] Friends-only view
- [x] Global view
- [x] Weekly/monthly/all-time filters

---

### 3. Volume Leaderboard
- [x] Total sets logged
- [x] Total volume (weight x reps)
- [x] Workout frequency
- [x] Weekly/monthly periods
- [x] "Who's grinding the most" metric (Volume Champions / Set Grinders / Workout Warriors)

---

### 4. User Level Leaderboard
- [x] XP-based ranking
- [x] Current level display
- [x] XP earned this week/month
- [x] Friends comparison
- [x] Global comparison

---

### 5. Global Leaderboards
- [ ] Opt-in global rankings across all leaderboard types
- [ ] Percentile display ("top 5% worldwide") rather than raw position for large pools
- [ ] Regional and worldwide scopes
- [ ] Privacy controls -- users choose whether to appear on global boards
- [ ] Anti-toxicity: emphasize personal progress alongside global standing

---

### 6. Gym-Level Leaderboards
- [ ] Leaderboards scoped to a specific gym location
- [ ] Tied to the Gym Finder / Map feature (users claim their gym)
- [ ] Per-exercise and overall rankings within your gym
- [ ] "King of the gym" fun badges (rotating, not permanent)
- [ ] Post-launch, dependent on Gym Finder feature being live

---

### 7. Volume Challenges
- [ ] Fun, opt-in weekly challenges targeting specific muscles or exercises
- [ ] Examples: "Most calf volume this week", "Most rear delt volume", "Most sets of face pulls"
- [ ] Designed to encourage training neglected or less-popular muscle groups
- [ ] Rotating themes each week (auto-generated or community-voted)
- [ ] Lightweight prizes: badges, XP bonuses, feed shoutouts
- [ ] Friends-only and global challenge pools
- [ ] No body-image challenges -- strictly effort and volume based

---

### 8. Streak & Consistency Challenges
- [ ] Weekly/monthly consistency streaks (e.g., "Train 4x/week for a month")
- [ ] Friends can join the same challenge for accountability
- [ ] Celebrate completion, not comparison -- everyone who hits the goal "wins"

---

### 9. PR Milestone Celebrations
- [ ] Highlight when a friend hits a new rank tier or lifetime PR
- [ ] Leaderboard of "most PRs hit this month"
- [ ] Supportive -- framed as celebration, not as ranking people's bodies

---

### 10. Competitions (Online Meets & Shows)

For structured competitive events such as **online powerlifting meets** and **bodybuilding shows**, see [feature-competitions.md](./feature-competitions.md).

These are distinct from leaderboards: they have entry periods, judging criteria, and formal results. The competitions feature will reference leaderboard infrastructure but is scoped separately.

---

## Anti-Toxicity Philosophy

Competitive features must stay **supportive and effort-focused**:

- **No body comparison.** No physique rankings, no weight-class shaming, no appearance-based metrics.
- **Celebrate effort, not genetics.** Volume, consistency, and PRs are things everyone can improve.
- **Opt-in everything.** No one is placed on a leaderboard without choosing to be there.
- **Progress over position.** Show users their own trajectory alongside rankings.
- **Anomaly detection still applies.** GymRats's anti-cheat heuristics prevent inflated scores from dominating boards.
- **No rewards for top positions** beyond bragging rights, badges, and XP -- no pay-to-win, no gatekeeping.
- **Rotating challenges** keep the same people from dominating indefinitely.

---

## Technical Notes

**Data Requirements:**
- Friends list
- GymRats scores per exercise per user
- Workout history (for volume)
- XP totals
- Gym membership/location (for gym-level boards)
- Challenge opt-in state

**Leaderboard Entry (Implemented):**
```typescript
// Base entry from Supabase edge functions
type LeaderboardEntry = {
  rank: number;
  userId: string;
  userName: string;
  value: number;
  display: string;
};

// Enhanced entry with visibility flags (src/lib/leaderboardUtils.ts)
type EnhancedLeaderboardEntry = LeaderboardEntry & {
  isCurrentUser?: boolean;
  showSeparator?: boolean;
};
```

**API Endpoints (Supabase):**
```sql
-- Per-exercise leaderboard (friends)
SELECT user_id, gymrats_score, rank_tier
FROM user_exercise_stats
WHERE exercise_id = $1
AND user_id IN (SELECT friend_id FROM friendships WHERE user_id = $2)
ORDER BY gymrats_score DESC
LIMIT 10;

-- Per-exercise leaderboard (gym)
SELECT ues.user_id, ues.gymrats_score, ues.rank_tier
FROM user_exercise_stats ues
JOIN user_gyms ug ON ug.user_id = ues.user_id
WHERE ues.exercise_id = $1
AND ug.gym_id = $2
ORDER BY ues.gymrats_score DESC
LIMIT 20;
```

---

## UI Design

**Leaderboard Screen (Implemented):**
- Tab bar (horizontal scroll): Overall | Exercises | Users | Volume | Streaks
- Scope toggle: Global | Friends (pill buttons below tabs)
- List view with rank badges (1-3 get primary accent)
- User name + value display
- Current user highlighted with accent background + primary text
- Pull-to-refresh (RefreshControl)
- Separator ("...") shown when user is outside top N

**Leaderboard Card (Mini View):**
- Top 3 friends for an exercise
- Shown on exercise detail screen
- "See full leaderboard" link

**Challenge Card:**
- Challenge name, timeframe, current leader
- Your current standing and progress bar
- "Join" / "Leave" button
- Participants count

---

## Dependencies

- Friends system
- GymRats scoring
- Supabase backend
- User profiles
- Gym Finder / Map feature (for gym-level boards)
- Challenges infrastructure (scheduling, opt-in tracking)

---

## Priority

**Post-launch. Not included in MVP.**

**P1 (first post-launch wave):**
- Per-exercise leaderboard (friends + global)
- Overall GymRats leaderboard (friends + global)
- Volume Challenges (weekly rotating)

**P2 (second wave):**
- Volume leaderboard
- Level leaderboard
- Streak & Consistency Challenges
- PR Milestone Celebrations

**P3 (requires Gym Finder):**
- Gym-level leaderboards

**See also:**
- [feature-competitions.md](./feature-competitions.md) -- Online PL meets & BB shows

---

## Implementation Notes

### Phase 1 (Completed 2026-02-02)

**Files Created:**
- `src/lib/leaderboardUtils.ts` - Utility functions for filtering, ranking, user visibility
- `__tests__/lib/leaderboardUtils.test.ts` - 21 test cases

**Files Modified:**
- `app/(tabs)/leaderboard.tsx` - Enhanced with scope toggle, overall tab, pull-to-refresh

**Features Implemented:**
1. **Overall Tab** - New first tab showing average GymRats score across all exercises
2. **Scope Toggle** (Friends/Global) - Client-side filtering using `useFriendEdges` hook
3. **Pull-to-Refresh** - RefreshControl on ScrollView
4. **User Position Visibility** - Current user always visible with accent highlighting; separator ("...") shown when user is outside top N

**Utility Functions:**
```typescript
// src/lib/leaderboardUtils.ts
filterByFriends(entries, friendUserIds, currentUserId) // Filter to friends + self
recomputeRanks(entries) // Recalculate ranks after filtering
ensureCurrentUserVisible(entries, userId, maxVisible) // Guarantee user visibility
computeOverallRankings(exerciseRankings) // Average e1RM across exercises
```

**Edge Cases Handled:**
- No friends (Friends view shows only current user)
- User not in top N (shows separator + user's actual rank)
- Empty leaderboards (contextual empty states)

### Phase 2 (Completed 2026-02-03)

**Files Modified:**
- `src/lib/leaderboardUtils.ts` - Added volume and level computation utilities
- `src/ui/components/Ranks/LeaderboardsTab.tsx` - Major enhancements

**Features Implemented:**
1. **Score & Tier Display** - Each leaderboard row shows the user's score and tier badge (Iron-Mythic)
2. **Exercise Category Filter** - Filter exercises by muscle group (Chest, Back, Legs, Shoulders, Arms, Core)
3. **Time Period Filters** - All Time / This Month / This Week for Overall, Volume, and Level leaderboards
4. **Volume Leaderboard** - Complete new leaderboard type with three metrics:
   - Total Volume (weight × reps) - "Volume Champions"
   - Total Sets - "Set Grinders"
   - Workout Count - "Workout Warriors"
5. **Level/XP Leaderboard** - Complete new leaderboard type with three metrics:
   - Level - "Level Leaders" (highest level achieved)
   - Total XP - "XP Masters" (total experience points)
   - Recent XP - "Rising Stars" (XP earned this week/month)

**New Utility Functions:**
```typescript
// src/lib/leaderboardUtils.ts
filterSessionsByPeriod(sessions, period) // Filter workouts by time period
computeVolumeRankings(sessions, metric, userNameMap) // Compute volume leaderboard
formatVolumeCompact(volume) // Format volume as "12.5k kg" or "1.2m kg"
computeLevelRankings(profiles, metric, period, userNameMap) // Compute level leaderboard
formatXPCompact(xp) // Format XP as "12.5k XP" or "1.2m XP"
getLevelTierName(level) // Get tier name (Novice, Apprentice, etc.)
calculatePeriodXP(calendar, period) // Calculate XP in time period
```

**UI Enhancements:**
- Four-way type toggle: Exercise | Overall | Volume | Level
- Volume metric selector: Total Volume | Total Sets | Workouts
- Level metric selector: Level | Total XP | Recent XP
- Flame icons for top 3 volume leaders
- Level badge with tier-colored circle for level leaderboard
- Context-aware empty states for each leaderboard type
