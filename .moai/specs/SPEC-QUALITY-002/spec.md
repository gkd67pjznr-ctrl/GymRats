# SPEC-QUALITY-002: P0 Critical Fixes

**Version:** 1.0.0
**Status:** Draft
**Created:** 2026-01-26
**Author:** Quality Remediation Agent
**Priority:** Critical

---

## 1. Overview

### 1.1 Purpose

This specification defines the implementation of critical P0 fixes identified in SPEC-QUALITY-001 Comprehensive Code Audit. These fixes address high-severity issues that pose immediate stability and security risks to the Forgerank workout tracking application.

### 1.2 Scope

**In Scope:**
- Silent error catch block replacement (32 instances)
- Unsafe JSON.parse hardening (20 instances)
- Type safety restoration in critical PR detection flow (14 `as any` casts)

**Out of Scope:**
- P1 issues (duplicate utilities, deprecated code cleanup)
- P2 issues (file size reduction, import style standardization)
- P3 issues (test coverage improvements, React Query migration)

### 1.3 Background

The SPEC-QUALITY-001 audit revealed **66 total P0 issues** across three critical categories:

| Category | Count | Severity | Risk |
|----------|-------|----------|------|
| Silent error catches | 32 | High | Silent failures, no user feedback |
| Unsafe JSON.parse | 20 | Critical | App crashes from corrupted storage |
| `as any` type casts | 14 | High | Type safety bypass in PR detection |

These issues directly impact:
- **Stability**: App crashes from corrupted AsyncStorage
- **User Experience**: Silent failures leave users confused
- **Maintainability**: Type safety gaps in core workout logic

---

## 2. Requirements (EARS Format)

### 2.1 Silent Error Catch Block Replacement

#### REQ-P0-001: Replace Silent Catch Blocks with Error Logging
**EARS:** WHEN an error is caught in any catch block, the system SHALL log the error context to console for debugging.

**Acceptance Criteria:**
- All `.catch(() => {})` patterns replaced with logging handlers
- Error context includes: function name, error message, stack trace
- Logs use structured format with context prefix

#### REQ-P0-002: Replace Silent Catch Blocks with User Feedback
**EARS:** WHEN an error occurs in user-facing operations, the system SHALL display a toast notification with appropriate error message.

**Acceptance Criteria:**
- Critical operations (auth, data sync) show user-facing errors
- Toast messages are user-friendly (not technical error dumps)
- Toast functionality exists or is added for affected screens

#### REQ-P0-003: Create Reusable Error Handler Utility
**EARS:** The system SHALL provide a centralized error handling utility for consistent error logging and toast notifications.

**Acceptance Criteria:**
- Utility function accepts: context string, error object, optional toast function
- Utility logs with `__DEV__` guard for production safety
- Utility handles both Error objects and unknown types

### 2.2 Unsafe JSON.parse Hardening

#### REQ-P0-004: Wrap All JSON.parse Calls in Try-Catch
**EARS:** WHEN parsing JSON from AsyncStorage or external sources, the system SHALL wrap JSON.parse in try-catch with fallback handling.

**Acceptance Criteria:**
- All 20 identified unsafe JSON.parse calls are wrapped
- Fallback values are type-safe and match expected return types
- Parse failures log error context for debugging

#### REQ-P0-005: Create Safe JSON Parse Utility
**EARS:** The system SHALL provide a type-safe JSON parsing utility with generic fallback support.

**Acceptance Criteria:**
- Generic function accepts: raw string (or null), fallback value of type T
- Returns fallback value on parse failure (not undefined)
- Logs parse failures with context
- Handles null/undefined input gracefully

#### REQ-P0-006: Validate Critical Stored Data Structures
**EARS:** WHEN hydrating critical stores (auth, workout session, social data), the system SHALL validate parsed data structure before use.

**Acceptance Criteria:**
- Schema validation using runtime type checking (Zod or manual)
- Invalid data triggers reset to default state
- Validation failures log warning with data context

### 2.3 Type Safety Restoration

#### REQ-P0-007: Define Interfaces for PR Detection Flow
**EARS:** The system SHALL define explicit TypeScript interfaces for `detectCueForWorkingSet` function parameters and return type.

