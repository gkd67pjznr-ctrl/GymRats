# Forgerank Architecture

**Last Updated:** 2026-01-26

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.81 + Expo 54 |
| Language | TypeScript 5.9 (strict mode) |
| Navigation | expo-router (file-based) |
| State | Zustand + AsyncStorage |
| Backend | Supabase (Postgres + Auth) |
| Testing | Jest + React Native Testing Library |

---

## Directory Structure

```
forgerank/
├── app/                        # Screens (expo-router)
│   ├── (tabs)/                 # Tab navigator
│   │   ├── index.tsx          # Home/dashboard
│   │   ├── workout.tsx        # Start workout
│   │   ├── feed.tsx           # Social feed
│   │   ├── body.tsx           # Body stats
│   │   └── profile.tsx        # User profile
│   ├── auth/                   # Login/signup
│   ├── workout/                # Workout screens
│   ├── routines/               # Routine CRUD
│   ├── live-workout.tsx        # Core workout logging
│   └── _layout.tsx             # Root layout
│
├── src/
│   ├── lib/                    # Domain logic
│   │   ├── stores/            # Zustand stores
│   │   ├── hooks/             # React hooks
│   │   ├── validators/        # Input validation
│   │   ├── supabase/          # Supabase client/types
│   │   ├── auth/              # OAuth helpers
│   │   ├── premadePlans/      # Workout plans
│   │   ├── workoutModel.ts    # Core types
│   │   ├── forgerankScoring.ts # Scoring algorithm
│   │   ├── ranks.ts           # Rank utilities
│   │   ├── perSetCue.ts       # PR detection
│   │   └── e1rm.ts            # e1RM calculation
│   │
│   ├── ui/                     # UI layer
│   │   ├── designSystem.ts    # Design tokens
│   │   ├── theme.ts           # Theme hook
│   │   └── components/        # Reusable components
│   │
│   └── data/                   # Static data
│       ├── exercises.ts       # Exercise database
│       └── rankTops.ts        # Verified standards
│
├── supabase/
│   └── migrations/            # SQL migrations
│
├── __tests__/                  # Test files
│
└── docs/                       # Documentation
    ├── FEATURE-MASTER.md
    ├── features/
    ├── progress.md
    └── architecture.md (this file)
```

---

## State Management

### Zustand Stores

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `currentSessionStore` | Active workout | AsyncStorage |
| `workoutStore` | Workout history | AsyncStorage |
| `routinesStore` | Saved routines | AsyncStorage |
| `settingsStore` | User preferences | AsyncStorage |
| `authStore` | Auth state | AsyncStorage |
| `feedStore` | Feed posts | AsyncStorage |
| `friendsStore` | Friend relationships | AsyncStorage |
| `socialStore` | Social data | AsyncStorage |
| `chatStore` | Messages | AsyncStorage |
| `workoutPlanStore` | Current plan | AsyncStorage |

### Store Pattern
```typescript
export const useMyStore = create<MyState>()(
  persist(
    (set, get) => ({
      // State
      data: [],
      hydrated: false,

      // Actions
      addItem: (item) => set(s => ({ data: [...s.data, item] })),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: 'myStore.v2',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
```

---

## Data Flow

### Workout Logging
```
User Input
    ↓
useLiveWorkoutSession (hook)
    ↓
currentSessionStore (Zustand)
    ↓
AsyncStorage (persistence)
    ↓
[On finish]
    ↓
workoutStore (history)
    ↓
[Future: Supabase sync]
```

### PR Detection
```
Set Logged
    ↓
useWorkoutOrchestrator (hook)
    ↓
detectCueForWorkingSet (perSetCue.ts)
    ↓
[Weight PR? Rep PR? e1RM PR?]
    ↓
Cue Toast (UI feedback)
```

---

## Key Domain Types

### WorkoutSet
```typescript
type WorkoutSet = {
  id: string;
  exerciseId: string;
  weightKg: number;
  reps: number;
  timestampMs: number;
}
```

### WorkoutSession
```typescript
type WorkoutSession = {
  id: string;
  startedAtMs: number;
  endedAtMs: number;
  sets: WorkoutSet[];
  routineId?: string;
  routineName?: string;
  planId?: string;
  completionPct?: number;
}
```

### CurrentSession (Live Workout)
```typescript
type CurrentSession = {
  id: string;
  startedAtMs: number;
  selectedExerciseId: string | null;
  exerciseBlocks: string[];
  sets: LoggedSet[];
  doneBySetId: Record<string, boolean>;
  routineId?: string;
  routineName?: string;
  planId?: string;
}
```

---

## Conventions

### IDs
- Use `uid()` from `src/lib/uid.ts`
- Format: 8-character random string

### Timestamps
- Always milliseconds (`Date.now()`)
- Field naming: `*Ms` suffix (e.g., `startedAtMs`)

### Weights
- Internal: Always kilograms
- Display: Convert based on user preference
- Conversion: `src/lib/units.ts`

### Path Alias
- `@/` maps to project root
- Example: `import { X } from '@/src/lib/X'`

---

## Database Schema (Supabase)

### Tables
1. **users** - User profiles
2. **workouts** - Workout sessions (JSONB: sets)
3. **routines** - Saved routines (JSONB: exercises)
4. **friendships** - Friend relationships
5. **posts** - Social feed (JSONB: workout_snapshot)
6. **reactions** - Post reactions
7. **comments** - Post comments
8. **notifications** - User notifications

### Security
- Row Level Security enabled on all tables
- Users can only access their own data
- Friend-based access for social features
- Privacy levels for posts (public/friends)

---

## Navigation

### File-Based Routing (expo-router)
- `app/` folder defines routes
- `(tabs)/` for bottom tab navigator
- `[param].tsx` for dynamic routes
- `_layout.tsx` for layouts

### Main Routes
- `/` - Home (tabs/index)
- `/workout` - Start workout
- `/feed` - Social feed
- `/profile` - User profile
- `/live-workout` - Active workout
- `/auth/login` - Login
- `/auth/signup` - Signup

---

## Error Handling

### Error Boundaries
- Root: `app/_layout.tsx`
- Per-tab: `src/ui/tab-error-boundary.tsx`

### Error Pattern
```typescript
try {
  // risky operation
} catch (error) {
  console.error('[ComponentName] Operation failed:', error);
  // Handle gracefully
}
```

---

## Testing

### Structure
- Unit tests: `src/lib/**/__tests__/`
- Integration: `__tests__/integration/`
- Component: `src/ui/**/__tests__/`

### Configuration
- Jest preset: `jest-expo`
- Coverage target: 85%+

### Run Tests
```bash
npm test                        # All tests
npm test -- --testPathPattern="X"  # Single file
npm run test:coverage           # With coverage
```

---

*See FEATURE-MASTER.md for feature-level documentation.*
