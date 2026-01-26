# Remediation Roadmap

## Prioritized Action Items for Code Quality Improvement

**Generated**: 2026-01-26
**Framework**: SPEC-QUALITY-001
**Target**: Achieve 80+ quality score

---

## Priority Levels

- **P0 (Critical)**: Security/stability risk, fix immediately
- **P1 (High)**: Significant quality impact, fix this sprint
- **P2 (Medium)**: Technical debt, fix next sprint
- **P3 (Low)**: Nice to have, backlog

---

## Phase 1: Critical Fixes (Week 1)

### P0-1: Fix Unsafe JSON.parse in AsyncStorage
**Severity**: Critical | **Effort**: 4 hours | **Risk**: High

**Problem**: 20 instances of `JSON.parse()` without try-catch can crash app on corrupted storage data.

**Files Affected**:
```
src/lib/workoutPlanStore.ts:44
src/lib/_old/socialStore.ts:63
src/lib/_old/workoutStore.ts:40
src/lib/auth/oauth.ts:251
src/lib/_old/friendsStore.ts:44
src/lib/_old/routinesStore.ts:26
src/lib/_old/currentSessionStore.ts:67
src/lib/_old/feedStore.ts:62
src/lib/_old/settings.ts:39
src/lib/_old/chatStore.ts:90
src/lib/notificationPrefs.ts:55
src/lib/stores/socialStore.ts:201
src/lib/stores/friendsStore.ts:126
src/lib/stores/feedStore.ts:199
src/lib/stores/chatStore.ts:246
src/lib/premadePlans/progressStore.ts:40
src/lib/premadePlans/store.ts:41
src/lib/premadePlans/useAIGeneratePlan.ts:109
```

**Action Plan**:

1. Create safe utility function:
```typescript
// src/lib/storage/safeJSONParse.ts
export function safeJSONParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error('[safeJSONParse] Failed:', err);
    return fallback;
  }
}
```

2. Replace all `JSON.parse(raw) as Type` with `safeJSONParse(raw, fallback)`

3. Add unit tests for corrupted data scenarios

**Verification**:
```bash
# Run tests
npm test

# Manual test: Corrupt AsyncStorage and verify app doesn't crash
```

---

### P0-2: Replace Silent Error Catch Blocks
**Severity**: Critical | **Effort**: 6 hours | **Risk**: Medium

**Problem**: 32 instances of `.catch(() => {})` suppress errors without logging or user feedback.

**Files Affected**:
```
app/new-message.tsx:24
app/create-post.tsx:29
app/friends.tsx:43
app/u/[id].tsx:55
src/lib/_old/chatStore.ts:101,185,216,250,259,270,281,292,316,386
src/lib/_old/socialStore.ts:213,224,235,246,257
src/lib/_old/feedStore.ts:115,179,202,217,285
src/lib/_old/friendsStore.ts:149,160
src/lib/devMode.ts:105
src/lib/notificationPrefs.ts:104
```

**Action Plan**:

1. Create error handling utility:
```typescript
// src/lib/errorHandler.ts
export function logAndToastError(
  context: string,
  error: unknown,
  toastFn?: (message: string) => void
) {
  console.error(`[${context}] Error:`, error);
  toastFn?.(`Something went wrong. Please try again.`);
}
```

2. Replace silent catches:
```typescript
// Before
hydrateFriends().catch(() => {});

// After
hydrateFriends().catch((err) => {
  logAndToastError('Friends', err, showErrorToast);
});
```

3. Add error boundary toasts to relevant screens

**Verification**:
- Trigger errors and verify toasts appear
- Check console for error logs
- Test offline scenarios

---

### P0-3: Fix Type Safety in useWorkoutOrchestrator
**Severity**: Critical | **Effort**: 4 hours | **Risk**: Medium

**Problem**: 14 `as any` casts in `src/lib/hooks/useWorkoutOrchestrator.ts` bypass type checking in critical PR detection flow.

**Lines Affected**: 95, 97, 98, 99, 112, 113, 123, 138, 139, 146, 174, 180, 230, 284

**Action Plan**:

1. Define proper interfaces:
```typescript
// src/lib/perSetCue.ts (extend existing)
export interface DetectCueParams {
  weightKg: number;
  reps: number;
  unit: UnitSystem;
  exerciseName: string;
  prev: ExerciseSessionState;
}

export interface DetectCueResult {
  cue: Cue | null;
  next: ExerciseSessionState;
  meta?: {
    type: 'weight' | 'rep' | 'e1rm';
    weightLabel?: string;
  };
}
```

2. Update function signature:
```typescript
export function detectCueForWorkingSet(
  params: DetectCueParams
): DetectCueResult {
  // ...
}
```

3. Remove all `as any` casts:
```typescript
// Before
const res = detectCueForWorkingSet({ ... } as any);
const cue = (res as any)?.cue ?? null;

// After
const res = detectCueForWorkingSet({ weightKg, reps, unit, exerciseName, prev });
const cue = res.cue;
```

