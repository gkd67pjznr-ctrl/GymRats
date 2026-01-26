# Forgerank Refactoring Guide

**Goal:** Improve code maintainability without breaking existing functionality

---

## Refactor #1: Extract LiveWorkout Logic

**Problem:** `app/live-workout.tsx` is 400+ lines with mixed concerns

### Step 1: Create Custom Hook

**File:** `src/lib/hooks/useWorkoutOrchestrator.ts`

```typescript
import { useCallback, useMemo, useState } from 'react';
import type { LoggedSet } from '../loggerTypes';
import type { Cue } from '../perSetCue';
import { detectCueForWorkingSet, makeEmptyExerciseState, type ExerciseSessionState } from '../perSetCue';
import { lbToKg } from '../units';
import { estimate1RM_Epley } from '../e1rm';

export interface WorkoutOrchestratorOptions {
  planMode: boolean;
  selectedExerciseId: string;
  exerciseBlocks: string[];
}

export interface WorkoutOrchestratorResult {
  // State
  sets: LoggedSet[];
  sessionState: Record<string, ExerciseSessionState>;
  currentCue: Cue | null;
  recapCues: Cue[];
  
  // Actions
  addSet: (exerciseId: string, weightLb: number, reps: number) => void;
  toggleDone: (setId: string) => void;
  finishWorkout: () => void;
  reset: () => void;
  
  // Getters
  isDone: (setId: string) => boolean;
}

export function useWorkoutOrchestrator(
  options: WorkoutOrchestratorOptions
): WorkoutOrchestratorResult {
  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [doneBySetId, setDoneBySetId] = useState<Record<string, boolean>>({});
  const [sessionState, setSessionState] = useState<Record<string, ExerciseSessionState>>({});
  const [currentCue, setCurrentCue] = useState<Cue | null>(null);
  const [recapCues, setRecapCues] = useState<Cue[]>([]);

  const addSet = useCallback((exerciseId: string, weightLb: number, reps: number) => {
    const weightKg = lbToKg(weightLb);
    const newSet: LoggedSet = {
      id: `set_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      exerciseId,
      setType: 'working',
      weightKg,
      reps,
      timestampMs: Date.now(),
    };

    // Detect cue
    const prev = sessionState[exerciseId] ?? makeEmptyExerciseState();
    const result = detectCueForWorkingSet({
      weightKg,
      reps,
      unit: 'lb',
      exerciseName: exerciseId, // TODO: Get actual name
      prev,
    });

    if (result.cue) {
      setCurrentCue(result.cue);
      setTimeout(() => setCurrentCue(null), 3000);
    }

    setSessionState((s) => ({ ...s, [exerciseId]: result.next }));
    setSets((s) => [...s, newSet]);
  }, [sessionState]);

  const toggleDone = useCallback((setId: string) => {
    setDoneBySetId((prev) => ({ ...prev, [setId]: !prev[setId] }));
  }, []);

  const isDone = useCallback((setId: string) => !!doneBySetId[setId], [doneBySetId]);

  const finishWorkout = useCallback(() => {
    // Generate recap cues
    const cues: Cue[] = [];
    // ... generate logic
    setRecapCues(cues);
    
    // Save to store
    // addWorkoutSession(...)
    
    // Clear
    setSets([]);
    setSessionState({});
    setDoneBySetId({});
  }, [sets]);

  const reset = useCallback(() => {
    setSets([]);
    setSessionState({});
    setDoneBySetId({});
    setCurrentCue(null);
    setRecapCues([]);
  }, []);

  return {
    sets,
    sessionState,
    currentCue,
    recapCues,
    addSet,
    toggleDone,
    finishWorkout,
    reset,
    isDone,
  };
}
```

### Step 2: Simplify LiveWorkout Component

**File:** `app/live-workout.tsx` (simplified)

```typescript
import { useWorkoutOrchestrator } from '../src/lib/hooks/useWorkoutOrchestrator';

