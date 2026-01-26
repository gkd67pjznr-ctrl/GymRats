# SPEC-QUALITY-002: Acceptance Criteria

**Version:** 1.0.0
**Status:** Draft
**Created:** 2026-01-26

---

## Overview

This document defines the acceptance criteria for SPEC-QUALITY-002 P0 Critical Fixes. All criteria must be met for the specification to be considered complete and production-ready.

---

## 1. Foundation Utilities Acceptance

### AC-FND-001: Error Handler Utility Created

**Given** the project structure includes `src/lib/` directory
**When** developer creates `src/lib/errorHandler.ts`
**Then** the file should export a `logAndToastError` function with the following:
- Accepts `context: string` parameter
- Accepts `error: unknown` parameter
- Accepts optional `toastFn?: (message: string) => void` parameter
- Accepts optional `userMessage?: string` parameter with default value
- Logs errors to console with `__DEV__` guard
- Calls toast function when provided
- Handles both Error objects and primitive types

**Verification:**
```bash
# Check file exists
test -f src/lib/errorHandler.ts

# Check exports
grep -q "export.*logAndToastError" src/lib/errorHandler.ts

# Check DEV guard
grep -q "__DEV__" src/lib/errorHandler.ts
```

### AC-FND-002: Safe JSON Parse Utility Created

**Given** the project structure includes `src/lib/storage/` directory
**When** developer creates `src/lib/storage/safeJSONParse.ts`
**Then** the file should export a `safeJSONParse` function with the following:
- Generic type parameter `<T>`
- Accepts `raw: string | null` parameter
- Accepts `fallback: T` parameter
- Returns type `T`
- Handles null input by returning fallback
- Wraps JSON.parse in try-catch
- Logs parse failures with `__DEV__` guard
- Returns fallback on parse failure

**Verification:**
```bash
# Check file exists
test -f src/lib/storage/safeJSONParse.ts

# Check exports
grep -q "export.*safeJSONParse" src/lib/storage/safeJSONParse.ts

# Check try-catch
grep -q "try.*catch" src/lib/storage/safeJSONParse.ts
```

### AC-FND-003: PR Detection Interfaces Defined

**Given** the file `src/lib/perSetCue.ts` exists
**When** developer adds type interfaces
**Then** the file should export the following:
- `DetectCueParams` interface with fields:
  - `weightKg: number`
  - `reps: number`
  - `unit: UnitSystem`
  - `exerciseName: string`
  - `prev: ExerciseSessionState`
- `DetectCueResult` interface with fields:
  - `cue: Cue | null`
  - `next: ExerciseSessionState`
  - `meta?:` nested object with type and optional label
- Updated `detectCueForWorkingSet` function signature using interfaces

**Verification:**
```bash
# Check interfaces exist
grep -q "interface DetectCueParams" src/lib/perSetCue.ts
grep -q "interface DetectCueResult" src/lib/perSetCue.ts

# Check exports
grep -q "export.*DetectCueParams" src/lib/perSetCue.ts
grep -q "export.*DetectCueResult" src/lib/perSetCue.ts
```

### AC-FND-004: Utilities Have Unit Tests

**Given** the utilities are implemented
**When** developer runs test suite
**Then** the following should pass:
- Unit tests for `errorHandler.test.ts` covering:
  - Error logging with Error object
  - Error logging with string error
  - Toast function called when provided
  - No error when toast function omitted
  - Unknown error types handled
- Unit tests for `safeJSONParse.test.ts` covering:
  - Valid JSON parsed correctly
  - Invalid JSON returns fallback
  - Null input returns fallback
  - Type information preserved
  - Parse errors logged

**Verification:**
```bash
# Run tests
npm test -- errorHandler.test.ts
npm test -- safeJSONParse.test.ts

# Check coverage
npm run test:coverage -- src/lib/errorHandler.ts
npm run test:coverage -- src/lib/storage/safeJSONParse.ts
```

---

## 2. Error Catch Block Replacement Acceptance

### AC-ERR-001: Silent Catches Removed from Active Stores