**Acceptance Criteria:**
- `DetectCueParams` interface with all required fields typed
- `DetectCueResult` interface with typed return structure
- Interfaces exported for use in calling code

#### REQ-P0-008: Remove `as any` Type Assertions in PR Detection
**EARS:** WHEN calling `detectCueForWorkingSet` function, the system SHALL use typed parameters instead of `as any` casts.

**Acceptance Criteria:**
- All 14 `as any` casts in `useWorkoutOrchestrator.ts` removed
- Function calls use properly typed parameters
- Return values accessed via typed interfaces (not assertions)

#### REQ-P0-009: Type Optional Expo Modules
**EARS:** The system SHALL define proper TypeScript interfaces for optional Expo modules (Haptics, Speech) instead of declaring as `any`.

**Acceptance Criteria:**
- `HapticsModule` interface defined with available methods
- `SpeechModule` interface defined with available methods
- Module declarations use union types with null

---

## 3. Technical Approach

### 3.1 Error Handler Utility

**Location:** `src/lib/errorHandler.ts`

**Implementation:**
```typescript
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
  // Log error context (DEV-only)
  if (__DEV__) {
    console.error(`[${context}] Error:`, error);
  }

  // Show user-facing toast if function provided
  toastFn?.(userMessage);
}
```

### 3.2 Safe JSON Parse Utility

**Location:** `src/lib/storage/safeJSONParse.ts`

**Implementation:**
```typescript
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

### 3.3 PR Detection Type Definitions

**Location:** `src/lib/perSetCue.ts` (extend existing)

**Interfaces:**
```typescript
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

### 3.4 Implementation Order

**Phase 1: Foundation (Priority High)**
1. Create error handler utility
2. Create safe JSON parse utility
3. Define PR detection interfaces
4. Write unit tests for utilities

**Phase 2: Error Catch Replacement (Priority High)**
1. Replace silent catches in active stores (not `_old/`)
2. Add toast notifications where needed
3. Test error scenarios manually

**Phase 3: JSON Parse Hardening (Priority Critical)**
1. Replace all unsafe JSON.parse with safe utility
2. Add data validation for critical stores
3. Test with corrupted AsyncStorage data

**Phase 4: Type Safety (Priority High)**
1. Update `detectCueForWorkingSet` signature with interfaces
2. Remove all `as any` casts from `useWorkoutOrchestrator.ts`
3. Type Haptics and Speech modules properly
4. Verify TypeScript compilation with `--noEmit`

---

## 4. File Inventory

### 4.1 Files Requiring Silent Catch Replacement

**Active Stores** (Priority High):
```
src/lib/devMode.ts:105
src/lib/notificationPrefs.ts:104
src/lib/stores/feedStore.ts
src/lib/stores/friendsStore.ts
src/lib/stores/chatStore.ts
src/lib/stores/socialStore.ts
```

**Screen Components** (Priority Medium):
```
app/new-message.tsx:24
app/create-post.tsx:29
app/friends.tsx:43
app/u/[id].tsx:55
```

**Deprecated Stores** (Priority Low - will be deleted):
```
src/lib/_old/chatStore.ts (10 instances)
src/lib/_old/socialStore.ts (5 instances)
src/lib/_old/feedStore.ts (5 instances)
src/lib/_old/friendsStore.ts (2 instances)
```

### 4.2 Files Requiring JSON.parse Hardening

**Priority Critical** (Active stores):
```
src/lib/workoutPlanStore.ts:44
src/lib/notificationPrefs.ts:55
src/lib/auth/oauth.ts:251
src/lib/stores/socialStore.ts:201
src/lib/stores/friendsStore.ts:126
src/lib/stores/feedStore.ts:199
src/lib/stores/chatStore.ts:246
src/lib/premadePlans/progressStore.ts:40
src/lib/premadePlans/store.ts:41
src/lib/premadePlans/useAIGeneratePlan.ts:109
```

**Priority Low** (Deprecated stores - will be deleted):
```
src/lib/_old/socialStore.ts:63
src/lib/_old/workoutStore.ts:40
src/lib/_old/friendsStore.ts:44
src/lib/_old/routinesStore.ts:26
src/lib/_old/currentSessionStore.ts:67
src/lib/_old/feedStore.ts:62
src/lib/_old/settings.ts:39
src/lib/_old/chatStore.ts:90
```

