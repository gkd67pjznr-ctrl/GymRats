# Feature: Leaderboards

## Overview
Competition among friends through various ranking systems. Encourages engagement and friendly competition without affecting core Forgerank scoring integrity.

---

## Sub-Features

### Planned - Per-Exercise Leaderboard
- [ ] Rank friends by Forgerank score per exercise
- [ ] Show top 10 friends per exercise
- [ ] Display score and rank tier
- [ ] Filter by exercise category
- [ ] See your position highlighted

---

### Planned - Overall Forgerank Leaderboard
- [ ] Average Forgerank across all exercises
- [ ] Or total combined score option
- [ ] Friends-only view
- [ ] Global view (future)
- [ ] Weekly/monthly/all-time filters

---

### Planned - Volume Leaderboard
- [ ] Total sets logged
- [ ] Total volume (weight x reps)
- [ ] Workout frequency
- [ ] Weekly/monthly periods
- [ ] "Who's grinding the most" metric

---

### Planned - User Level Leaderboard
- [ ] XP-based ranking
- [ ] Current level display
- [ ] XP earned this week/month
- [ ] Friends comparison

---

## Technical Notes

**Data Requirements:**
- Friends list
- Forgerank scores per exercise per user
- Workout history (for volume)
- XP totals

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
};
```

**API Endpoints (Supabase):**
```sql
-- Per-exercise leaderboard
SELECT user_id, forgerank_score, rank_tier
FROM user_exercise_stats
WHERE exercise_id = $1
AND user_id IN (SELECT friend_id FROM friendships WHERE user_id = $2)
ORDER BY forgerank_score DESC
LIMIT 10;
```

---

## UI Design

**Leaderboard Screen:**
- Tab bar: Exercise | Overall | Volume | Level
- List view with position numbers
- User avatar + name + score
- Highlight current user's position
- Pull-to-refresh

**Leaderboard Card (Mini View):**
- Top 3 friends for an exercise
- Shown on exercise detail screen
- "See full leaderboard" link

---

## Anti-Gaming Considerations

- Forgerank is based on verified standards (can't be inflated)
- Volume leaderboards only affect volume ranking
- No rewards for top positions (bragging rights only)
- Anomaly detection still applies

---

## Dependencies

- Friends system
- Forgerank scoring
- Supabase backend
- User profiles

---

## Priority

**P1 (Phase 3):**
- Per-exercise leaderboard
- Overall Forgerank leaderboard

**P2 (Phase 4+):**
- Volume leaderboard
- Level leaderboard
- Global leaderboards (beyond friends)