**Given** the active stores in `src/lib/stores/` and `src/lib/`
**When** developer searches for silent catch patterns
**Then** there should be zero occurrences in active files:
- `.catch(() => {})` pattern
- `.catch(() => null)` pattern
- `.catch(() => undefined)` pattern
- Empty `catch (e) {}` blocks

**Files to check:**
- `src/lib/devMode.ts`
- `src/lib/notificationPrefs.ts`
- `src/lib/stores/feedStore.ts`
- `src/lib/stores/friendsStore.ts`
- `src/lib/stores/chatStore.ts`
- `src/lib/stores/socialStore.ts`

**Verification:**
```bash
# Search for silent catches in active code
grep -rn "\.catch\s*(\s*(\(\s*\)\s*=>\s*{\s*})" src/lib/ --exclude-dir=_old
# Expected: No results in active code
```

### AC-ERR-002: Errors Logged with Context

**Given** an error occurs in any active store or screen
**When** the error is caught
**Then** the error should be logged with:
- Context prefix indicating source (e.g., `[FriendsStore]`)
- Original error object or message
- Stack trace if available

**Example log format:**
```
[FriendsStore] Error: Network request failed
    at hydrateFriends (src/lib/stores/friendsStore.ts:45:12)
```

**Verification:**
```bash
# Check for error handler imports
grep -rn "from.*errorHandler" src/lib/stores/
# Expected: At least one import per modified file

# Check for error handler calls
grep -rn "logAndToastError" src/lib/stores/
# Expected: Multiple calls with context strings
```

### AC-ERR-003: User-Facing Errors Shown for Critical Operations

**Given** a user performs a critical operation (login, data sync, post creation)
**When** the operation fails
**Then** the user should see:
- Toast notification with user-friendly message
- Message does not contain technical jargon
- Message suggests action (e.g., "Please try again")

**Critical operations requiring user feedback:**
- Authentication failures
- Data sync failures
- Friend request failures
- Post creation failures
- Message sending failures

**Verification:**
```bash
# Check for toast function calls in error handlers
grep -rn "toastFn:" src/lib/stores/ app/
# Expected: Present in critical operation handlers
```

### AC-ERR-004: Deprecated Stores Not Modified

**Given** deprecated stores exist in `src/lib/_old/`
**When** fixes are applied
**Then** the deprecated files should remain unchanged:
- Files in `src/lib/_old/` still contain silent catches
- No error handler imports added to deprecated files
- No modifications made to deprecated store logic

**Rationale:** These files will be deleted in P1 fixes, modifying them is wasted effort.

**Verification:**
```bash
# Check _old files are unchanged (still have silent catches)
grep -rn "\.catch\s*(\s*(\(\s*\)\s*=>\s*{\s*})" src/lib/_old/
# Expected: Results present (files not modified)
```

---

## 3. JSON Parse Hardening Acceptance

### AC-JSON-001: Unsafe JSON.parse Removed from Active Stores

**Given** active stores in `src/lib/` and `src/lib/stores/`
**When** developer searches for unsafe JSON.parse patterns
**Then** there should be zero occurrences of:
- `JSON.parse(raw)` without try-catch wrapper
- `JSON.parse(raw)` not using `safeJSONParse` utility

**Files to verify:**
- `src/lib/workoutPlanStore.ts`
- `src/lib/notificationPrefs.ts`
- `src/lib/auth/oauth.ts`
- `src/lib/stores/socialStore.ts`
- `src/lib/stores/friendsStore.ts`
- `src/lib/stores/feedStore.ts`
- `src/lib/stores/chatStore.ts`
- `src/lib/premadePlans/progressStore.ts`
- `src/lib/premadePlans/store.ts`
- `src/lib/premadePlans/useAIGeneratePlan.ts`

**Verification:**
```bash
# Search for direct JSON.parse usage (without safeJSONParse)
grep -rn "JSON.parse" src/lib/ --exclude-dir=_old | grep -v "safeJSONParse"
# Expected: No results in active code
```

### AC-JSON-002: Safe JSON Parse Utility Used

**Given** any code needs to parse JSON from AsyncStorage or external sources
**When** the parsing is performed
**Then** the `safeJSONParse` utility should be used with:
- Type parameter matching expected data type
- Appropriate fallback value (null or default state)
- Raw string passed as first argument

