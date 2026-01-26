# Forgerank - Immediate Action Checklist

**Priority fixes before v1 launch**

---

## 🔴 CRITICAL - Do Today

### 1. Security: Revoke Exposed GitHub Token
- [ ] Go to https://github.com/settings/tokens
- [ ] Find token starting with `github_pat_11B4XNRPA0...`
- [ ] Click "Delete" / "Revoke"
- [ ] Remove `Githubpush_pullCommands.md` from repo:
  ```bash
  git rm Githubpush_pullCommands.md
  git commit -m "Remove sensitive file"
  git push
  ```
- [ ] Consider rewriting history to remove token:
  ```bash
  git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch Githubpush_pullCommands.md" \
    --prune-empty --tag-name-filter cat -- --all
  ```
- [ ] Generate new token with minimal permissions

### 2. Add Error Boundary
**File:** `app/_layout.tsx`

Add this wrapper:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  const c = useThemeColors();
  
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center', padding: 20 }}>
      <Text style={{ color: c.text, fontSize: 20, fontWeight: '900', marginBottom: 10 }}>
        Something went wrong
      </Text>
      <Text style={{ color: c.muted, marginBottom: 20 }}>
        {error?.message || 'Unknown error'}
      </Text>
      <Pressable 
        onPress={resetErrorBoundary}
        style={{ 
          padding: 12, 
          backgroundColor: c.card, 
          borderRadius: 12,
          borderWidth: 1,
          borderColor: c.border 
        }}
      >
        <Text style={{ color: c.text, fontWeight: '900', textAlign: 'center' }}>
          Try again
        </Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('App error:', error, info);
        // TODO: Send to error tracking service
      }}
    >
      {/* Your existing layout */}
    </ErrorBoundary>
  );
}
```

Install dependency:
```bash
npm install react-error-boundary
```

### 3. Add Input Validation
**File:** `src/lib/validators/workout.ts` (new file)

```typescript
export function validateWeight(value: string): { valid: boolean; error?: string; value?: number } {
  const num = Number(value);
  
  if (!Number.isFinite(num)) {
    return { valid: false, error: 'Must be a number' };
  }
  
  if (num < 0) {
    return { valid: false, error: 'Must be positive' };
  }
  
  if (num > 2000) {
    return { valid: false, error: 'Max weight is 2000 lbs' };
  }
  
  return { valid: true, value: num };
}

export function validateReps(value: string): { valid: boolean; error?: string; value?: number } {
  const num = Math.floor(Number(value));
  
  if (!Number.isFinite(num)) {
    return { valid: false, error: 'Must be a number' };
  }
  
  if (num < 1) {
    return { valid: false, error: 'Must be at least 1' };
  }
  
  if (num > 100) {
    return { valid: false, error: 'Max reps is 100' };
  }
  
  return { valid: true, value: num };
}
```

Update `useLiveWorkoutSession.ts`:

```typescript
import { validateWeight, validateReps } from '../validators/workout';

const setWeightForSet = useCallback((setId: string, text: string) => {
  const result = validateWeight(text);
  if (!result.valid) {
    // TODO: Show error toast
    console.warn('Invalid weight:', result.error);
    return;
  }
  updateSet(setId, { weightKg: lbToKg(result.value) });
}, [updateSet]);

const setRepsForSet = useCallback((setId: string, text: string) => {
  const result = validateReps(text);
  if (!result.valid) {
    // TODO: Show error toast
    console.warn('Invalid reps:', result.error);
    return;
  }
  updateSet(setId, { reps: result.value });
}, [updateSet]);
```

---

## 🟡 HIGH PRIORITY - This Week

### 4. Add Loading States
**Files:** `app/history.tsx`, `app/calendar.tsx`, `app/profile.tsx`

Add this pattern to all screens that load data:

```typescript
export default function History() {
  const c = useThemeColors();
  const [isLoading, setIsLoading] = useState(true);
  const sessions = useWorkoutSessions();

  useEffect(() => {
    // Assuming you add this export to workoutStore
    hydrateWorkoutStore()
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: c.muted }}>Loading...</Text>
      </View>
    );
  }

  // ... rest of component
}
```

### 5. Fix Race Condition in currentSessionStore
**File:** `src/lib/currentSessionStore.ts`

Replace fire-and-forget persist:

```typescript
let persistQueue: Promise<void> = Promise.resolve();

async function persist() {
  persistQueue = persistQueue.then(async () => {
    try {
      if (!current) {
        await AsyncStorage.removeItem(KEY);
        return;
      }
      await AsyncStorage.setItem(KEY, JSON.stringify(current));
    } catch (err) {
      console.error('Failed to persist session:', err);
    }
  });
  
  return persistQueue;
}

export async function updateCurrentSession(updater: (s: CurrentSession) => CurrentSession) {
  const base = ensureCurrentSession();
  current = updater(base);
  await persist(); // Now properly awaited
  notify();
}
```

### 6. Better Error Handling in Stores
Replace all `.catch(() => {})` with proper logging:

```typescript
// ❌ Before
hydrateFriends().catch(() => {});

