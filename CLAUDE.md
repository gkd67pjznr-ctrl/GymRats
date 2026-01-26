# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Forgerank is a React Native workout tracking app built with Expo. Key features:
- Live workout logging with real-time PR detection
- 20-rank scoring system per exercise (Iron → Mythic)
- Social feed with posts, reactions, and friend filtering
- Routine builder and pre-made workout plans
- Workout history with calendar view
- Resume-able workouts (survives app close)

## Development Commands

```bash
# Start development server (tunnel mode for Expo Go testing)
npm start

# Platform-specific development
npm run android          # Start Android emulator/device
npm run ios              # Start iOS simulator/device
npm run web              # Start web version

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode for TDD
npm run test:coverage    # Generate coverage report

# Linting
npm run lint             # ESLint via Expo config
```

### Running a Single Test
```bash
npm test -- __tests__/lib/perSetCue.test.ts
npm test -- --testPathPattern="currentSessionStore"
```

## Tech Stack

- **Expo 54** with React Native 0.81 (New Architecture enabled)
- **expo-router** for file-based navigation
- **TypeScript 5.9** with strict mode
- **Zustand** for state management
- **AsyncStorage** for local persistence
- **Supabase** for backend (auth, database - partially integrated)
- **Jest + React Native Testing Library** for testing

## Directory Structure

```
app/                        # Screens/routes (expo-router file-based routing)
├── (tabs)/                 # Bottom tab navigator
│   ├── index.tsx          # Home/dashboard
│   ├── workout.tsx        # Start workout entry point
│   ├── feed.tsx           # Social feed
│   ├── body.tsx           # Body stats (future)
│   └── profile.tsx        # User profile
├── auth/                   # Login/signup screens
├── workout/                # Workout-related screens
│   ├── plans/[category].tsx
│   ├── plan-detail/[id].tsx
│   └── [sessionId].tsx    # Workout history detail
├── routines/               # Routine CRUD
├── debug/                  # Debug screens (ranks visualization)
├── live-workout.tsx        # Core workout logging experience
└── _layout.tsx             # Root layout with error boundary

src/
├── lib/                    # Domain logic and state
│   ├── stores/            # Zustand stores (preferred pattern)
│   │   ├── currentSessionStore.ts   # Active workout state
│   │   ├── workoutStore.ts          # Workout history
│   │   ├── authStore.ts             # Auth state
│   │   └── settingsStore.ts         # User preferences
│   ├── hooks/              # React hooks
│   │   ├── useLiveWorkoutSession.ts # Live workout logic
│   │   └── useWorkoutTimer.ts       # Timer functionality
│   ├── validators/         # Input validation
│   ├── supabase/           # Supabase client and types
│   ├── auth/               # OAuth (Google, Apple)
│   ├── premadePlans/       # Pre-built workout plans
│   ├── workoutModel.ts     # Core workout types
│   ├── forgerankScoring.ts # Scoring algorithm
│   ├── ranks.ts            # Rank ladder utilities
│   ├── perSetCue.ts        # PR detection per set
│   ├── e1rm.ts             # Estimated 1-rep max (Epley formula)
│   └── buckets.ts          # Weight bucketing for rep PRs
├── ui/                     # UI layer
│   ├── designSystem.ts     # Design tokens (colors, spacing, typography)
│   ├── theme.ts            # useThemeColors() hook
│   └── components/         # Reusable components
│       └── LiveWorkout/    # Live workout UI components
└── data/                   # Static datasets
    ├── exercises.ts        # Exercise definitions
    └── rankTops.ts         # Verified top e1RMs per exercise
```

## Key Domain Concepts

### Workout Model (`src/lib/workoutModel.ts`)

```typescript
type WorkoutSet = {
  id: string;
  exerciseId: string;    // e.g., "bench", "squat"
  weightKg: number;      // Always stored in kg internally
  reps: number;
  timestampMs: number;
};

type WorkoutSession = {
  id: string;
  startedAtMs: number;
  endedAtMs: number;
  sets: WorkoutSet[];
  routineId?: string;    // Optional link to routine
  planId?: string;       // Optional link to plan
  completionPct?: number; // 0-1 for planned workouts
};
```

### Forgerank Scoring (`src/lib/forgerankScoring.ts`)

Scoring algorithm that rates sets from 0-1000:
- **Base strength** (dominant): e1RM/bodyweight ratio using nonlinear curve
- **Rep quality**: Bonus for quality reps at high load (diminishing after 12)
- **Volume bonus**: Small reward for actual work volume
- **Consistency bonus**: Sessions in last 14 days
- **PR bonus**: Modest reward for beating previous best

**7 Tiers** (by score threshold):
- Iron (0), Bronze (180), Silver (320), Gold (470)
- Platinum (620), Diamond (770), Mythic (900)

**Anti-cheat heuristics**: Flags implausible jumps (>12% e1RM gain), implausible sets (20+ reps at max effort), too-light weights (<10kg e1RM).

### Ranks System (`src/lib/ranks.ts`)

