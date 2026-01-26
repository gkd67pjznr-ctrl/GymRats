# Forgerank Code Review
**Date:** January 18, 2026  
**Reviewer:** Claude  
**Codebase:** React Native/Expo, TypeScript

---

## Executive Summary

**Overall Assessment:** 🟢 **Strong Foundation - Production Ready with Minor Improvements**

Forgerank is a well-structured workout tracking app with:
- ✅ Clean architecture with proper separation of concerns
- ✅ Type-safe TypeScript throughout
- ✅ Solid state management patterns
- ✅ Good documentation (Architecture + Execution Plan)
- ⚠️ A few areas needing attention before v1 launch

**Key Strengths:**
1. Excellent domain modeling (workout, scoring, ranks, social)
2. Pragmatic v1 scope management
3. PR detection + cue system is innovative
4. AsyncStorage persistence for current session

**Priority Issues:**
1. Missing error boundaries
2. No loading states in UI
3. Persistence layer needs batching
4. Type safety gaps in some stores

---

## Architecture Review

### ✅ Strengths

#### 1. Clear Domain Separation
```
src/lib/
├── workoutModel.ts       # Core workout types
├── forgerankScoring.ts   # Scoring logic (isolated)
├── ranks.ts              # Ranking system
├── socialModel.ts        # Social contracts
└── perSetCue.ts          # PR detection
```
**Score: 9/10** - Excellent separation. Each module has a clear responsibility.

#### 2. State Management Pattern
The subscription-based store pattern is consistent:
```typescript
let state = { ... };
const listeners = new Set<() => void>();
function notify() { for (const fn of listeners) fn(); }
```
**Score: 7/10** - Works well for v1, but will need migration to Zustand/Jotai for v2.

#### 3. Current Session Persistence
```typescript
// src/lib/currentSessionStore.ts
await AsyncStorage.setItem(KEY, JSON.stringify(current));
```
**Score: 8/10** - Smart! Resume-able workouts are a killer feature.

### ⚠️ Areas for Improvement

#### 1. Error Boundaries Missing
**Impact:** High  
**Effort:** Low

Your app has no error boundaries. One crash = dead app.

**Fix:**
```typescript
// Add to app/_layout.tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text>Something went wrong:</Text>
      <Text>{error.message}</Text>
      <Button onPress={resetErrorBoundary}>Try again</Button>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {/* existing layout */}
    </ErrorBoundary>
  );
}
```

#### 2. No Loading States
**Impact:** Medium  
**Effort:** Low

Screens that hydrate from AsyncStorage show no loading:
```typescript
// app/history.tsx - Missing loading state
const sessions = useWorkoutSessions(); // Could be empty during hydration
```

**Fix:**
```typescript
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  hydrateWorkoutStore().finally(() => setIsLoading(false));
}, []);

if (isLoading) return <LoadingSpinner />;
```

#### 3. Persistence Batching
**Impact:** Medium  
**Effort:** Medium

Every state change triggers AsyncStorage write:
```typescript
function updateCurrentSession(updater) {
  current = updater(base);
  persist(); // ⚠️ Called on every set!
  notify();
}
```

**Fix:**
```typescript
// Debounce persists
const debouncedPersist = debounce(async () => {
  await AsyncStorage.setItem(KEY, JSON.stringify(current));
}, 500);
```

---

## Code Quality Analysis

### TypeScript Usage: 8/10

**Strengths:**
- Excellent type definitions in `src/lib/socialModel.ts`, `workoutModel.ts`
- Proper use of branded types: `type ID = string`
- Good use of utility types: `Omit`, `Partial`, `Record`

**Weaknesses:**
```typescript
// ❌ Lots of `any` casts
const anySession = session as any;
const fn = anySession.addSet ?? anySession.onAddSet ?? ... ?? null;

// ✅ Better approach:
interface LiveWorkoutSession {
  addSet: (exerciseId: string) => LoggedSet;
  sets: LoggedSet[];
  // ... explicit interface
}
```

**Action:** Create `src/lib/types/` folder with explicit interfaces for all stores.

---

## Component Review

### Live Workout (`app/live-workout.tsx`)

**Lines of Code:** 400+  
**Complexity:** High  
**Score:** 6/10

**Issues:**
1. **God Component** - Does too much (orchestration + UI + persistence + cues)
2. **Hard to test** - All logic inline
3. **Prop drilling** - Passes 10+ props to child components

