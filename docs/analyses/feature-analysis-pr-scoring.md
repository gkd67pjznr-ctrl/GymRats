# PR Detection & Scoring System Analysis

**Date**: 2026-02-06
**Analyst**: Claude Opus 4.5
**Feature**: PR Detection & GymRank Scoring System

## Summary

The PR Detection & Scoring System is the gamification core of GymRats. This analysis identified **1 critical type safety bug** (missing tier property), **1 high-priority input validation gap** (negative weights), and several testing gaps. All issues have been fixed, and comprehensive tests have been added.

The scoring algorithms are mathematically sound, with good defensive programming. The PR detection priority system (Weight > Rep > e1RM) is correctly implemented.

## Files Analyzed

| File | Lines | Complexity | Assessment |
|------|-------|------------|------------|
| `src/lib/perSetCue.ts` | 250 | Medium | Core PR detection, well-structured |
| `src/lib/perSetCueTypes.ts` | 145 | Low | Type definitions, clean |
| `src/lib/GrScoring.ts` | 365 | High | Scoring algorithm, comprehensive |
| `src/lib/ranks.ts` | 176 | Medium | Rank ladder system, clean |
| `src/lib/e1rm.ts` | 16 | Low | Epley formula, simple |
| `src/lib/buckets.ts` | 23 | Low | Weight bucketing, clean |
| `src/data/rankTops.ts` | 48 | Low | Verified standards, delegated to exerciseDatabase |
| `src/lib/celebration/selector.ts` | 149 | Medium | Celebration selection, well-designed |
| `src/lib/celebration/content.ts` | 430 | Medium | Celebration content registry |
| `src/lib/celebration/types.ts` | 197 | Low | Type definitions, comprehensive |

## Issues Found & Fixed

### Critical (Must Fix) - FIXED

1. **Missing tier property in DetectCueMeta**
   - **File**: `src/lib/perSetCueTypes.ts`, `src/lib/perSetCue.ts`
   - **Issue**: `useWorkoutOrchestrator.ts:221` accessed `meta.tier` which didn't exist on the type, causing it to always be undefined
   - **Impact**: Gamification PR rewards were not being calculated with correct tier scaling
   - **Fix Applied**:
     - Added `CelebrationTier` type (1 | 2 | 3 | 4) to perSetCueTypes.ts
     - Added `tier` property to `DetectCueMeta` interface
     - Added `calculateTier()` function to perSetCue.ts
     - All PR detection return statements now include calculated tier

### High Priority - FIXED

1. **Negative weight handling in e1rm.ts**
   - **File**: `src/lib/e1rm.ts`
   - **Issue**: `estimate1RM_Epley()` only checked `reps <= 0`, not negative weights
   - **Impact**: Negative weights could produce invalid e1RM values
   - **Fix Applied**: Added guards for `weightKg <= 0` and `!Number.isFinite()` checks

### Medium Priority - FIXED

1. **Missing GrScoring test suite**
   - **File**: Created `__tests__/lib/GrScoring.test.ts`
   - **Issue**: Critical scoring algorithm had no dedicated tests
   - **Impact**: Algorithm changes could introduce regressions
   - **Fix Applied**: Created comprehensive 32-test suite covering all scoring aspects

2. **Missing edge case tests in perSetCue.test.ts**
   - **File**: `__tests__/lib/perSetCue.test.ts`
   - **Issue**: Several edge cases untested (PR priority, tier calculation, boundaries)
   - **Fix Applied**: Added 21 new tests for PR priority, tier calculation, cardio boundaries, unit consistency, and e1RM edge cases

### Low Priority (Not Fixed - Pre-existing)

1. **TypeScript errors in test files**
   - `__tests__/hooks/useWorkoutOrchestrator.test.ts` has multiple pre-existing type issues
   - `__tests__/ui/DrawerContent.prIntegration.test.ts` has type mismatches
   - These are test infrastructure issues, not core algorithm bugs

2. **Duplicate clamp01 implementations**
   - `clamp01()` exists in both `ranks.ts` and `GrScoring.ts`
   - Could be consolidated into a shared utilities file

## Algorithm Analysis

### PR Detection (`perSetCue.ts`)

**Priority Order**: Weight PR > Rep PR > e1RM PR > None

This is the correct order because:
1. Weight PR is the most significant achievement (new maximum load)
2. Rep PR at same weight shows work capacity improvement
3. e1RM PR can be achieved without either (different rep schemes)