**Example correct usage:**
```typescript
// Type-safe with fallback
const data = safeJSONParse<WorkoutPlan>(raw, null);

// With default object fallback
const settings = safeJSONParse<UserSettings>(raw, defaultSettings);
```

**Verification:**
```bash
# Check for safeJSONParse imports
grep -rn "from.*safeJSONParse" src/lib/ src/lib/premadePlans/
# Expected: Present in all files that parse JSON

# Check for usage pattern
grep -rn "safeJSONParse<" src/lib/ src/lib/premadePlans/
# Expected: Generic type parameter present
```

### AC-JSON-003: Corrupted Data Does Not Crash App

**Given** AsyncStorage contains corrupted JSON data
**When** the app launches and attempts to hydrate stores
**Then** the app should:
- Not crash or throw unhandled exceptions
- Log parse errors to console (DEV mode only)
- Use fallback values for corrupted data
- Initialize store with default state

**Manual Test Scenario:**
1. Launch app and create some data
2. Manually corrupt AsyncStorage JSON (add trailing comma, invalid syntax)
3. Restart app
4. Verify app loads successfully
5. Verify console shows parse error (DEV mode)
6. Verify store has default/clean state

**Verification:**
```bash
# TypeScript compilation should pass
npx tsc --noEmit
# Expected: No errors

# App should not crash on startup
npm start
# Manual: App loads without crash
```

### AC-JSON-004: Critical Stores Have Data Validation

**Given** critical stores (auth, session) hydrate from AsyncStorage
**When** data is parsed but structure is invalid
**Then** the store should:
- Validate data structure (using Zod or manual checks)
- Reset to default state on validation failure
- Log validation warning
- Not use invalid data

**Critical stores requiring validation:**
- Auth store (user object, session token)
- Session store (current workout state)
- Social store (posts, friend data)

**Verification:**
```bash
# Check for validation logic in critical stores
grep -rn "safeParse\|validate\|schema" src/lib/stores/authStore.ts
grep -rn "safeParse\|validate\|schema" src/lib/stores/currentSessionStore.ts

# Or check for manual validation
grep -rn "if.*data.*undefined\|if.*!data" src/lib/stores/ | grep -A5 "JSON.parse\|safeJSONParse"
```

---

## 4. Type Safety Restoration Acceptance

### AC-TYPE-001: `as any` Removed from PR Detection Flow

**Given** the file `src/lib/hooks/useWorkoutOrchestrator.ts`
**When** developer searches for `as any` casts
**Then** there should be zero occurrences of:
- `as any` in function parameters
- `as any` in return value access
- `as any` in variable declarations

**Specific lines to verify:**
95, 97, 98, 99, 112, 113, 123, 138, 139, 146, 174, 180, 230, 284

**Verification:**
```bash
# Search for 'as any' in useWorkoutOrchestrator.ts
grep -n "as any" src/lib/hooks/useWorkoutOrchestrator.ts
# Expected: No results
```

### AC-TYPE-002: PR Detection Uses Typed Interfaces

**Given** the `detectCueForWorkingSet` function is called
**When** parameters are passed
**Then** the function should:
- Accept `DetectCueParams` interface as parameter type
- Return `DetectCueResult` interface
- Not require type assertions for parameters
- Not require type assertions for return values

**Example correct usage:**
```typescript
// Parameters typed by interface
const params: DetectCueParams = {
  weightKg,
  reps,
  unit,
  exerciseName,
  prev,
};

// Return value typed by interface
const result: DetectCueResult = detectCueForWorkingSet(params);

// Property access without assertions
const cue = result.cue;
const next = result.next;
```

**Verification:**
```bash
# Check for interface usage
grep -n "DetectCueParams\|DetectCueResult" src/lib/hooks/useWorkoutOrchestrator.ts
# Expected: Present and used correctly

# TypeScript compilation should pass
npx tsc --noEmit src/lib/hooks/useWorkoutOrchestrator.ts
# Expected: No type errors
```

### AC-TYPE-003: Optional Expo Modules Properly Typed