20-rank ladder per exercise based on verified world-class standards:
- Uses top e1RMs from `src/data/rankTops.ts`
- Curve-based distribution (early ranks easier to achieve)
- Each exercise has independent ladder

### PR Detection (`src/lib/perSetCue.ts`)

Detects three types of PRs per working set:
1. **Weight PR**: New heaviest weight lifted
2. **Rep PR**: More reps at same weight bucket
3. **e1RM PR**: New estimated 1-rep max

Priority: Weight > Rep > e1RM. Returns cue with intensity level (low/high).

### e1RM Calculation (`src/lib/e1rm.ts`)

Uses Epley formula: `e1RM = weight × (1 + reps/30)`

### Current Session Store (`src/lib/stores/currentSessionStore.ts`)

Zustand store persisted to AsyncStorage (`currentSession.v2`):
- Survives app close for workout resume
- Tracks: sets, selected exercise, exercise blocks, done states
- Flushes writes on app background via AppState listener

## State Management

The codebase uses **Zustand** with AsyncStorage persistence:

```typescript
// Reading state in components
const session = useCurrentSession();
const { session, hydrated } = useCurrentSessionStore();

// Imperative updates (for non-React code)
updateCurrentSession(s => ({ ...s, sets: [...s.sets, newSet] }));
clearCurrentSession();
```

**Hydration**: Always check `useIsHydrated()` before rendering UI that depends on persisted state.

## Design System (`src/ui/designSystem.ts`)

"Pure" aesthetic: dark UI, sharp contrast, neon accents.

**Accent themes**: toxic (lime), electric (purple), ember (pink), ice (cyan), ultra (mixed)

**Usage**:
```typescript
const ds = makeDesignSystem("dark", "toxic");
// ds.tone.bg, ds.tone.card, ds.tone.text, ds.tone.accent
// ds.space.x4 (16px), ds.radii.lg (20px)
// ds.type.h1.size, ds.type.body.w
```

**Rank colors**: `ds.tone.iron`, `ds.tone.bronze`, ... `ds.tone.mythic`

## Live Workout Flow

`app/live-workout.tsx` orchestrates the core experience:

1. **Start**: Creates or resumes `CurrentSession`
2. **Exercise selection**: User picks exercise from blocks or picker
3. **Set logging**: Weight + reps → creates `LoggedSet`
4. **PR detection**: `detectCueForWorkingSet()` → shows toast if PR
5. **Persistence**: Each update saves to AsyncStorage
6. **Finish**: Converts `LoggedSet[]` → `WorkoutSet[]`, creates `WorkoutSession`

Key components:
- `ExerciseBlocksCard`: Shows workout structure
- `QuickAddSetCard`: Fast set entry
- `ExercisePicker`: Exercise selection modal
- `InstantCueToast`: PR feedback display
- `RestTimerOverlay`: Rest timer between sets

## Testing

Tests location: `__tests__/` and `src/lib/**/__tests__/`

**Configuration** (`jest.config.js`):
- Preset: `jest-expo`
- Test pattern: `**/__tests__/**/*.test.ts?(x)`
- Coverage from: `src/**/*.{ts,tsx}`

**Coverage targets**:
- Scoring algorithm: 100%
- PR detection: 100%
- Data transformations: 90%+
- Stores: High coverage for persistence logic

## Path Alias

`@/` maps to project root:
```typescript
import { useThemeColors } from '@/src/ui/theme';
import { EXERCISES_V1 } from '@/src/data/exercises';
```

## Environment Variables

Required for Supabase integration:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Important Conventions

### Weight Storage
- All weights stored internally in **kilograms**
- Conversion happens at display layer using `src/lib/units.ts`
- User preference for lb/kg stored in settings

### IDs
- Use `uid()` from `src/lib/uid.ts` for generating unique IDs
- Format: 8-character random string

### Exercise IDs
Standard IDs from `src/data/exercises.ts`:
- `bench`, `squat`, `deadlift`, `ohp`, `row`, `pullup`
- `incline_bench`, `rdl`, `leg_press`, `lat_pulldown`

### Timestamps
- Always use milliseconds (`Date.now()`)
- Field naming: `*Ms` suffix (e.g., `startedAtMs`, `timestampMs`)

## Deprecated Code

`src/lib/_old/` contains deprecated modules excluded from TypeScript compilation. Do not import from this directory. These are kept for reference during migration.

## Common Patterns

### Creating a new Zustand store
```typescript
export const useMyStore = create<MyState>()(
  persist(
    (set, get) => ({
      // state and actions
    }),
    {
      name: 'myStore.v1',
      storage: createQueuedJSONStorage(),
    }
  )
);
```

### Adding a new exercise
1. Add to `EXERCISES_V1` in `src/data/exercises.ts`
2. Add verified top to `src/data/rankTops.ts`

### Adding a new screen
1. Create file in `app/` following expo-router conventions
2. Dynamic routes: `[param].tsx`, catch-all: `[...slug].tsx`
3. Tab screens go in `app/(tabs)/`