export default function LiveWorkout() {
  const c = useThemeColors();
  const plan = useCurrentPlan();
  
  const [selectedExerciseId, setSelectedExerciseId] = useState(EXERCISES_V1[0].id);
  const [exerciseBlocks, setExerciseBlocks] = useState<string[]>([]);
  const [weightLb, setWeightLb] = useState(135);
  const [reps, setReps] = useState(8);

  const workout = useWorkoutOrchestrator({
    planMode: !!plan,
    selectedExerciseId,
    exerciseBlocks,
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }}>
      <InstantCueToast cue={workout.currentCue} />
      
      <QuickAddSetCard
        weightLb={weightLb}
        reps={reps}
        onWeightChange={setWeightLb}
        onRepsChange={setReps}
        onAddSet={() => workout.addSet(selectedExerciseId, weightLb, reps)}
      />
      
      <ExerciseBlocksCard
        exerciseIds={exerciseBlocks}
        sets={workout.sets}
        isDone={workout.isDone}
        toggleDone={workout.toggleDone}
      />
      
      <Button onPress={workout.finishWorkout}>Finish</Button>
    </ScrollView>
  );
}
```

**Benefits:**
- 400 lines → ~100 lines in component
- Business logic is testable in isolation
- Easier to understand component structure

---

## Refactor #2: Migrate to Zustand

**Problem:** Manual subscription pattern is verbose

### Step 1: Install Zustand

```bash
npm install zustand
```

### Step 2: Create Zustand Store

**File:** `src/lib/stores/workoutStore.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkoutSession } from '../workoutModel';

interface WorkoutStore {
  sessions: WorkoutSession[];
  isLoading: boolean;
  
  // Actions
  addSession: (session: WorkoutSession) => void;
  clearSessions: () => void;
  hydrate: () => Promise<void>;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      isLoading: true,

      addSession: (session) => 
        set((state) => ({ 
          sessions: [session, ...state.sessions] 
        })),

      clearSessions: () => 
        set({ sessions: [] }),

      hydrate: async () => {
        set({ isLoading: false });
      },
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.hydrate();
      },
    }
  )
);
```

### Step 3: Update Components

**Before:**
```typescript
const sessions = useWorkoutSessions(); // Custom hook
```

**After:**
```typescript
const { sessions, isLoading } = useWorkoutStore();

if (isLoading) return <LoadingSpinner />;
```

### Step 4: Migrate All Stores

Priority order:
1. `workoutStore.ts` ✅
2. `currentSessionStore.ts` ✅
3. `routinesStore.ts` ✅
4. `socialStore.ts`
5. `chatStore.ts`
6. `friendsStore.ts`

**Benefits:**
- Built-in persistence
- DevTools support
- Less boilerplate
- Better TypeScript inference

---

## Refactor #3: Create Shared Types

**Problem:** Types scattered across files, some duplicated

### Create Central Types

**File:** `src/lib/types/index.ts`

```typescript
// Re-export all domain types
export type { 
  WorkoutSession, 
  WorkoutSet 
} from '../workoutModel';

export type { 
  LoggedSet, 
  SetType 
} from '../loggerTypes';

export type { 
  Routine, 
  RoutineExercise 
} from '../routinesModel';

export type {
  ID,
  WorkoutPost,
  Comment,
  Reaction,
  ChatThread,
  ChatMessage,
  FriendEdge,
} from '../socialModel';

export type { Cue, ExerciseSessionState } from '../perSetCue';

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### Update Imports

**Before:**
```typescript
import type { WorkoutSet } from '../lib/workoutModel';
import type { LoggedSet } from '../lib/loggerTypes';
import type { Cue } from '../lib/perSetCue';
```

**After:**
```typescript
import type { WorkoutSet, LoggedSet, Cue } from '@/lib/types';
```

---

## Refactor #4: Component Composition

**Problem:** Prop drilling in ExerciseBlocksCard

### Current (Prop Drilling):

```typescript
<ExerciseBlocksCard
  sets={sets}
  isDone={isDone}
  toggleDone={toggleDone}
  setWeightForSet={setWeightForSet}
  setRepsForSet={setRepsForSet}
  kgToLb={kgToLb}
  estimateE1RMLb={estimateE1RMLb}
/>
```

### Refactored (Context):

**File:** `src/lib/contexts/WorkoutContext.tsx`

```typescript
import { createContext, useContext } from 'react';

interface WorkoutContextValue {
  isDone: (setId: string) => boolean;
  toggleDone: (setId: string) => void;
  setWeight: (setId: string, weightLb: number) => void;
  setReps: (setId: string, reps: number) => void;
  kgToLb: (kg: number) => number;
  estimateE1RM: (weightLb: number, reps: number) => number;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ 
  children, 
  value 
}: { 
  children: React.ReactNode; 
  value: WorkoutContextValue;
}) {
  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within WorkoutProvider');
  }
  return context;
}
```

**Usage:**

```typescript
// In LiveWorkout
<WorkoutProvider value={workoutContextValue}>
  <ExerciseBlocksCard sets={sets} exerciseIds={blocks} />
</WorkoutProvider>

// In ExerciseBlocksCard
const { isDone, toggleDone, setWeight } = useWorkout();
// No more props!
```

