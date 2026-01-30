# Feature: Forge Milestones

## Overview
Non-repeatable lifetime achievements with tiered rarity. Prestige markers that show long-term dedication. Displayed as trophies on profile with special visual treatment by rarity.

**Status:** Done | **Progress:** 5/5 features
**Priority:** Launch (v1)
**Source:** 2026-01-29 brainstorm interview

---

## Sub-Features

### ✅ Done - Common Tier Milestones
- [x] First workout completed
- [x] 10 workouts logged
- [x] First PR achieved
- [x] First rank-up
- [x] 7-day streak
- [x] 5 different exercises logged
- [x] First workout shared to feed

**Visual:** Standard badge, subtle border

---

### ✅ Done - Rare Tier Milestones
- [x] 100 workouts logged
- [x] 30-day streak
- [x] 5 exercises ranked (any tier)
- [x] 50 PRs achieved
- [x] 10 different exercises logged
- [x] Level 10 reached
- [x] 1,000 total sets logged

**Visual:** Blue/purple tint, slight glow

---

### ✅ Done - Epic Tier Milestones
- [x] 1000lb club (squat + bench + deadlift total)
- [x] All exercises ranked Silver or above
- [x] Year-long streak (365 days)
- [x] 500 workouts logged
- [x] 100 PRs achieved
- [x] 3 exercises ranked Gold or above
- [x] Level 25 reached
- [x] 10,000 total sets logged

**Visual:** Gold/orange glow, animated border

---

### ✅ Done - Legendary Tier Milestones
- [x] All exercises ranked Gold or above
- [x] 2-year streak
- [x] 1,000 workouts logged
- [x] Any exercise ranked Diamond
- [x] Any exercise ranked Mythic
- [x] 500 PRs achieved
- [x] Level 50 reached

**Visual:** Prismatic/rainbow glow, particle effects, special animation on profile

**Design principle:** Legendary milestones should be genuinely hard. Top 1% of users. Seeing one on someone's profile should be impressive.

---

### ✅ Done - Trophy Case on Profile
- [x] Dedicated section on user profile
- [x] Grid layout of earned milestones
- [x] Rarity-based visual treatment (border color, glow, animation)
- [x] Locked milestones shown as silhouettes with progress
- [x] Tap milestone to see details + date earned
- [x] Total milestone count displayed
- [x] Rarity breakdown (X common, Y rare, Z epic, W legendary)

---

## Technical Notes

**Data Model:**
```typescript
type Milestone = {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  condition: MilestoneCondition;
};

type MilestoneCondition = {
  type: 'workouts' | 'streak' | 'prs' | 'rank' | 'level' | 'sets' | 'club' | 'custom';
  threshold: number;
  exerciseId?: string;  // For exercise-specific milestones
};

type EarnedMilestone = {
  milestoneId: string;
  userId: string;
  earnedAt: number;     // timestamp ms
};
```

**Checking Logic:**
- Check milestone conditions after each workout completion
- Batch check: don't check every milestone on every set
- Cache earned milestones locally
- Sync to backend for persistence

**Database:**
```sql
CREATE TABLE user_milestones (
  user_id UUID REFERENCES users(id),
  milestone_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, milestone_id)
);
```

---

## UI Design

**Trophy Case on Profile:**
- Section header: "Milestones" with count badge
- Grid of circular/square badges
- Earned: full color with rarity border
- Unearned: greyed out silhouette with progress bar
- Tap: detail modal with name, description, date earned, rarity

**Milestone Earned Toast:**
- Pop-up notification when milestone is achieved
- Rarity-appropriate animation (simple for common, epic for legendary)
- Sound effect per rarity tier
- "View" button to go to trophy case

**Rarity Colors:**
- Common: white/silver border
- Rare: blue/purple glow
- Epic: gold/orange animated glow
- Legendary: prismatic/rainbow with particle effects

---

## Dependencies

- Workout history (for checking conditions)
- Streak system (gamificationStore)
- Rank system (forgerankScoring)
- XP/level system (gamificationStore)
- Backend sync (persistence)

---

## Priority

**P0 (Launch):**
- Common + Rare milestones defined
- Basic trophy case on profile
- Milestone earned toast

**P1 (Launch Polish):**
- Epic + Legendary milestones
- Rarity-based visual effects
- Progress indicators on locked milestones

**P2 (Post-Launch):**
- Hidden/secret milestones
- Milestone sharing to feed