**Cardio Threshold**: 16+ reps
- Sets with 16+ reps return "cardio" type with LOW intensity
- This prevents high-rep sets from triggering PR celebrations inappropriately

**Tier Calculation**:
```
Tier 1: deltaLb < 5    (Small PR)
Tier 2: deltaLb < 10   (Medium PR)
Tier 3: deltaLb < 20   (Big PR)
Tier 4: deltaLb >= 20  (Massive PR)
```

### GymRank Scoring (`GrScoring.ts`)

**Score Components**:
| Component | Max Points | Description |
|-----------|------------|-------------|
| Base Strength | ~700 | e1RM/BW ratio using nonlinear curve |
| Rep Quality | ~72 | Bonus for quality reps at high load |
| Volume Bonus | ~60 | Tonnage-based (diminishing) |
| Consistency | ~70 | Sessions in last 14 days |
| PR Bonus | ~55 | Beating previous best |

**Tier Thresholds**:
| Tier | Min Score | Description |
|------|-----------|-------------|
| Iron | 0 | Beginner |
| Bronze | 180 | Novice |
| Silver | 320 | Intermediate |
| Gold | 470 | Experienced |
| Platinum | 620 | Advanced |
| Diamond | 770 | Elite |
| Mythic | 900 | World-class |

**Anti-cheat Heuristics**:
1. **Implausible Jump**: >12% e1RM gain triggers penalty
2. **Implausible Set**: 20+ reps at RPE 9.5+ is flagged
3. **Too Light**: e1RM < 10kg is unrankable (returns 0)

### e1RM Formula (`e1rm.ts`)

Uses Epley formula: `e1RM = weight * (1 + reps/30)`

- Accurate for 1-12 rep range
- Increasingly speculative above 12 reps
- Returns weight for single rep (mathematically correct)

### Rank Ladder (`ranks.ts`)

**Configuration**:
- 20 ranks per exercise
- Curve exponent: 1.75 (early ranks easier, late ranks harder)

**Threshold Calculation**: `threshold[i] = topE1RM * (i/20)^1.75`

This means:
- Rank 1: 0.3% of top e1RM
- Rank 10: 18% of top e1RM
- Rank 20: 100% of top e1RM (world record territory)

### Weight Bucketing (`buckets.ts`)

**Bucket Steps**:
- kg unit: 1.0 kg steps
- lb unit: 2.5 lb steps

This aligns with common plate increments.

## Performance Analysis

All algorithms are O(1) or O(n) with small n:
- `detectCueForWorkingSet`: O(1) - simple comparisons
- `scoreGymRank`: O(n) where n ≈ 6-8 parts - constant time
- `buildRankThresholdsKg`: O(n) where n = 20 ranks - negligible
- `getRankFromE1RMKg`: O(n) linear search - could use binary search for large rank counts, but unnecessary for 20 ranks

No performance concerns identified.

## Test Coverage

### New Tests Added

| File | Tests Added | Total Tests |
|------|-------------|-------------|
| `__tests__/lib/GrScoring.test.ts` | 32 | 32 (new file) |
| `__tests__/lib/perSetCue.test.ts` | 21 | 33 |
| `__tests__/lib/celebration/selector.test.ts` | 0 | 18 (existing) |

**Total**: 83 tests for PR/Scoring system

### Test Categories

**GrScoring.test.ts**:
- Basic scoring (2 tests)
- e1RM calculation (3 tests)
- Tier assignment (3 tests)
- Bodyweight normalization (2 tests)
- Sex adjustment (1 test)
- PR bonus (2 tests)
- Consistency bonus (1 test)
- Anti-cheat heuristics (3 tests)
- Unit conversion (1 test)
- Edge cases (4 tests)
- scoreFromE1rm (3 tests)
- Score breakdown parts (3 tests)
- DEFAULT_TIERS constant (4 tests)

**perSetCue.test.ts (enhanced)**:
- PR priority order (3 tests)
- Celebration tier calculation (5 tests)
- Cardio boundary tests (2 tests)
- Unit system consistency (2 tests)
- e1RM calculation (9 tests)

## Integration Points

### Connection to Core Workout (Part 1)

From `useWorkoutOrchestrator.ts`:
```typescript
const res: DetectCueResult = detectCueForWorkingSet({
  weightKg: wKg,
  reps,
  unit,
  exerciseName: exerciseName(exerciseId),
  prev,
});
```

The orchestrator:
1. Calls `detectCueForWorkingSet()` for each logged set
2. Uses `meta.tier` to scale gamification rewards
3. Triggers `onPRCelebration` callback for UI feedback
4. Records PR counts in session state