**Given** the file `app/live-workout.tsx`
**When** developer checks Haptics and Speech module declarations
**Then** the modules should be typed as:
- Union type with null: `HapticsModule | null`
- Interface defining available methods
- No `any` type used

**Expected interfaces:**
```typescript
interface HapticsModule {
  notificationAsync?: (type: NotificationFeedbackType) => Promise<void>;
  impactAsync?: (style: ImpactFeedbackStyle) => Promise<void>;
}

interface SpeechModule {
  stop?: () => void;
  speak?: (text: string, options?: SpeakOptions) => void;
}
```

**Verification:**
```bash
# Check for interface definitions
grep -n "interface.*Module" app/live-workout.tsx
# Expected: HapticsModule and SpeechModule defined

# Check variable declarations use interfaces
grep -n "Haptics:\|Speech:" app/live-workout.tsx | grep -v "any"
# Expected: Uses interface types, not 'any'
```

### AC-TYPE-004: TypeScript Compilation Passes

**Given** all type safety fixes are applied
**When** developer runs TypeScript compiler
**Then** the compilation should succeed with:
- Zero type errors
- Zero implicit any errors
- All type assertions justified

**Verification:**
```bash
# Full project TypeScript check
npx tsc --noEmit
# Expected: Exit code 0, no errors

# Check for specific error types
npx tsc --noEmit 2>&1 | grep -i "error TS"
# Expected: No results
```

---

## 5. Quality Gates Acceptance

### AC-QUAL-001: TRUST 5 Compliance

**Tested:**
- [ ] Unit tests exist for all new utilities
- [ ] Characterization tests exist for modified stores
- [ ] Test coverage exceeds 85% for modified files

**Readable:**
- [ ] Code follows existing naming conventions
- [ ] Functions have clear, descriptive names
- [ ] Error messages are user-friendly

**Unified:**
- [ ] Error handling pattern consistent across codebase
- [ ] All imports use `@/` alias
- [ ] Code style matches existing patterns

**Secured:**
- [ ] No sensitive data in console logs (DEV guard used)
- [ ] Error messages don't leak implementation details
- [ ] User-facing errors are sanitized

**Trackable:**
- [ ] All changes reference TAG IDs
- [ ] Git commits follow conventional commit format
- [ ] Error logs include context for debugging

### AC-QUAL-002: Linting and Formatting

**Given** all changes are made
**When** developer runs linter
**Then** there should be:
- Zero ESLint errors
- Zero ESLint warnings (or justified exceptions)
- Code formatted according to project rules

**Verification:**
```bash
# Run linter
npm run lint
# Expected: No errors

# Check formatting
npm run format
# Expected: All files formatted
```

### AC-QUAL-003: Test Coverage

**Given** all utilities and modified code
**When** developer runs coverage report
**Then** the following should meet targets:
- New utilities: 90%+ coverage
- Modified stores: No regression in coverage
- Overall project: 85%+ coverage maintained

**Verification:**
```bash
# Generate coverage report
npm run test:coverage

# Check specific files
cat coverage/lcov-report/src/lib/errorHandler.ts/index.html
cat coverage/lcov-report/src/lib/storage/safeJSONParse.ts/index.html
```

### AC-QUAL-004: No Regressions

**Given** the existing test suite
**When** developer runs all tests
**Then** the following should pass:
- All existing unit tests
- All integration tests
- No new test failures introduced

**Verification:**
```bash
# Run full test suite
npm test

# Check exit code
echo $?
# Expected: 0
```

---

## 6. End-to-End Scenarios

### SCENARIO-001: User Experiences Network Failure

**Given** the user has a weak network connection
**When** the user attempts to refresh their feed
**Then** the system should:
1. Detect network error
2. Log error with context: `[FeedStore] Failed to fetch feed: Network request failed`
3. Display toast: "Unable to refresh feed. Please check your connection."
4. Keep existing feed data visible (no blank state)

**Acceptance Steps:**
1. Open app and load feed
2. Enable airplane mode
3. Pull to refresh
4. Verify toast appears
5. Verify console logs error (DEV mode)
6. Verify feed doesn't go blank

### SCENARIO-002: AsyncStorage Corrupted on App Launch

