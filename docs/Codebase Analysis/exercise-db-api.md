# ExerciseDB API Integration

**Last Updated:** 2026-01-30
**API Source:** [ExerciseDB on RapidAPI](https://rapidapi.com/developer10/api/exercisedb)

---

## Overview

Integration with ExerciseDB API to expand Forgerank's exercise database from ~870 to 3,000+ exercises. The API provides exercises with GIF demos, muscle mappings, equipment types, and form instructions.

**Key Features:**
- ~3,200 exercises available
- GIF animations for each exercise
- Primary and secondary muscle mappings
- Equipment filtering
- Body part filtering
- Name simplification removes verbose descriptors

---

## API Pricing

| Tier | Price | Requests/Day | Verdict |
|------|-------|--------------|---------|
| **Free** | $0 | 500 | ✅ Start here |
| **Basic** | ~$5/month | 5,000 | Only if real-time sync needed |
| **Pro** | ~$15/month | 50,000 | Overkill for exercise sync |

**Recommendation:** Stay on **Free tier**. 500 requests/day = ~15,000/month. With 14 body parts, you can do full sync every 2-3 days. Daily incremental sync for new exercises uses minimal requests.

---

## Data Being Synced

### Per Exercise

| Field | Example | Description |
|-------|---------|-------------|
| **ID** | `0007` | Unique identifier from API |
| **Name** | `"Barbell Bench Press - Medium Grip"` | Original verbose name |
| **Simplified Name** | `"Barbell Bench Press"` | Cleaned up (we strip modifiers) |
| **Body Part** | `"chest"` | Primary muscle group |
| **Equipment** | `"barbell"` | barbell, dumbbell, cable, etc. |
| **Target Muscle** | `"pectorals"` | Specific primary muscle |
| **Secondary Muscles** | `["triceps", "front deltoids"]` | Array of secondary muscles |
| **Instructions** | `["Lie on bench...", "Lower weight..."]` | Step-by-step form tips |
| **GIF URL** | `"https://.../exercise_1.gif"` | Animated demo |
| **Force Type** | `"push"` | push/pull/static (derived from body part) |
| **Level** | `"intermediate"` | beginner/intermediate/expert |
| **Mechanic** | `"compound"` | compound vs isolation |
| **Category** | `"strength"` | strength/stretching/cardio/plyometrics |

### Body Parts (14 Categories)

```
1. back               (rows, pulldowns, deadlifts)
2. cardio             (running, cycling, rope jumping)
3. chest              (bench press, flys, pushups)
4. core               (planks, crunches, rotations)
5. forearms          (wrist curls, reverse curls)
6. lower arms         (same as forearms)
7. lower legs         (calf raises, tibialis raises)
8. lower back         (hyperextensions, good mornings)
9. neck               (neck curls, lateral raises)
10. shoulders         (presses, lateral raises, rear delt flys)
11. upper arms        (biceps, triceps)
12. upper legs        (quads, hamstrings, adductors, abductors)
13. upper back        (traps, rhomboids, rear delts)
14. waist             (obliques, side bends)
```

### Equipment Types (25+)

```
barbell, dumbbell, ez barbell, olympic barbell, trap bar,
kettlebell, cable, machine, smith machine,
body weight (or bodyweight), assisted,
band, resistance band,
medicine ball, stability ball, bosu ball,
leverages machine, sled machine, stationary bike,
stepmill, elliptical, skierg, upper body ergometer,
weighted, wheel roller, rope,
tire
```

### Total Estimates

| Metric | Count |
|--------|-------|
| **Total Exercises Available** | ~3,200 |
| **Exercises Per Body Part** | ~150-300 |
| **Body Parts to Sync** | 14 |
| **API Requests for Full Sync** | ~14 (one per body part) |
| **Daily Free Tier Allowance** | 500 requests/day |

---

## Name Simplification

The name simplifier removes verbose descriptors to create clean, manageable exercise names.

### What Gets Removed

**Grip Variants:**
- medium grip, narrow grip, wide grip, neutral grip, supinated grip, pronated grip, mixed grip, reverse grip, close grip, shoulder width grip, underhand, overhand, alternating grip, parallel grip, v bar grip

**Stance Variants:**
- narrow stance, wide stance, shoulder width stance, sumo stance, conventional stance, split stance, single leg, one leg, unilateral

**Position Variants:**
- seated, standing, lying, incline, decline, flat, bent over, upright, leaning, on knees

**Other Descriptors:**
- with bands, with chains, with dumbbells, with barbell, with cable, with ez bar, with machine, behind neck, behind head, to chest, to chin, to floor, to hip, to knees, underhand, overhand, supinated, pronated

### Examples

| Original | Simplified | Removed |
|----------|------------|---------|
| Barbell Bench Press - Medium Grip | Barbell Bench Press | medium grip |
| Dumbbell Shoulder Press - Neutral Grip | Dumbbell Shoulder Press | neutral grip |
| Barbell Squat - Narrow Stance | Barbell Squat | narrow stance |
| Seated Cable Row - Close Grip | Cable Row | seated, close grip |
| Incline Dumbbell Fly - Flat | Dumbbell Fly | incline, flat |
| Standing Barbell Curl - Underhand | Barbell Curl | standing, underhand |

---

## Usage

### Setup

1. **Get API Key:**
   - Go to [ExerciseDB on RapidAPI](https://rapidapi.com/developer10/api/exercisedb)
   - Sign up for free account
   - Get your API key

2. **Add to `.env`:**
   ```bash
   EXPO_PUBLIC_EXERCISEDB_API_KEY=your_key_here
   ```

### Programmatic Usage

```typescript
import {
  initialSync,
  syncBodyPart,
  getSyncProgress,
  getSyncedExercises,
  isSyncComplete,
} from '@/src/lib/exerciseAPI';

// Check sync progress
const progress = await getSyncProgress();
console.log(`${progress.completed}/${progress.total} body parts synced (${progress.percent}%)`);

// Sync a single body part
const newExercises = await syncBodyPart('chest', (current, total, name) => {
  console.log(`Fetching ${current}/${total}: ${name}`);
});

// Initial full sync (all body parts)
const result = await initialSync((current, total, bodyPart) => {
  console.log(`Syncing ${current}/${total}: ${bodyPart}`);
});
console.log(`Total: ${result.total}, New: ${result.new}`);

// Get all synced exercises as Forgerank format
const exercises = await getSyncedExercises();

// Check if sync is complete
const complete = await isSyncComplete();
```

### Directive Trigger

Say **"exercise db sync"** or **"sync exercises"** and Claude will:
1. Check current sync progress
2. Sync the next body part
3. Report results and ask to continue

See `CLAUDE_WORKFLOW.md` for full directive details.

---

## File Structure

```
src/lib/exerciseAPI/
├── index.ts                    # Module exports
├── exerciseDBService.ts        # API client (fetch, body parts, equipment)
├── nameSimplifier.ts           # Name cleanup logic
├── syncService.ts              # Sync orchestration with AsyncStorage caching
└── __tests__/
    ├── nameSimplifier.test.ts   # 27 tests ✅
    └── syncService.test.ts      # 9 tests ✅
```

---

## What Gets Stored Locally

After sync, each exercise is stored with:

```typescript
{
  id: string;                    // API ID
  name: string;                  // Simplified name (for display)
  force: 'push' | 'pull' | 'static';
  level: 'beginner' | 'intermediate' | 'expert';
  mechanic: 'compound' | 'isolation';
  equipment: string;             // Standardized equipment name
  primaryMuscles: MuscleGroup[]; // Mapped to our MuscleGroup type
  secondaryMuscles: MuscleGroup[];
  instructions: string[];
  category: 'strength' | 'stretching' | 'cardio' | 'plyometrics';
  images: string[];              // GIF URLs
  isPopular: boolean;            // false for API exercises
}
```

---

## Ongoing Sync Strategy

### Daily Target
- **Sync 1-2 body parts per day** (~100-200 exercises)
- **Target:** 3,000+ exercises within 60 days
- **Free tier:** 500 requests/day = plenty for daily sync

### Weekly Target
- Update bundled JSON file with synced exercises
- Commit new exercises to codebase
- Release app update with expanded exercise database

### Avoiding Duplicates
- Name simplification removes variants
- Duplicate detection via simplified names
- AsyncStorage caching tracks synced exercises

---

## Data Not Captured (API Limitations)

ExerciseDB API does NOT provide:
- ✅ Verified e1RM standards (we add these manually)
- ✅ Exercise popularity (we track this ourselves)
- ✅ User ratings/reviews (not available)
- ✅ Exercise difficulty level (we default to "intermediate")

---

## Tests

- **Name Simplifier:** 27 tests passing ✅
- **Sync Service:** 9 tests passing ✅
- **Total:** 36 tests passing ✅

---

## References

- API Documentation: [apidocs.exercisedb.io](https://apidocs.exercisedb.io)
- RapidAPI Marketplace: [ExerciseDB](https://rapidapi.com/developer10/api/exercisedb)
- Feature File: `docs/features/feature-exercises.md`
- Workflow Directive: `docs/CLAUDE_WORKFLOW.md`
