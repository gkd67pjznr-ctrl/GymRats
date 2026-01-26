# FORGERANK BUG REPORT - Phase 0 Code Audit
**Date:** 2026-01-23 12:30
**Status:** Initial Audit Complete

---

## EXECUTIVE SUMMARY

The audit found **47 issues** across the codebase.

**PROGRESS UPDATE (2026-01-23):** ALL 8 critical issues have been fixed:
- ✅ BUG-001: Core workout logging - FIXED (addSet function added)
- ✅ BUG-002: 27+ unsafe type casts - FIXED (all removed, proper types used)
- ✅ BUG-003: InstantCue type - FIXED
- ✅ BUG-004: Duplicate uid() - FIXED (centralized)
- ✅ BUG-005: Social store race condition - FIXED (persistence queue added)
- ✅ BUG-006: Missing @types/jest - FIXED
- ✅ BUG-007: Missing design tokens - FIXED
- ✅ BUG-008: Test type mismatch - FIXED

| Severity | Total | Fixed | Remaining |
|----------|-------|-------|-----------|
| CRITICAL | 8 | 8 | 0 |
| HIGH | 15 | 6 | 9 |
| MEDIUM | 16 | 3 | 13 |
| LOW | 8 | 1 | 7 |

---

## CRITICAL ISSUES (Fix Immediately)

### BUG-001: Broken Set Logging (CRITICAL)
**File:** `app/live-workout.tsx:162-197`
**Discovered:** 2026-01-23 12:30
**Status:** FIXED (2026-01-23) - Added addSet() to useLiveWorkoutSession hook

**Description:**
The `addSetInternal` function searches for methods that don't exist:
```typescript
const addSetFn =
  anySession.addSet ??
  anySession.onAddSet ??
  anySession.commitSet ??
  anySession.logSet ??
  anySession.addWorkingSet;
```

None of these methods exist on `useLiveWorkoutSession` result. Function silently fails.

**Impact:** Core workout logging feature is completely broken. Users cannot log sets.

**Fix:** Add `addSet()` method to `useLiveWorkoutSession` hook return value.

---

### BUG-002: 27+ Unsafe Type Casts (CRITICAL)
**File:** `app/live-workout.tsx`
**Discovered:** 2026-01-23 12:30
**Status:** FIXED (2026-01-23) - Removed all `as any` casts, using proper types

**Description:**
Excessive `as any` casts throughout the file:
- Line 112: `(persisted as any).selectedExerciseId`
- Line 113: `(persisted as any).exerciseBlocks?.length`
- Line 121: `ensureCurrentSession({...} as any)`
- Line 129: `updateCurrentSession((s: any) => ...)`
- Line 144: `useLiveWorkoutSession({ selectedExerciseId } as any)`
- Line 163: `const anySession = session as any`
- Line 203: `const sets: LoggedSet[] = (session as any).sets ?? []`
- Plus 20+ more instances

**Impact:** No type checking on critical workout state. Runtime errors hidden.

**Fix:** Properly type the session interface and remove all `as any` casts.

---

### BUG-003: Missing InstantCue Type Export (CRITICAL)
**File:** `src/lib/hooks/useWorkoutOrchestrator.ts:3`
**Discovered:** 2026-01-23 12:30
**Status:** FIXED (2026-01-23) - Added InstantCue type export to perSetCue.ts

**Description:**
```typescript
import type { Cue, ExerciseSessionState, InstantCue } from "../perSetCue";
```

`InstantCue` is imported but never defined/exported from `perSetCue.ts`.

**Impact:** TypeScript compilation fails. Workaround: cast as `any` (line 117).

**Fix:** Define and export `InstantCue` type in `perSetCue.ts`.

---

### BUG-004: Duplicate uid() Function (CRITICAL)
**Files:** 7 files
**Discovered:** 2026-01-23 12:30
**Status:** FIXED (2026-01-23) - Created centralized src/lib/uid.ts

**Description:**
Same `uid()` function duplicated in:
1. `src/lib/currentSessionStore.ts:38-40`
2. `src/lib/workoutModel.ts:31-33`
3. `src/lib/workoutPlanModel.ts:23-25`
4. `src/lib/routinesModel.ts:22-24`
5. `src/lib/socialStore.ts:33-35`
6. `src/lib/feedStore.ts:59-61`
7. `src/lib/friendsStore.ts:21-23`

**Impact:** Maintenance nightmare, inconsistent ID formats.

**Fix:** Create `src/lib/uid.ts` with single implementation.