**Given** the user's AsyncStorage contains corrupted JSON
**When** the user launches the app
**Then** the system should:
1. Attempt to parse stored data
2. Detect JSON syntax error
3. Log error with context: `[workoutPlanStore] Failed to parse stored data`
4. Initialize store with default empty state
5. App loads successfully without crashing

**Acceptance Steps:**
1. Launch app and create workout plan
2. Use AsyncStorage debugger to corrupt JSON (add trailing comma)
3. Kill and restart app
4. Verify app launches successfully
5. Verify console shows parse error (DEV mode)
6. Verify workout plan shows empty/default state

### SCENARIO-003: PR Detection Type Safety

**Given** the user completes a set during workout
**When** the system evaluates the set for PR detection
**Then** the system should:
1. Pass typed parameters to `detectCueForWorkingSet`
2. Receive typed `DetectCueResult` response
3. Access properties without type assertions
4. Correctly identify PR if conditions met

**Acceptance Steps:**
1. Start workout
2. Complete a set with heavy weight
3. Verify PR detection logic executes
4. Verify no TypeScript errors in flow
5. Verify PR cue displayed if achieved

### SCENARIO-004: Silent Error Catch Fixed

**Given** a store hydration function previously had silent catch
**When** hydration fails
**Then** the system should:
1. Catch the error
2. Log error with context
3. Optionally show user-facing toast
4. Not silently ignore the error

**Acceptance Steps:**
1. Find a store with `.catch(() => {})` (before fix)
2. Verify after fix: `.catch((err) => logAndToastError(...))`
3. Trigger error scenario (e.g., invalid data)
4. Verify console logs error
5. Verify user sees toast (if critical operation)

---

## 7. Definition of Done

A P0 fix is considered complete when:

1. **Code Implementation:**
   - [ ] All utility functions created and tested
   - [ ] All silent catches replaced in active code
   - [ ] All unsafe JSON.parse calls hardened
   - [ ] All `as any` casts removed from PR flow
   - [ ] TypeScript compilation passes

2. **Testing:**
   - [ ] Unit tests pass for new utilities
   - [ ] Characterization tests pass for modified code
   - [ ] Manual testing scenarios completed
   - [ ] Test coverage meets 85%+ threshold

3. **Quality:**
   - [ ] Zero ESLint errors
   - [ ] Zero TypeScript type errors
   - [ ] Code reviewed against TRUST 5 principles
   - [ ] Documentation updated (if needed)

4. **Verification:**
   - [ ] App launches successfully with corrupted storage
   - [ ] Errors are logged with context
   - [ ] User-facing errors displayed for critical operations
   - [ ] No crashes from invalid data

---

## 8. Sign-off Criteria

### Pre-Completion Checklist
- [ ] All Phase tasks completed
- [ ] All acceptance criteria met
- [ ] Code reviewed for accuracy
- [ ] Changes verified against source code
- [ ] Manual testing scenarios passed

### Final Deliverables
- [ ] `src/lib/errorHandler.ts` - Error handling utility
- [ ] `src/lib/storage/safeJSONParse.ts` - Safe JSON parse utility
- [ ] `src/lib/perSetCue.ts` - Updated with PR detection interfaces
- [ ] Unit tests for all utilities
- [ ] All active stores updated with error handling
- [ ] All active stores updated with safe JSON parsing
- [ ] `useWorkoutOrchestrator.ts` - Type safety restored

### Verification Commands

```bash
# Check for remaining silent catches (should return 0 in active code)
grep -rn "\.catch\s*(\s*(\(\s*\)\s*=>\s*{\s*})" src/lib/ --exclude-dir=_old

# Check for unsafe JSON.parse (should return 0 in active code)
grep -rn "JSON.parse" src/lib/ --exclude-dir=_old | grep -v "safeJSONParse"

# Check for 'as any' in PR flow (should return 0)
grep -n "as any" src/lib/hooks/useWorkoutOrchestrator.ts

# TypeScript compilation check
npx tsc --noEmit

# Run tests
npm test

# Run linter
npm run lint
```

---

## Acceptance Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Implementation Lead | | | |
| Technical Reviewer | | | |
| Quality Gate | | | |