**Benefits:**
- Clean component APIs
- Shared utilities available everywhere
- Easy to add new context values

---

## Refactor #5: Validation Layer

**Problem:** Input validation scattered, inconsistent

### Create Validation Module

**File:** `src/lib/validation/index.ts`

```typescript
import { z } from 'zod';

// Schema definitions
export const SetInputSchema = z.object({
  weightLb: z.number().min(0).max(2000),
  reps: z.number().int().min(1).max(100),
});

export const WorkoutSessionSchema = z.object({
  id: z.string(),
  startedAtMs: z.number(),
  endedAtMs: z.number(),
  sets: z.array(z.object({
    id: z.string(),
    exerciseId: z.string(),
    weightKg: z.number(),
    reps: z.number(),
    timestampMs: z.number(),
  })),
});

// Validation functions
export function validateSetInput(data: unknown) {
  return SetInputSchema.safeParse(data);
}

export function validateWorkoutSession(data: unknown) {
  return WorkoutSessionSchema.safeParse(data);
}

// Type inference
export type SetInput = z.infer<typeof SetInputSchema>;
export type ValidatedWorkoutSession = z.infer<typeof WorkoutSessionSchema>;
```

### Use in Components

```typescript
import { validateSetInput } from '@/lib/validation';

function handleWeightChange(text: string) {
  const result = validateSetInput({ 
    weightLb: Number(text), 
    reps 
  });
  
  if (!result.success) {
    showError(result.error.issues[0].message);
    return;
  }
  
  setWeight(result.data.weightLb);
}
```

**Benefits:**
- Runtime type checking
- Consistent error messages
- Self-documenting validation rules
- Easy to add new validators

---

## Refactor #6: Extract Utilities

**Problem:** Helper functions duplicated across files

### Create Utils Module

**File:** `src/lib/utils/index.ts`

```typescript
// Time formatting
export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function timeAgo(ms: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// Unit conversion
export const KG_PER_LB = 0.45359237;
export const lbToKg = (lb: number) => lb * KG_PER_LB;
export const kgToLb = (kg: number) => kg / KG_PER_LB;

// Math
export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function roundToStep(value: number, step: number) {
  if (step <= 0) throw new Error('step must be > 0');
  return Math.round(value / step) * step;
}

// ID generation
export function generateId(prefix?: string) {
  const rand = Math.random().toString(16).slice(2);
  return prefix ? `${prefix}_${rand}` : rand;
}
```

### Consolidate Imports

**Before:**
```typescript
// Scattered across 10 files
function timeAgo(ms: number): string { /* ... */ }
```

**After:**
```typescript
import { timeAgo, lbToKg, formatDuration } from '@/lib/utils';
```

---

## Migration Priority

1. **Week 1:** Validation layer + Utils extraction (low risk)
2. **Week 2:** Extract LiveWorkout logic (medium risk)
3. **Week 3:** Create WorkoutContext (medium risk)
4. **Week 4:** Migrate to Zustand (high risk, but high value)

---

## Testing Strategy During Refactor

For each refactor:

1. **Before:** Write characterization tests
2. **During:** Maintain passing tests
3. **After:** Add new tests for refactored code

Example test:

```typescript
// __tests__/refactor/workout-orchestrator.test.ts
describe('useWorkoutOrchestrator (refactored)', () => {
  it('maintains same behavior as original', () => {
    const { result } = renderHook(() => useWorkoutOrchestrator({
      planMode: false,
      selectedExerciseId: 'bench',
      exerciseBlocks: ['bench'],
    }));

    act(() => {
      result.current.addSet('bench', 135, 8);
    });

    expect(result.current.sets).toHaveLength(1);
    expect(result.current.sets[0].reps).toBe(8);
  });
});
```

---

## Rollback Plan

If a refactor causes issues:

1. **Immediate:** Revert the commit
   ```bash
   git revert <commit-hash>
   git push
   ```

2. **Debug:** Fix issues in a branch
3. **Re-apply:** When confident

Keep refactors in separate commits for easy rollback!

---

## Estimated Impact

| Refactor | Risk | Effort | Value | Priority |
|----------|------|--------|-------|----------|
| LiveWorkout extract | Medium | 4h | High | 1 |
| Zustand migration | High | 8h | High | 2 |
| Validation layer | Low | 3h | Medium | 1 |
| Utils extraction | Low | 2h | Medium | 1 |
| Component Context | Medium | 4h | Medium | 3 |
| Central types | Low | 1h | Low | 4 |

**Recommended order:** Validation → Utils → LiveWorkout → Zustand → Context
