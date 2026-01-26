# SPEC-QUALITY-002: Implementation Plan

**Version:** 1.0.0
**Status:** Draft
**Created:** 2026-01-26

---

## Phase Overview

| Phase | Name | Duration | Dependencies | TAG Count |
|-------|------|----------|--------------|-----------|
| 1 | Foundation Utilities | 0.5 day | None | 3 |
| 2 | Error Catch Replacement | 1 day | Phase 1 | 2 |
| 3 | JSON Parse Hardening | 1 day | Phase 1 | 1 |
| 4 | Type Safety Restoration | 0.5 day | Phase 1 | 2 |
| 5 | Testing and Verification | 0.5 day | Phases 2-4 | 2 |

**Total Estimated Duration:** 3.5 days

---

## Phase 1: Foundation Utilities

### Objectives
- Create centralized error handling utility
- Create safe JSON parse utility
- Define type interfaces for PR detection
- Write unit tests for all utilities

### Tasks

#### TAG-P0-001: Create Error Handler Utility
**File:** `src/lib/errorHandler.ts`

**Implementation Steps:**
1. Create function signature with typed parameters
2. Add `__DEV__` guard for console logging
3. Add optional toast function parameter
4. Handle both Error objects and unknown types
5. Export function for use across codebase

**Code Structure:**
```typescript
// src/lib/errorHandler.ts
interface ErrorHandlerOptions {
  context: string;
  error: unknown;
  toastFn?: (message: string) => void;
  userMessage?: string;
}

export function logAndToastError({
  context,
  error,
  toastFn,
  userMessage = "Something went wrong. Please try again."
}: ErrorHandlerOptions): void {
  if (__DEV__) {
    console.error(`[${context}] Error:`, error);
  }
  toastFn?.(userMessage);
}
```

**Testing:**
- Unit test with Error object
- Unit test with string error
- Unit test without toast function
- Unit test with custom user message

#### TAG-P0-002: Create Safe JSON Parse Utility
**File:** `src/lib/storage/safeJSONParse.ts`

**Implementation Steps:**
1. Create generic function with type parameter T
2. Handle null/undefined input gracefully
3. Wrap JSON.parse in try-catch
4. Log parse failures with `__DEV__` guard
5. Return typed fallback value on failure

**Code Structure:**
```typescript
// src/lib/storage/safeJSONParse.ts
export function safeJSONParse<T>(
  raw: string | null,
  fallback: T
): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    if (__DEV__) {
      console.error('[safeJSONParse] Failed to parse:', err);
    }
    return fallback;
  }
}
```

**Testing:**
- Unit test with valid JSON
- Unit test with invalid JSON (returns fallback)
- Unit test with null input (returns fallback)
- Unit test with malformed JSON

#### TAG-P0-003: Define PR Detection Interfaces
**File:** `src/lib/perSetCue.ts` (extend existing)

**Implementation Steps:**
1. Define `DetectCueParams` interface with all fields
2. Define `DetectCueResult` interface with nested types
3. Export interfaces for use in `useWorkoutOrchestrator.ts`
4. Update `detectCueForWorkingSet` function signature

**Code Structure:**
```typescript
// src/lib/perSetCue.ts
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

export function detectCueForWorkingSet(
  params: DetectCueParams
): DetectCueResult {
  // Existing implementation
}
```

**Testing:**
- TypeScript compilation verification
- Type checking in calling code

### Deliverables
- [ ] Error handler utility created and tested
- [ ] Safe JSON parse utility created and tested
- [ ] PR detection interfaces defined
- [ ] All utilities exported and documented

---

## Phase 2: Error Catch Block Replacement

### Objectives
- Replace silent catches in active stores
- Replace silent catches in screen components
- Add user-facing error notifications

### Tasks

#### TAG-P0-004: Replace Silent Catches in Active Stores
**Files:**
- `src/lib/devMode.ts:105`
- `src/lib/notificationPrefs.ts:104`
- `src/lib/stores/feedStore.ts`
- `src/lib/stores/friendsStore.ts`
- `src/lib/stores/chatStore.ts`
- `src/lib/stores/socialStore.ts`

**Implementation Pattern:**
```typescript
// Before
hydrateFriends().catch(() => {});

// After
import { logAndToastError } from '@/src/lib/errorHandler';

hydrateFriends().catch((err) => {
  logAndToastError({
    context: 'FriendsStore',
    error: err,
    toastFn: showErrorToast,
    userMessage: 'Failed to load friends. Please refresh.'
  });
});
```

**Steps:**
1. Import error handler utility
2. Replace empty catch with error handler call
3. Add context-appropriate error messages
4. Add toast function if available

#### TAG-P0-005: Replace Silent Catches in Screen Components
**Files:**
- `app/new-message.tsx:24`
- `app/create-post.tsx:29`
- `app/friends.tsx:43`
- `app/u/[id].tsx:55`

**Implementation Pattern:**
```typescript
// Before
hydrateFriends().catch(() => {});

// After
import { useToast } from '@/src/ui/toast'; // Or equivalent
import { logAndToastError } from '@/src/lib/errorHandler';

const showToast = useToast();

hydrateFriends().catch((err) => {
  logAndToastError({
    context: 'FriendsScreen',
    error: err,
    toastFn: showToast,
    userMessage: 'Failed to load friends. Please refresh.'
  });
});
```