### 4.3 Files Requiring Type Safety Fixes

**Priority High** (Critical PR detection flow):
```
src/lib/hooks/useWorkoutOrchestrator.ts (14 instances at lines 95, 97, 98, 99, 112, 113, 123, 138, 139, 146, 174, 180, 230, 284)
```

**Priority Medium** (Optional module typing):
```
app/live-workout.tsx (Haptics, Speech as any at lines 42, 49)
```

---

## 5. Success Criteria

### 5.1 Stability Metrics
- [ ] Zero app crashes from corrupted AsyncStorage
- [ ] All errors logged with context for debugging
- [ ] User-facing errors shown for critical operations

### 5.2 Type Safety Metrics
- [ ] Zero `as any` casts in PR detection flow
- [ ] TypeScript compilation passes with `--noEmit`
- [ ] All exported functions have explicit return types

### 5.3 Test Coverage
- [ ] Unit tests for error handler utility
- [ ] Unit tests for safe JSON parse utility
- [ ] Characterization tests for modified stores
- [ ] Manual test: Corrupt AsyncStorage, verify app doesn't crash

---

## 6. Dependencies

### 6.1 SPEC Dependencies
- **SPEC-QUALITY-001** (must be completed): Provides audit findings and remediation roadmap

### 6.2 Technical Dependencies
- React Native Toast API (for user notifications)
- TypeScript compiler (for type safety verification)
- Jest (for unit testing utilities)

### 6.3 Resource Dependencies
- Access to AsyncStorage in development environment
- Ability to test error scenarios (network failures, corrupted data)
- Toast component library or custom implementation

---

## 7. Risks and Mitigation

### Risk 1: Breaking Changes from Type Safety Fixes
**Mitigation:** Use ANALYZE phase to create characterization tests before modifying types

### Risk 2: Toast Notifications Not Available
**Mitigation:** Make toast function optional in error handler, degrade to logging only

### Risk 3: Fallback Values Incompatible with Callers
**Mitigation:** Review each JSON.parse usage to determine appropriate fallback, run existing tests

### Risk 4: Deprecated Stores Accidentally Modified
**Mitigation:** Explicitly exclude `src/lib/_old/` from fixes (scheduled for deletion in P1)

---

## 8. References

- `/home/thomas/Forgerank/.moai/audit/audit-report.md` - Full audit report with findings
- `/home/thomas/Forgerank/.moai/audit/findings.json` - Structured findings with file locations
- `/home/thomas/Forgerank/.moai/audit/remediation-roadmap.md` - Prioritized action plan
- `/home/thomas/Forgerank/.moai/specs/SPEC-QUALITY-001/` - Parent audit SPEC
- TRUST 5 Framework - Quality validation criteria

---

## 9. Traceability

### TAG Mapping

| TAG | Description | Phase |
|-----|-------------|-------|
| TAG-P0-001 | Create error handler utility | Foundation |
| TAG-P0-002 | Create safe JSON parse utility | Foundation |
| TAG-P0-003 | Define PR detection interfaces | Foundation |
| TAG-P0-004 | Replace silent catches in active stores | Error Catch |
| TAG-P0-005 | Replace silent catches in screens | Error Catch |
| TAG-P0-006 | Replace unsafe JSON.parse in active stores | JSON Parse |
| TAG-P0-007 | Remove `as any` from useWorkoutOrchestrator | Type Safety |
| TAG-P0-008 | Type optional Expo modules | Type Safety |
| TAG-P0-009 | Verify TypeScript compilation | Type Safety |
| TAG-P0-010 | Write unit tests for utilities | Foundation |

### Requirements to TAG Mapping

- REQ-P0-001, REQ-P0-002, REQ-P0-003 -> TAG-P0-001, TAG-P0-004, TAG-P0-005
- REQ-P0-004, REQ-P0-005, REQ-P0-006 -> TAG-P0-002, TAG-P0-006
- REQ-P0-007, REQ-P0-008, REQ-P0-009 -> TAG-P0-003, TAG-P0-007, TAG-P0-008