### Connection to AI Buddy System (Next Analysis)

The buddy system uses PR detection results:
- `evaluateSetTriggers()` receives the full `DetectCueResult`
- PR type and tier influence buddy message selection
- Voice lines are triggered for high-intensity PR cues

### Connection to Celebration System

`celebration/selector.ts` uses tier for celebration selection:
```typescript
const tier = deltaToTier(deltaLb);
const celebration = CELEBRATIONS.find(c =>
  c.prType === celebrationType &&
  c.tier === tier
);
```

## Changes Made

### src/lib/perSetCueTypes.ts
1. Added `CelebrationTier` type definition (1 | 2 | 3 | 4)
2. Added `tier: CelebrationTier` property to `DetectCueMeta` interface

### src/lib/perSetCue.ts
1. Changed from `export type` to `import type` + `export type` pattern
2. Added `calculateTier()` helper function
3. Added `tier` to all `DetectCueResult` return statements
4. Rep PR now calculates effective delta for tier (e1RM delta or rep delta * 3)

### src/lib/e1rm.ts
1. Added JSDoc documentation
2. Added `weightKg <= 0` guard
3. Added `!Number.isFinite()` guards for both inputs

### src/lib/hooks/useWorkoutOrchestrator.ts
1. Removed `as number | undefined` cast from `meta.tier` (now properly typed)

### __tests__/lib/GrScoring.test.ts
1. Created comprehensive test suite (32 tests)

### __tests__/lib/perSetCue.test.ts
1. Added e1RM import
2. Added 21 new tests for edge cases and verification

## Verification

### TypeScript Compilation
```bash
npx tsc --noEmit --skipLibCheck src/lib/perSetCue.ts src/lib/perSetCueTypes.ts src/lib/e1rm.ts src/lib/GrScoring.ts src/lib/ranks.ts src/lib/buckets.ts
# Result: No errors
```

### Test Results
```bash
npm test -- __tests__/lib/perSetCue.test.ts __tests__/lib/GrScoring.test.ts __tests__/lib/celebration/selector.test.ts --no-coverage
# Result: 83 passed, 0 failed
```

## Recommendations

### Immediate (This Session) - DONE
1. ~~Add tier to DetectCueMeta~~ - Fixed
2. ~~Add negative weight handling~~ - Fixed
3. ~~Create GrScoring.test.ts~~ - Created
4. ~~Enhance perSetCue.test.ts~~ - Enhanced

### Future Improvements

1. **Consider caching rank thresholds**
   - `buildRankThresholdsKg` could memoize results per exercise
   - Low priority - function is fast and rarely called

2. **Consolidate utility functions**
   - `clamp01` exists in multiple files
   - Create shared `src/lib/utils/math.ts`

3. **Add recovery PR detection**
   - Type exists (`PRType` includes 'recovery')
   - Logic not implemented - would detect comeback after strength decline

4. **Consider percentile-based tier calculation**
   - Current fixed thresholds (5/10/20 lb) may not scale well
   - Alternative: tier based on % improvement

---

## Celebration System Deep Dive

### Architecture

The celebration system is designed for future AI-generated content:

```
src/lib/celebration/
  ├── types.ts           - Core types (Celebration, CelebrationTier, etc.)
  ├── content.ts         - Asset registry and text templates
  ├── selector.ts        - Celebration selection logic
  ├── personalities.ts   - Multi-personality cue system
  ├── personalityCues.ts - Personality-based cue generation
  └── index.ts           - Public exports
```

### Content Key System

Content keys enable future AI content swapping:
```typescript
contentKey: `${prType}_tier_${tier}_${variant}`
// Example: "weight_tier_3_b"
```

Current v1 uses emoji fallbacks:
```typescript
ASSET_REGISTRY = {
  'weight_tier_1_a': { emoji: '\u{1f4aa}', aspectRatio: 1 },
  'weight_tier_4_a': { emoji: '\u{1f3c6}', aspectRatio: 1 },
  // etc.
}
```

### Personality System

Five personalities with distinct voices:
1. **Classic Motivator** - Traditional, encouraging (default)
2. **Hype Beast** - High energy, Gen Z slang
3. **Zen Coach** - Calm, philosophical
4. **Training Android** - Robotic, analytical
5. **Old School Lifter** - Tough love, veteran

Each personality has cue pools for:
- `pr_weight`, `pr_rep`, `pr_e1rm`, `pr_cardio`
- `rest_timer`, `streak`, `rank_up`, `fallback`
- `workout_start`, `workout_end`, `anomaly`

