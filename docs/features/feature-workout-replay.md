# Feature: Workout Replay

## Overview
Cinematic post-workout summary that turns every workout into a shareable moment. Auto-generated animated recap with stat cards, PR highlights, rank changes, and buddy commentary. THE share moment of the app.

**Status:** Implemented | **Progress:** 5/5 features
**Priority:** Launch (v1) — must have
**Source:** 2026-01-29 brainstorm interview

---

## Sub-Features

### Implemented - Animated Stat Cards
- [x] Exercise-by-exercise breakdown (sets, weight, reps)
- [x] Total volume display with animation
- [x] Workout duration
- [x] Card entrance animations (slide, fade, scale)
- [x] Design matches app aesthetic (dark, accent colors)

---

### Implemented - PR Highlights
- [x] Highlight any PRs achieved during workout
- [x] Show PR type (weight, rep, e1RM)
- [x] Buddy personality commentary on each PR
- [x] Visual emphasis (glow, particle effects, accent color)
- [x] Multiple PRs shown sequentially

---

### Implemented - Rank Changes Display
- [x] Show any rank-ups that occurred
- [x] Before → After rank visualization
- [x] Rank tier color coding
- [x] Rank-up animation (tier badge reveal)

---

### Implemented - Buddy Sign-Off
- [x] Personality-driven closing message
- [x] Matches equipped buddy's tone/style
- [x] Different messages based on workout quality
- [x] Streak count mention if notable
- [x] Avatar cameo (if avatar feature is live)

---

### Implemented - Share to In-App Feed
- [x] One-tap share to Forgerank social feed
- [x] Replay converts to a static workout card for the feed
- [x] Optional caption before sharing
- [x] Feed post includes key stats + PR badges
- [x] Focus on in-app sharing (not external platforms like IG/TikTok)

---

## Technical Notes

**Replay Data Model:**
```typescript
type WorkoutReplay = {
  sessionId: string;
  exercises: ReplayExercise[];
  totalVolume: number;
  duration: number;        // ms
  prsAchieved: ReplayPR[];
  rankChanges: ReplayRankChange[];
  buddySignOff: string;    // personality-driven message
  buddyId: string;
};

type ReplayExercise = {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  bestSet: { weight: number; reps: number };
  totalVolume: number;
};

type ReplayPR = {
  exerciseId: string;
  type: 'weight' | 'rep' | 'e1rm';
  value: number;
  previousBest: number;
};

type ReplayRankChange = {
  exerciseId: string;
  oldRank: number;
  newRank: number;
  oldTier: string;
  newTier: string;
};
```

**Animation Approach:**
- React Native Reanimated 3 for animations
- Sequential card reveals (staggered timing)
- Shared element transitions for rank changes
- Confetti/particle effects for PRs (reuse celebration system)
- Total replay duration: 5-10 seconds

**Trigger:**
- Auto-plays when user taps "Finish Workout"
- Can be replayed from workout history
- Can be skipped (tap to skip)

---

## UI Design

**Replay Flow:**
1. Screen fades to dark background
2. Workout title + date + duration appear
3. Exercise cards slide in one by one
4. PR highlights pop in with glow effect
5. Rank changes animate (old badge → new badge)
6. Buddy sign-off message fades in
7. "Share to Feed" + "Done" buttons appear

**Feed Card (After Sharing):**
- Compact version of replay highlights
- Exercise count + volume + duration
- PR badges inline
- Buddy personality flavor text
- User avatar + name + rank badges

---

## Dependencies

- Workout session data (currentSessionStore)
- PR detection (perSetCue.ts)
- Rank calculation (forgerankScoring.ts)
- AI Gym Buddy (personality messages)
- Social feed (sharing)

---

## Priority

**P0 (Launch):**
- Basic replay with stat cards
- PR highlights
- Share to feed

**P1 (Launch Polish):**
- Rank change animations
- Buddy sign-off with personality
- Polish animations