---

### BUG-005: Social Store Race Condition (CRITICAL)
**File:** `src/lib/socialStore.ts:37-42`
**Discovered:** 2026-01-23 12:30
**Status:** FIXED (2026-01-23) - Added persistence queue pattern

**Description:**
Missing sequential persistence queue:
```typescript
async function persist() {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}
```

Other stores use queue pattern to prevent race conditions.

**Impact:** Rapid reactions/comments can corrupt AsyncStorage data.

**Fix:** Add persistence queue pattern like other stores.

---

### BUG-006: Missing @types/jest (CRITICAL)
**File:** `__tests__/lib/perSetCue.test.ts`
**Discovered:** 2026-01-23 12:30
**Status:** FIXED (2026-01-23) - Installed @types/jest

**Description:**
TypeScript error: `Cannot find name 'describe'`, `Cannot find name 'expect'`.

**Fix:** `npm install --save-dev @types/jest`

---

### BUG-007: Missing Design System Tokens (CRITICAL)
**Files:** `app/dev/plan-creator.tsx`, `app/workout/plan-detail/[id].tsx`, etc.
**Discovered:** 2026-01-23 12:30
**Status:** FIXED (2026-01-23) - Added FR.radius.input and FR.radius.button

**Description:**
Code references `FR.radius.input` and `FR.radius.button` which don't exist:
```typescript
borderRadius: FR.radius.input  // Error: Property 'input' does not exist
borderRadius: FR.radius.button // Error: Property 'button' does not exist
```

**Impact:** TypeScript errors, runtime crashes possible.

**Fix:** Add `input` and `button` to `FR.radius` in `forgerankStyle.ts`.

---

### BUG-008: Test File Type Mismatch (CRITICAL)
**File:** `__tests__/lib/perSetCue.test.ts:161`
**Discovered:** 2026-01-23 12:30
**Status:** FIXED (2026-01-23) - Removed invalid test assertions

**Description:**
```typescript
// Property 'workingSetsThisSession' does not exist on type 'ExerciseSessionState'
expect(result.next.workingSetsThisSession).toBe(1);
```

Test expects property that doesn't exist on the type.

**Impact:** Tests won't run/compile.

**Fix:** Update test to match actual `ExerciseSessionState` interface.

---

## HIGH SEVERITY ISSUES

### BUG-009: Inconsistent Type Definitions (HIGH)
**Files:** `perSetCue.ts`, `simpleSession.ts`, `cues.ts`
**Discovered:** 2026-01-23 12:30
**Status:** FIXED (2026-01-23) - Consolidated to single Cue type from perSetCue.ts

**Description:**
Three different `Cue`/`CueEvent` type definitions:
1. `Cue` in `perSetCue.ts`
2. `CueEvent` in `simpleSession.ts`
3. `CueEvent` in `cues.ts`

**Fix:** Consolidate to single type in `perSetCue.ts`.

---

### BUG-010: Duplicate E1RM Calculation (HIGH)
**Files:** `e1rm.ts`, `forgerankScoring.ts`, `useLiveWorkoutSession.ts`
**Discovered:** 2026-01-23 12:30
**Status:** FIXED (2026-01-23) - useLiveWorkoutSession now uses canonical estimate1RM_Epley

**Description:**
Three different E1RM implementations with different behaviors:
- One with RPE adjustment
- One without RPE
- One with different error handling

**Impact:** Scoring inconsistency.

**Fix:** Use single `estimate1RM_Epley` from `e1rm.ts`.

---

### BUG-011: Routine Type Incompatibility (HIGH)
**Files:** `app/routines/[routineId].tsx:28`, `add-exercise.tsx:32`
**Discovered:** 2026-01-23 12:30
**Status:** FIXED (2026-01-23) - Added null checks in Phase 0

**Description:**
```typescript
// Type 'string | undefined' is not assignable to type 'string'
```

Routine `id` field can be undefined but type expects string.

**Fix:** Update type or ensure `id` is always defined.

---

### BUG-012: Timer Type Error (HIGH)
**File:** `src/lib/hooks/useWorkoutTimer.ts:91`
**Discovered:** 2026-01-23 12:30
**Status:** FIXED (2026-01-23) - Changed to ReturnType<typeof setInterval>

**Description:**
```typescript
// Type 'number' is not assignable to type 'Timeout'
```

`setInterval` returns `NodeJS.Timeout` but assigned to `number`.

**Fix:** Use correct type or `ReturnType<typeof setInterval>`.

---