### Sound & Haptics

Sound effects scale with tier:
```typescript
tier 1-2: 'spark' at 0.7-0.9 volume
tier 3:   'triumph' at 1.0 volume
tier 4:   'powerup' at 1.0 volume
```

Haptic patterns:
- Tier 1: `{ type: 'success' }`
- Tier 2+: `{ type: 'heavy', repeats: tier >= 3 ? tier - 1 : 1, delayMs: 100 }`

### PRCelebration Component

`src/ui/components/LiveWorkout/PRCelebration.tsx` implements:
- Full-screen modal overlay
- Animated entrance (scale + translateY springs)
- Glow effect with pulsing animation (theme-configurable)
- Confetti particle effects (theme-configurable)
- Tier-based color coding
- Share and dismiss buttons

Theme integration points:
- `motion.durationScale` - Animation speed multiplier
- `motion.enableGlow` - Glow effect toggle
- `motion.enableParticles` - Confetti toggle
- `celebrations.prCelebration.intensity` - Particle intensity

## Detailed Integration Flow

### Set Logging Flow

```
User logs set
    |
    v
useWorkoutOrchestrator.addSetForExercise()
    |
    +-- detectCueForWorkingSet()
    |       |
    |       +-- Returns: { cue, next, meta }
    |              - cue: PR message or null
    |              - next: Updated exercise state
    |              - meta: { type, tier, deltas, isCardio, weightLabel }
    |
    +-- evaluateSetTriggers() [buddy system]
    |       |
    |       +-- Uses DetectCueResult to generate buddy message
    |
    +-- If PR detected:
    |       |
    |       +-- pickPunchyVariant(type) - Select celebration text
    |       +-- calculatePRReward(type, tier) - Award Forge Tokens
    |       +-- onPRCelebration(params) - Trigger UI celebration
    |
    +-- Update session state with PR counts
```

### Session State Tracking

`CurrentSession` tracks PRs during workout:
```typescript
{
  prCount: number;      // Total PRs this session
  weightPRs: number;    // Weight PRs count
  repPRs: number;       // Rep PRs count
  e1rmPRs: number;      // e1RM PRs count
  exerciseStates: Record<string, ExerciseSessionState>;
}
```

### Gamification Token Rewards

PR detection feeds into gamification:
```typescript
const { calculatePRReward } = require("../gamification");
const { addGamificationTokens } = require("../stores/gamificationStore");
const reward = calculatePRReward(prType, tier);
addGamificationTokens(reward.amount);
```

## Edge Cases & Known Limitations

### PR Detection Limitations

1. **No historical context within session**
   - First set of session is always a "PR" if > 0
   - Could integrate with workout history for true first-ever PRs

2. **Cardio threshold fixed at 16 reps**
   - May not be appropriate for all exercises
   - Could be exercise-specific in future

3. **Recovery PR not implemented**
   - `PRType` includes 'recovery' but logic doesn't detect it
   - Would need to track strength decline periods

### Scoring System Limitations

1. **Sex adjustment is mild**
   - Female: 1.08x multiplier
   - Male: 1.0x (baseline)
   - Unspecified: 1.02x
   - Could be more nuanced based on exercise type

2. **Consistency bonus has no exercise specificity**
   - `sessionsInLast14Days` is global, not per-exercise
   - Bench press sessions don't boost squat consistency

3. **Anti-cheat is conservative**
   - 12% jump threshold may flag legitimate post-injury returns
   - Could add "recovery mode" flag for known deload periods

## Dependencies for AI Buddy System Analysis

The AI Buddy System (next analysis) depends on:

1. **DetectCueResult** from `perSetCue.ts`
   - Used by `evaluateSetTriggers()` to generate buddy messages
   - `meta.type` and `meta.tier` influence message selection

2. **Personality system** from `celebration/personalities.ts`
   - Buddy messages use personality-based cue pools
   - Tier-to-intensity mapping (`tierToIntensity()`)

3. **PR type mapping** via `prTypeToContext()`
   - Converts `PRType` to `CueContext` for personality lookup

4. **Session state** from `currentSessionStore.ts`
   - Tracks PR counts for session-level buddy triggers
   - `exerciseStates` used for streak detection

---

**Next Analysis**: AI Gym Buddy System
- Files: `src/lib/buddyEngine.ts`, `src/lib/buddyData.ts`, `src/lib/stores/buddyStore.ts`
- Dependencies: Uses `DetectCueResult` from PR detection
- Integration: `evaluateSetTriggers()` receives PR detection results