// ✅ After
hydrateFriends().catch((err) => {
  console.error('Failed to hydrate friends:', err);
  // Optional: Track with analytics
});
```

Add this to all stores:
- `chatStore.ts`
- `friendsStore.ts`
- `feedStore.ts`
- `socialStore.ts`

---

## 🟢 NICE TO HAVE - Next Sprint

### 7. Add Basic Tests
Install testing dependencies:

```bash
npm install --save-dev \
  @testing-library/react-native \
  @testing-library/jest-native \
  jest
```

Create first test:

**File:** `__tests__/lib/perSetCue.test.ts`

```typescript
import { detectCueForWorkingSet, makeEmptyExerciseState } from '../../src/lib/perSetCue';

describe('perSetCue', () => {
  describe('detectCueForWorkingSet', () => {
    it('detects weight PR', () => {
      const prev = makeEmptyExerciseState();
      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 5,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.cue).toBeDefined();
      expect(result.cue?.message).toContain('weight PR');
      expect(result.next.bestWeightKg).toBe(100);
    });

    it('detects rep PR at same weight', () => {
      const prev = makeEmptyExerciseState();
      prev.bestRepsAtWeight['100'] = 5;

      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 6,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.cue?.message).toContain('Rep PR');
    });

    it('detects cardio sets (16+ reps)', () => {
      const prev = makeEmptyExerciseState();
      const result = detectCueForWorkingSet({
        weightKg: 50,
        reps: 20,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.cue?.message).toContain('CARDIO');
      expect(result.meta.isCardio).toBe(true);
    });
  });
});
```

Run tests:
```bash
npm test
```

### 8. Add Persistence Batching
**File:** `src/lib/currentSessionStore.ts`

```typescript
import { debounce } from 'lodash'; // or implement your own

const debouncedPersist = debounce(async () => {
  try {
    if (!current) {
      await AsyncStorage.removeItem(KEY);
      return;
    }
    await AsyncStorage.setItem(KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to persist session:', err);
  }
}, 500); // Batch writes every 500ms

export function updateCurrentSession(updater: (s: CurrentSession) => CurrentSession) {
  const base = ensureCurrentSession();
  current = updater(base);
  debouncedPersist(); // Debounced
  notify();
}
```

### 9. Extract LiveWorkout Logic
**File:** `src/lib/hooks/useWorkoutOrchestrator.ts` (new)

```typescript
export function useWorkoutOrchestrator(options: {
  planMode: boolean;
  plan?: WorkoutPlan;
  selectedExerciseId: string;
}) {
  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [cues, setCues] = useState<Cue[]>([]);
  const [sessionState, setSessionState] = useState<Record<string, ExerciseSessionState>>({});

  const addSet = useCallback((exerciseId: string) => {
    // Move all addSet logic here
  }, []);

  const finishWorkout = useCallback(() => {
    // Move all finish logic here
  }, []);

  return {
    sets,
    cues,
    addSet,
    finishWorkout,
    // ... other methods
  };
}
```

Then simplify `app/live-workout.tsx`:

```typescript
export default function LiveWorkout() {
  const c = useThemeColors();
  const plan = useCurrentPlan();
  
  const workout = useWorkoutOrchestrator({
    planMode: !!plan,
    plan,
    selectedExerciseId: EXERCISES_V1[0].id,
  });

  return (
    <ScrollView>
      {/* Much simpler UI code */}
      <QuickAddSetCard onAddSet={workout.addSet} />
      <ExerciseBlocksCard sets={workout.sets} />
      <InstantCueToast cue={workout.currentCue} />
    </ScrollView>
  );
}
```

---

## Verification Checklist

After completing critical fixes:

- [ ] App launches without errors
- [ ] Can complete a workout end-to-end
- [ ] Session persists after app close/reopen
- [ ] Error boundary catches crashes
- [ ] No tokens in repo
- [ ] Input validation works (try entering "abc" as weight)
- [ ] Loading states show briefly on first load

---

## Timeline

| Task | Priority | Est. Time | Status |
|------|----------|-----------|--------|
| Revoke token | 🔴 Critical | 5 min | ⬜ |
| Error boundary | 🔴 Critical | 30 min | ⬜ |
| Input validation | 🔴 Critical | 1 hour | ⬜ |
| Loading states | 🟡 High | 2 hours | ⬜ |
| Fix race condition | 🟡 High | 1 hour | ⬜ |
| Better error handling | 🟡 High | 1 hour | ⬜ |
| Basic tests | 🟢 Nice to have | 4 hours | ⬜ |
| Persistence batching | 🟢 Nice to have | 2 hours | ⬜ |
| Extract LiveWorkout | 🟢 Nice to have | 4 hours | ⬜ |

**Total Critical + High Priority:** ~6 hours  
**Recommended completion:** End of week

---

## Need Help?

If you get stuck on any of these:
1. Check the CODE_REVIEW.md for detailed explanations
2. Each fix has example code above
3. Test incrementally - don't change everything at once