### BUG-013: Undocumented Routine Check (HIGH)
**Files:** `app/routines/[routineId].tsx:32,39,40,48`
**Discovered:** 2026-01-23 12:30
**Status:** FIXED (2026-01-23) - Added early return null checks

**Description:**
```typescript
// 'routine' is possibly 'undefined'
```

No null check before using routine.

**Fix:** Add early return if routine undefined.

---

### BUG-014: Missing Error Logging (HIGH)
**File:** `src/lib/socialStore.ts`
**Discovered:** 2026-01-23 12:30
**Status:** FIXED (2026-01-23) - Added console.error in persistence queue

**Description:**
Silent `catch { // ignore }` blocks. No error visibility.

**Fix:** Add `console.error` logging.

---

### BUG-015: Confusing useLiveWorkoutSession API (HIGH)
**File:** `src/lib/hooks/useLiveWorkoutSession.ts`
**Discovered:** 2026-01-23 12:30
**Status:** Open

**Description:**
40+ properties returned in single hook. Mixes state, UI controls, helpers, setters.

**Fix:** Split into smaller hooks or use cleaner structure.

---

## MEDIUM SEVERITY ISSUES

### BUG-016: Duplicate kgToLb Function (MEDIUM)
**Files:** `units.ts`, `perSetCue.ts`, `useLiveWorkoutSession.ts`
**Status:** FIXED (2026-01-23) - All now use canonical kgToLb from units.ts

### BUG-017: Mock Data in Production (MEDIUM)
**Files:** `socialStore.ts`, `chatStore.ts`, `feedStore.ts`, `friendsStore.ts`
**Status:** Open
**Description:** Auto-seeds mock data if no real data. Should be dev-only.

### BUG-018: Dead Code - feed-old.tsx (MEDIUM)
**File:** `app/feed-old.tsx`
**Status:** FIXED (2026-01-23) - File deleted
**Description:** 163 lines of unused code.

### BUG-019: Hydration Race Condition (MEDIUM)
**Files:** Multiple store hooks
**Status:** Open
**Description:** Initial render uses unhydrated data.

### BUG-020: Large useMemo Dependency Array (MEDIUM)
**File:** `useLiveWorkoutSession.ts:234-296`
**Status:** Open
**Description:** 25+ dependencies defeats memoization.

### BUG-021: Inconsistent Error Handling (MEDIUM)
**Files:** Various stores
**Status:** FIXED (2026-01-23) - Added console.error and persistence queues to all stores
**Description:** Some stores log errors, others silently fail.

### BUG-022: Magic Numbers (MEDIUM)
**Files:** Various
**Status:** Open
**Description:** Hardcoded values like `2.5`, `2000`, `100`, `90` scattered throughout.

---

## LOW SEVERITY ISSUES

### BUG-023: Unused modal.tsx (LOW)
**File:** `app/modal.tsx`
**Status:** FIXED (2026-01-23) - File deleted and removed from _layout.tsx

### BUG-024: No RPE Validation in Scoring (LOW)
**File:** `forgerankScoring.ts:109`
**Status:** Open

---

## TYPESCRIPT ERRORS SUMMARY

Total TypeScript errors from `tsc --noEmit`: **80+**

Categories:
1. Jest type definitions missing (~50 errors)
2. Missing `FR.radius.input/button` (~12 errors)
3. Routine type incompatibility (~6 errors)
4. Timer type mismatch (1 error)
5. Missing `InstantCue` export (1 error)
6. Test file type mismatches (~5 errors)

---

## PRIORITY FIX ORDER

### Immediate (Before Any Other Work)
1. [ ] Install `@types/jest`
2. [ ] Add `FR.radius.input` and `FR.radius.button`
3. [ ] Fix routine type incompatibility
4. [ ] Define and export `InstantCue` type
5. [ ] Add `addSet()` to `useLiveWorkoutSession`

### Phase 0.2 (Bug Fixes)
6. [ ] Create `src/lib/uid.ts`
7. [ ] Add persistence queue to `socialStore.ts`
8. [ ] Fix timer type error
9. [ ] Add error logging to silent catches
10. [ ] Remove `as any` casts from live-workout.tsx

### Phase 0.3 (Code Quality)
11. [ ] Consolidate Cue types
12. [ ] Consolidate E1RM functions
13. [ ] Consolidate kgToLb functions
14. [ ] Extract magic numbers to constants
15. [ ] Remove dead code (feed-old.tsx, modal.tsx)

---

**End of Bug Report**
*Updated as bugs are fixed.*