**Verification**:
```bash
# TypeScript compilation should pass
npx tsc --noEmit

# Run tests
npm test -- useWorkoutOrchestrator
```

---

## Phase 2: High Priority (Week 2)

### P1-1: Extract Duplicate timeAgo Function
**Severity**: High | **Effort**: 1 hour | **Risk**: Low

**Problem**: 5 copies of `timeAgo()` function in different files.

**Files Affected**:
```
app/chat.tsx:11
app/(tabs)/feed.tsx:16
app/(tabs)/index.tsx:11
app/u/[id].tsx:35
app/post/[id].tsx:27
```

**Action Plan**:

1. Create shared utility:
```typescript
// src/lib/timeUtils.ts
export function timeAgo(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(ms).toLocaleDateString();
}
```

2. Replace all local implementations with import:
```typescript
import { timeAgo } from '@/src/lib/timeUtils';
```

3. Delete local implementations

**Verification**:
```bash
# Verify no local implementations remain
grep -r "function timeAgo" app/

# Run tests
npm test
```

---

### P1-2: Extract Duplicate kgToLb Function
**Severity**: High | **Effort**: 1 hour | **Risk**: Low

**Problem**: 2 files duplicate canonical `kgToLb()` from `src/lib/units.ts`.

**Files Affected**:
```
app/workout/[sessionId].tsx:13
app/calendar/day/[dayMs].tsx:13
```

**Action Plan**:

1. Import from canonical location:
```typescript
import { kgToLb } from '@/src/lib/units';
```

2. Delete local implementations

**Verification**:
```bash
# Verify no local implementations remain
grep -r "function kgToLb" app/

# Run tests
npm test
```

---

### P1-3: Delete Deprecated _old/ Directory
**Severity**: High | **Effort**: 1 hour | **Risk**: Low

**Problem**: `_old/` directory contains 8 deprecated store files that are no longer used but could be accidentally imported.

**Files to Delete**:
```
src/lib/_old/feedStore.ts
src/lib/_old/friendsStore.ts
src/lib/_old/chatStore.ts
src/lib/_old/socialStore.ts
src/lib/_old/currentSessionStore.ts
src/lib/_old/workoutStore.ts
src/lib/_old/routinesStore.ts
src/lib/_old/settings.ts
```

**Action Plan**:

1. Verify no references:
```bash
# Search for imports from _old directory
grep -r "from.*_old" --include="*.ts" --include="*.tsx" .
```

2. If no references found, delete directory:
```bash
rm -rf src/lib/_old/
```

3. Run tests to verify
```bash
npm test
```

**Verification**:
```bash
# Ensure directory is gone
ls src/lib/_old/  # Should fail

# All tests pass
npm test
```

---

### P1-4: Add __DEV__ Guards to Console Statements
**Severity**: High | **Effort**: 2 hours | **Risk**: Low

**Problem**: 50+ console.log/error statements in production code can leak information.

**Action Plan**:

1. Create logging utility:
```typescript
// src/lib/logger.ts
export const log = {
  error: (context: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.error(`[${context}]`, ...args);
    }
  },
  warn: (context: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.warn(`[${context}]`, ...args);
    }
  },
  info: (context: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.log(`[${context}]`, ...args);
    }
  },
};
```

2. Replace console statements:
```typescript
// Before
console.error('Failed to load plan:', err);

// After
log.error('workoutPlanStore', 'Failed to load plan:', err);
```

**Verification**:
- Check production build has minimal console output
- Run tests

---

## Phase 3: Medium Priority (Week 3-4)

### P2-1: Refactor app/live-workout.tsx (577 LOC)
**Severity**: Medium | **Effort**: 8 hours | **Risk**: Medium

**Problem**: Large file with multiple responsibilities is hard to maintain.

**Action Plan**:

1. Extract components:
```
app/live-workout.tsx
├── components/
│   ├── WorkoutHeader.tsx
│   ├── WorkoutControls.tsx
│   ├── WorkoutProgressBar.tsx
│   └── WorkoutActions.tsx
```

2. Keep main file as orchestrator:
```typescript
// app/live-workout.tsx (refactored)
export default function LiveWorkout() {
  const hooks = useWorkoutHooks();
  const handlers = useWorkoutHandlers(hooks);

  return (
    <View>
      <WorkoutHeader {...hooks} />
      <WorkoutControls {...handlers} />
      <ExerciseBlocks {...hooks} />
      <QuickAddSet {...hooks} />
      <WorkoutActions {...handlers} />
    </View>
  );
}
```

3. Create custom hooks for state management

**Verification**:
```bash
# All tests pass
npm test -- live-workout

# Manual testing of workout flow
```

---

### P2-2: Extract Duplicate exerciseName Function
**Severity**: Medium | **Effort**: 1 hour | **Risk**: Low