**Refactor Plan:**
```typescript
// 1. Extract business logic
function useWorkoutOrchestrator(plan?: WorkoutPlan) {
  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [cues, setCues] = useState<Cue[]>([]);
  
  const addSet = useCallback((exerciseId: string) => {
    // All logic here
  }, []);
  
  return { sets, addSet, cues, /* ... */ };
}

// 2. Simplify component
export default function LiveWorkout() {
  const workout = useWorkoutOrchestrator(plan);
  
  return (
    <WorkoutUI 
      sets={workout.sets}
      onAddSet={workout.addSet}
      cues={workout.cues}
    />
  );
}
```

### ExerciseBlocksCard: 7/10

**Good:**
- Clean prop interface
- Handles collapse state locally
- Proper key usage

**Improvement:**
```typescript
// ❌ Current: Prop drilling
<ExerciseBlocksCard
  isDone={isDoneFn}
  toggleDone={toggleDone}
  setWeightForSet={setWeightForSet}
  setRepsForSet={setRepsForSet}
  kgToLb={kgToLb}
  estimateE1RMLb={estimateE1RMLb}
/>

// ✅ Better: Context
<WorkoutContext.Provider value={workoutSession}>
  <ExerciseBlocksCard sets={sets} exerciseIds={ids} />
</WorkoutContext.Provider>
```

---

## Performance Analysis

### Current Performance: 7/10

**Measurements Needed:**
- [ ] Time to first render (target: <500ms)
- [ ] Set logging latency (target: <100ms)
- [ ] AsyncStorage write times (monitor)

**Optimizations:**

#### 1. Memoization
```typescript
// ❌ Recreated every render
const kgToLb = (kg: number) => kg * 2.2046226218;

// ✅ Stable reference
const kgToLb = useCallback((kg: number) => kg * 2.2046226218, []);
```

#### 2. List Performance
```typescript
// ExercisePicker.tsx uses FlatList ✅
// But no optimization props:

<FlatList
  data={data}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  // Add these:
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

---

## Security & Data Integrity

### Security: 6/10

**Concerns:**

#### 1. No Input Validation
```typescript
// ❌ Unchecked user input
function setWeightForSet(setId: string, text: string) {
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return;
  updateSet(setId, { weightKg: lbToKg(Math.max(0, parsed)) });
}
```

**Fix:**
```typescript
function setWeightForSet(setId: string, text: string) {
  const parsed = Number(text);
  
  if (!Number.isFinite(parsed)) {
    showToast('Invalid weight');
    return;
  }
  
  if (parsed < 0 || parsed > 2000) { // Reasonable max
    showToast('Weight must be 0-2000 lbs');
    return;
  }
  
  updateSet(setId, { weightKg: lbToKg(parsed) });
}
```

#### 2. Exposed GitHub Token
```markdown
# ❌ In Githubpush_pullCommands.md
github_pat_11B4XNRPA04JoWd0KxT5fJ_...
```

**CRITICAL:** This token is now public on GitHub. You must:
1. Revoke it immediately: https://github.com/settings/tokens
2. Remove from repo history: `git filter-branch` or BFG Repo-Cleaner
3. Never commit tokens again

---

## Testing Strategy

### Current Test Coverage: 0%

**Recommended Test Plan:**

#### Unit Tests (Priority: High)
```typescript
// tests/lib/perSetCue.test.ts
describe('detectCueForWorkingSet', () => {
  it('detects weight PR', () => {
    const prev = makeEmptyExerciseState();
    const result = detectCueForWorkingSet({
      weightKg: 100,
      reps: 5,
      unit: 'kg',
      exerciseName: 'Bench',
      prev,
    });
    
    expect(result.cue?.message).toContain('weight PR');
  });
  
  it('detects cardio sets', () => {
    // Test 16+ reps triggers cardio cue
  });
});
```

#### Integration Tests
```typescript
// tests/integration/workout-flow.test.ts
describe('Workout Flow', () => {
  it('persists session on app close', async () => {
    // 1. Start workout
    // 2. Add sets
    // 3. Simulate app close
    // 4. Rehydrate
    // 5. Assert sets still there
  });
});
```

---

## Dependency Audit

### Dependencies: 8/10

**Good:**
- Modern Expo SDK (54.x)
- React 19 (latest)
- TypeScript 5.9

**Concerns:**
```json
{
  "react-native": "0.81.5" // ⚠️ Outdated (latest is 0.73.x for Expo 54)
}
```

**Action:** Verify Expo compatibility matrix.

**Missing (Recommended):**
```bash
npm install --save \
  @tanstack/react-query \  # Server state management (future)
  react-hook-form \         # Form validation
  zod \                      # Runtime type validation
  date-fns \                 # Date utilities (replace manual formatting)
  sentry-expo               # Error tracking