**Excluded Files (Deprecated):**
- `src/lib/_old/*` - Will be deleted in P1 fixes

### Deliverables
- [ ] All silent catches in active stores replaced
- [ ] All silent catches in screens replaced
- [ ] Error context logged for all failures
- [ ] User-facing toasts added where appropriate

---

## Phase 3: JSON Parse Hardening

### Objectives
- Replace all unsafe JSON.parse calls in active stores
- Add data validation for critical stores
- Test with corrupted AsyncStorage

### Tasks

#### TAG-P0-006: Replace Unsafe JSON.parse in Active Stores
**Files (Priority Critical):**
- `src/lib/workoutPlanStore.ts:44`
- `src/lib/notificationPrefs.ts:55`
- `src/lib/auth/oauth.ts:251`
- `src/lib/stores/socialStore.ts:201`
- `src/lib/stores/friendsStore.ts:126`
- `src/lib/stores/feedStore.ts:199`
- `src/lib/stores/chatStore.ts:246`
- `src/lib/premadePlans/progressStore.ts:40`
- `src/lib/premadePlans/store.ts:41`
- `src/lib/premadePlans/useAIGeneratePlan.ts:109`

**Implementation Pattern:**
```typescript
// Before
function load(): WorkoutPlan | null {
  const raw = AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) as WorkoutPlan : null;
}

// After
import { safeJSONParse } from '@/src/lib/storage/safeJSONParse';

function load(): WorkoutPlan | null {
  const raw = AsyncStorage.getItem(STORAGE_KEY);
  return safeJSONParse(raw, null);
}
```

**Steps:**
1. Import safeJSONParse utility
2. Replace `JSON.parse(raw) as Type` with `safeJSONParse(raw, fallback)`
3. Verify fallback value matches expected null/default state
4. Test with corrupted AsyncStorage data

**Data Validation for Critical Stores:**
For auth and session stores, add runtime validation:
```typescript
// Example: Auth store validation
import { z } from 'zod';

const AuthStateSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
  }).nullable(),
  session: z.object({
    token: z.string(),
    expiresAt: z.number(),
  }).nullable(),
});

function load(): AuthState {
  const raw = AsyncStorage.getItem(AUTH_KEY);
  const parsed = safeJSONParse(raw, defaultAuthState);

  // Validate structure
  const result = AuthStateSchema.safeParse(parsed);
  if (!result.success) {
    console.warn('[AuthStore] Invalid data, resetting to default');
    return defaultAuthState;
  }

  return result.data;
}
```

**Excluded Files (Deprecated):**
- `src/lib/_old/*` - Will be deleted in P1 fixes

### Deliverables
- [ ] All unsafe JSON.parse calls replaced
- [ ] Critical stores have data validation
- [ ] App handles corrupted AsyncStorage gracefully
- [ ] No crashes from invalid JSON data

---

## Phase 4: Type Safety Restoration

### Objectives
- Remove `as any` casts from PR detection flow
- Type optional Expo modules properly
- Verify TypeScript compilation

### Tasks

#### TAG-P0-007: Remove `as any` from useWorkoutOrchestrator
**File:** `src/lib/hooks/useWorkoutOrchestrator.ts`

**Affected Lines:**
95, 97, 98, 99, 112, 113, 123, 138, 139, 146, 174, 180, 230, 284

**Implementation Pattern:**
```typescript
// Before
const res = detectCueForWorkingSet({
  weightKg: wKg,
  reps,
  unit,
  exerciseName: exerciseName(exerciseId),
  prev,
} as any);

const cue: Cue | null = (res as any)?.cue ?? null;
const nextState: ExerciseSessionState = (res as any)?.next ?? prev;

// After
const res = detectCueForWorkingSet({
  weightKg: wKg,
  reps,
  unit,
  exerciseName: exerciseName(exerciseId),
  prev,
});

const cue = res.cue;
const nextState = res.next;
```

**Steps:**
1. Import `DetectCueParams` and `DetectCueResult` interfaces
2. Remove all `as any` casts from function parameters
3. Remove all `as any` casts from return value access
4. Use typed property access instead of assertions

#### TAG-P0-008: Type Optional Expo Modules
**File:** `app/live-workout.tsx`

**Implementation:**
```typescript
// Before
let Haptics: any = null;
let Speech: any = null;

// After
interface HapticsModule {
  notificationAsync?: (type: NotificationFeedbackType) => Promise<void>;
  impactAsync?: (style: ImpactFeedbackStyle) => Promise<void>;
}

interface SpeechModule {
  stop?: () => void;
  speak?: (text: string, options?: SpeakOptions) => void;
}

let Haptics: HapticsModule | null = null;
let Speech: SpeechModule | null = null;
```

**Steps:**
1. Define `HapticsModule` interface with available methods
2. Define `SpeechModule` interface with available methods
3. Update variable declarations to use union types