**Problem**: 5 copies of `exerciseName()` function.

**Files Affected**:
```
app/live-workout.tsx:37
src/ui/components/LiveWorkout/ExerciseBlocksCard.tsx:7
src/ui/components/LiveWorkout/PlanHeaderCard.tsx:29
src/ui/components/LiveWorkout/WorkoutLiveCard.tsx:7
app/workout/[sessionId].tsx:9
```

**Action Plan**:

1. Create shared utility:
```typescript
// src/lib/exerciseUtils.ts
import { EXERCISES_V1 } from '@/src/data/exercises';

export function getExerciseName(exerciseId: string): string {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}
```

2. Replace all implementations

**Verification**:
```bash
# Verify no local implementations remain
grep -r "function exerciseName" app/

# Run tests
npm test
```

---

### P2-3: Standardize Import Style
**Severity**: Medium | **Effort**: 2 hours | **Risk**: Low

**Problem**: Mixed use of `@/` alias and relative paths.

**Action Plan**:

1. Audit all imports:
```bash
grep -r "from ['\"]\.\./" --include="*.ts" --include="*.tsx" src/
```

2. Replace with `@/` alias:
```typescript
// Before
import { useThemeColors } from "../src/ui/theme";

// After
import { useThemeColors } from '@/src/ui/theme';
```

3. Add ESLint rule to enforce:
```json
{
  "rules": {
    "@typescript-eslint/no-relative-imports": "error"
  }
}
```

**Verification**:
```bash
# Linter check
npm run lint

# Build passes
npm run web
```

---

### P2-4: Fix Optional Module Declarations
**Severity**: Medium | **Effort**: 1 hour | **Risk**: Low

**Problem**: `Haptics` and `Speech` declared as `any` in `app/live-workout.tsx`.

**Lines**: 42, 49

**Action Plan**:

1. Define proper types:
```typescript
// types/expo-modules.d.ts
export interface HapticsModule {
  notificationAsync?: (type: NotificationFeedbackType) => Promise<void>;
  impactAsync?: (style: ImpactFeedbackStyle) => Promise<void>;
}

export interface SpeechModule {
  stop?: () => void;
  speak?: (text: string, options?: SpeakOptions) => void;
}
```

2. Update declarations:
```typescript
let Haptics: HapticsModule | null = null;
let Speech: SpeechModule | null = null;
```

**Verification**:
```bash
npx tsc --noEmit
```

---

## Phase 4: Low Priority (Backlog)

### P3-1: Improve Test Coverage
**Severity**: Low | **Effort**: 16 hours | **Risk**: Low

**Action Plan**:
- Add unit tests for utility functions
- Add integration tests for stores
- Add E2E tests for critical flows

**Target**: 85%+ coverage

---

### P3-2: Setup React Query for Data Fetching
**Severity**: Low | **Effort**: 12 hours | **Risk**: Medium

**Action Plan**:
- Replace fire-and-forget hydrate calls with React Query
- Add proper loading/error states
- Implement caching and stale-while-revalidate

---

### P3-3: Add Error Tracking Service
**Severity**: Low | **Effort**: 4 hours | **Risk**: Low

**Action Plan**:
- Integrate Sentry or Bugsnag
- Add to error boundaries
- Track actionable errors

---

### P3-4: Improve OAuth Security
**Severity**: Low | **Effort**: 4 hours | **Risk**: Medium

**Action Plan**:
- Add JWT signature verification
- Validate token structure
- Implement token refresh

---

## Success Metrics

### Week 1 Targets
- [ ] All P0 issues resolved
- [ ] Critical security risks mitigated
- [ ] No app crashes from corrupted storage

### Week 2 Targets
- [ ] All P1 issues resolved
- [ ] Technical debt reduced by 40%
- [ ] Quality score improved to 75+

### Week 3-4 Targets
- [ ] All P2 issues resolved
- [ ] Code complexity reduced
- [ ] Quality score improved to 80+

---

## Tracking

### Issue Resolution Progress

| Priority | Total | Resolved | In Progress | Pending |
|----------|-------|----------|-------------|---------|
| P0 | 3 | 0 | 0 | 3 |
| P1 | 4 | 0 | 0 | 4 |
| P2 | 4 | 0 | 0 | 4 |
| P3 | 4 | 0 | 0 | 4 |

### Quality Score Trend

| Week | Score | Change | Target |
|------|-------|--------|--------|
| 0 (audit) | 68 | - | 80 |
| 1 | - | +10 | 78 |
| 2 | - | +7 | 80 |
| 4 | - | +5 | 85 |

---

## Notes

- Estimate total effort: ~50 hours
- Recommended team size: 1-2 developers
- Estimated completion: 4 weeks
- Suggested approach: Tackle P0 first, then P1 in parallel

---

**Roadmap Version**: 1.0.0
**Last Updated**: 2026-01-26
**Next Review**: End of Week 1