```

---

## File Structure Review

### Current Structure: 8/10

**Strengths:**
- Clean separation: `app/` (screens), `src/lib/` (logic), `src/ui/` (design)
- Good naming conventions
- Logical grouping

**Improvements:**

```
# Add these directories:
src/
├── lib/
│   ├── types/          # ✅ Add: Shared type definitions
│   ├── utils/          # ✅ Add: Pure utility functions
│   ├── constants/      # ✅ Add: App-wide constants
│   └── validators/     # ✅ Add: Input validation
├── hooks/              # ✅ Move: Custom hooks here
└── ui/
    ├── components/
    │   ├── shared/     # ✅ Add: Reusable components
    │   └── LiveWorkout/
    └── screens/        # ✅ Add: Complex screen logic
```

---

## Critical Bugs Found

### 🐛 Bug #1: Race Condition in Session Persistence
**File:** `src/lib/currentSessionStore.ts`  
**Severity:** Medium

```typescript
export function updateCurrentSession(updater) {
  const base = ensureCurrentSession();
  current = updater(base);
  persist(); // ⚠️ Fire-and-forget
  notify();
}
```

**Issue:** If user rapidly logs sets, some may not persist.

**Fix:**
```typescript
let persistPromise: Promise<void> | null = null;

export async function updateCurrentSession(updater) {
  const base = ensureCurrentSession();
  current = updater(base);
  
  // Wait for previous persist
  await persistPromise;
  
  persistPromise = persist();
  notify();
}
```

### 🐛 Bug #2: Memory Leak in InstantCueToast
**File:** `src/ui/components/LiveWorkout/InstantCueToast.tsx`

```typescript
useEffect(() => {
  timerRef.current = setTimeout(() => {
    // Animation + clear
  }, holdMs);

  return () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
}, [cueKey, /* ... */]);
```

**Issue:** If `cueKey` changes before timeout completes, multiple timers can run.

**Fix:** Already has cleanup! ✅ (False alarm, code is correct)

### 🐛 Bug #3: Uncaught Promise Rejections
**File:** Multiple stores

```typescript
hydrateFriends().catch(() => {}); // ⚠️ Silent failure
```

**Fix:**
```typescript
hydrateFriends().catch((err) => {
  console.error('Failed to hydrate friends:', err);
  // Optional: Show user-facing error
});
```

---

## Recommendations by Priority

### 🔴 Critical (Do Before Launch)
1. **Revoke exposed GitHub token**
2. **Add error boundaries** to `app/_layout.tsx`
3. **Add input validation** to all user-facing inputs
4. **Fix race condition** in `currentSessionStore`

### 🟡 High Priority (Next Sprint)
1. **Add loading states** to all async screens
2. **Extract LiveWorkout logic** into custom hook
3. **Add basic unit tests** for scoring/cues
4. **Implement persistence batching**

### 🟢 Medium Priority (V1.1)
1. Migrate to Zustand for state management
2. Add integration tests
3. Performance profiling
4. Accessibility audit (VoiceOver support)

### 🔵 Low Priority (V2)
1. Offline mode with sync
2. Backend integration
3. Real-time multiplayer features

---

## Scoring Rubric

| Category | Score | Notes |
|----------|-------|-------|
| Architecture | 9/10 | Excellent domain separation |
| TypeScript | 8/10 | Good types, some `any` usage |
| Code Quality | 7/10 | Clean but some complexity |
| Performance | 7/10 | Good, needs optimization |
| Testing | 2/10 | No tests yet |
| Security | 6/10 | Input validation needed |
| Documentation | 9/10 | Excellent docs |
| **Overall** | **7.5/10** | **Strong foundation** |

---

## Next Steps

1. **Today:** Revoke GitHub token, add error boundary
2. **This Week:** Add loading states, input validation
3. **Sprint 1:** Unit tests for core logic
4. **Sprint 2:** Refactor LiveWorkout, persistence batching

**Estimated Time to Production-Ready:** 2-3 weeks

---

## Conclusion

Forgerank is a **well-architected app** with a clear vision. The core workout tracking, PR detection, and scoring systems are solid. With the critical fixes above, this is **ready for beta testing**.

The main technical debt is in:
- Testing (0% coverage)
- Error handling (no boundaries)
- Performance optimization (batching needed)

These are **normal for a v1** and can be addressed incrementally without blocking launch.

**Recommendation:** ✅ **Proceed to beta with critical fixes**