### Deliverables
- [ ] All `as any` casts removed from PR detection flow
- [ ] Expo modules properly typed
- [ ] TypeScript compilation passes with `--noEmit`

---

## Phase 5: Testing and Verification

### Objectives
- Write unit tests for new utilities
- Create characterization tests for modified stores
- Manual testing with error scenarios

### Tasks

#### TAG-P0-009: Write Unit Tests for Utilities
**Files:**
- `src/lib/__tests__/errorHandler.test.ts`
- `src/lib/storage/__tests__/safeJSONParse.test.ts`

**Test Cases for errorHandler:**
```typescript
describe('logAndToastError', () => {
  it('logs error in DEV mode', () => {
    const spy = jest.spyOn(console, 'error');
    logAndToastError({ context: 'Test', error: new Error('test') });
    expect(spy).toHaveBeenCalled();
  });

  it('calls toast function when provided', () => {
    const toastFn = jest.fn();
    logAndToastError({ context: 'Test', error: 'test', toastFn });
    expect(toastFn).toHaveBeenCalled();
  });

  it('handles unknown error types', () => {
    expect(() => {
      logAndToastError({ context: 'Test', error: null });
    }).not.toThrow();
  });
});
```

**Test Cases for safeJSONParse:**
```typescript
describe('safeJSONParse', () => {
  it('parses valid JSON', () => {
    expect(safeJSONParse('{"a":1}', null)).toEqual({ a: 1 });
  });

  it('returns fallback for invalid JSON', () => {
    expect(safeJSONParse('invalid', null)).toBe(null);
  });

  it('returns fallback for null input', () => {
    expect(safeJSONParse(null, { default: true })).toEqual({ default: true });
  });

  it('preserves type information', () => {
    type MyType = { value: number };
    const result: MyType = safeJSONParse('{"value":42}', { value: 0 });
    expect(result.value).toBe(42);
  });
});
```

#### TAG-P0-010: Manual Testing with Error Scenarios
**Test Scenarios:**

1. **Corrupted AsyncStorage Test:**
   - Manually corrupt stored JSON in AsyncStorage
   - Launch app and verify no crash
   - Verify error logged and fallback used

2. **Network Failure Test:**
   - Disable network connection
   - Trigger data sync operations
   - Verify user-friendly error toast shown

3. **Type Safety Verification:**
   - Run `npx tsc --noEmit`
   - Verify zero type errors
   - Verify zero `as any` in PR detection flow

4. **Error Logging Test:**
   - Trigger various error scenarios
   - Check console for structured error logs
   - Verify all errors have context prefix

### Deliverables
- [ ] Unit tests pass for all utilities
- [ ] Characterization tests pass for modified stores
- [ ] Manual testing confirms no crashes
- [ ] TypeScript compilation succeeds

---

## Risk Mitigation

### Risk 1: Breaking Changes from Type Safety Fixes
**Mitigation:**
- Run ANALYZE phase before modifications
- Create characterization tests for affected code
- Run existing test suite after each change

### Risk 2: Missing Toast Functionality
**Mitigation:**
- Make toast function optional in error handler
- Degrade gracefully to logging only
- Document screens that need toast implementation

### Risk 3: Incompatible Fallback Values
**Mitigation:**
- Review each JSON.parse usage context
- Determine appropriate null/default value
- Test with existing test suite

### Risk 4: Accidentally Modifying Deprecated Code
**Mitigation:**
- Explicitly exclude `src/lib/_old/` from all fixes
- Add comment: // DEPRECATED: Will be deleted in P1-003
- Focus only on active stores in `src/lib/stores/`

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Silent catches removed | 100% active code | Grep for `.catch(\(\) => {})`, expect 0 in active code |
| Unsafe JSON.parse removed | 100% active code | Grep for `JSON.parse` without try-catch, expect 0 |
| `as any` casts removed | 100% PR flow | Grep for `as any` in useWorkoutOrchestrator.ts, expect 0 |
| TypeScript errors | 0 | `npx tsc --noEmit` passes |
| Unit test coverage | 90%+ for utilities | Jest coverage report |
| App crashes from bad data | 0 | Manual test with corrupted storage |

---

## Milestone Summary

### Milestone 1: Foundation Complete (Day 0.5)
- Utilities created and tested
- Interfaces defined
- Ready for application changes

### Milestone 2: Error Handling Complete (Day 1.5)
- All silent catches replaced
- User notifications added
- Error logging implemented

### Milestone 3: Storage Safety Complete (Day 2.5)
- All JSON.parse hardened
- Data validation added
- Corrupted data handled gracefully

### Milestone 4: Type Safety Complete (Day 3)
- All `as any` casts removed
- Optional modules typed
- TypeScript compilation verified

### Milestone 5: Testing Complete (Day 3.5)
- Unit tests passing
- Manual testing complete
- Ready for code review

---

## Next Steps After Implementation

1. **SPEC-QUALITY-003**: Refactor large files (P2)
2. **SPEC-QUALITY-004**: Consolidate duplicate utilities (P1)
3. **SPEC-QUALITY-005**: Add DEV guards to console statements (P1)
4. **SPEC-QUALITY-006**: Delete deprecated _old/ directory (P1)
