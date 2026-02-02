# Feature: Leaderboards & Competitions

## Overview

Competition among friends and the broader community through various ranking systems and opt-in challenges. Encourages engagement and friendly competition without affecting core Forgerank scoring integrity. All competitive features are designed to be **supportive, not toxic** -- we steer away from body comparison and toward celebrating effort, strength progress, and consistency.

**Launch status:** Post-launch feature (not included in MVP).

---

## Sub-Features

### 1. Per-Exercise Leaderboard
- [ ] Rank friends by Forgerank score per exercise
- [ ] Show top 10 friends per exercise
- [ ] Display score and rank tier
- [ ] Filter by exercise category
- [ ] See your position highlighted
- [ ] Toggle between friends-only and global views

---

### 2. Overall Forgerank Leaderboard
- [ ] Average Forgerank across all exercises
- [ ] Or total combined score option
- [ ] Friends-only view
- [ ] Global view
- [ ] Weekly/monthly/all-time filters

---

### 3. Volume Leaderboard
- [ ] Total sets logged
- [ ] Total volume (weight x reps)
- [ ] Workout frequency
- [ ] Weekly/monthly periods
- [ ] "Who's grinding the most" metric

---

### 4. User Level Leaderboard
- [ ] XP-based ranking
- [ ] Current level display
- [ ] XP earned this week/month
- [ ] Friends comparison
- [ ] Global comparison

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
- **Anomaly detection still applies.** Forgerank's anti-cheat heuristics prevent inflated scores from dominating boards.
- **No rewards for top positions** beyond bragging rights, badges, and XP -- no pay-to-win, no gatekeeping.
- **Rotating challenges** keep the same people from dominating indefinitely.

---

## Technical Notes

**Data Requirements:**
- Friends list
- Forgerank scores per exercise per user
- Workout history (for volume)
- XP totals
- Gym membership/location (for gym-level boards)
- Challenge opt-in state

**Leaderboard Entry:**
```typescript
type LeaderboardEntry = {
  userId: string;
  username: string;
  avatarUrl?: string;
  value: number;      // score/volume/level
  rank: number;       // position in leaderboard
  change?: number;    // position change since last period
  tier?: string;      // rank tier for Forgerank
  scope: 'friends' | 'gym' | 'global';
};
```

**API Endpoints (Supabase):**
```sql
-- Per-exercise leaderboard (friends)
SELECT user_id, forgerank_score, rank_tier
FROM user_exercise_stats
WHERE exercise_id = $1
AND user_id IN (SELECT friend_id FROM friendships WHERE user_id = $2)
ORDER BY forgerank_score DESC
LIMIT 10;

-- Per-exercise leaderboard (gym)
SELECT ues.user_id, ues.forgerank_score, ues.rank_tier
FROM user_exercise_stats ues
JOIN user_gyms ug ON ug.user_id = ues.user_id
WHERE ues.exercise_id = $1
AND ug.gym_id = $2
ORDER BY ues.forgerank_score DESC
LIMIT 20;
```

---

## UI Design

**Leaderboard Screen:**
- Tab bar: Exercise | Overall | Volume | Level | Challenges
- Scope toggle: Friends | Gym | Global
- List view with position numbers
- User avatar + name + score
- Highlight current user's position
- Pull-to-refresh
- Personal progress indicator (your trend arrow)

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
- Forgerank scoring
- Supabase backend
- User profiles
- Gym Finder / Map feature (for gym-level boards)
- Challenges infrastructure (scheduling, opt-in tracking)

---

## Priority

**Post-launch. Not included in MVP.**

**P1 (first post-launch wave):**
- Per-exercise leaderboard (friends + global)
- Overall Forgerank leaderboard (friends + global)
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
