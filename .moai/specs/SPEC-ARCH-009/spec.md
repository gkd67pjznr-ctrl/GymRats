# SPEC-ARCH-009: Zustand Migration (Complete)

**TAG BLOCK**: SPEC-ARCH-009

---

## Priority

**Priority**: P2 (Medium)

**Rationale**: State management consistency is important for maintainability and reliability, but not blocking immediate feature work. Migration should be completed incrementally to minimize disruption.

---

## User Story

As a developer, I want all module-level state management migrated to Zustand with AsyncStorage persistence using `createQueuedJSONStorage` so that the codebase is consistent, maintainable, and survives app closes without data loss.

---

## Environment

### Current State

The Forgerank app has partial Zustand migration with inconsistencies:

**✅ Already Migrated (Zustand + createQueuedJSONStorage)**:
- `src/lib/stores/currentSessionStore.ts` - Active workout session state

**⚠️ Partially Migrated (Zustand but using createJSONStorage)**:
- `src/lib/stores/workoutStore.ts` - Workout history
- `src/lib/stores/settingsStore.ts` - User preferences
- `src/lib/stores/routinesStore.ts` - User routines
- `src/lib/stores/friendsStore.ts` - Friend relationships
- `src/lib/stores/socialStore.ts` - Posts, reactions, comments
- `src/lib/stores/feedStore.ts` - Feed posts
- `src/lib/stores/chatStore.ts` - Chat threads and messages

**✅ Zustand (No persistence - Supabase handles this)**:
- `src/lib/stores/authStore.ts` - Authentication state

**❌ Not Migrated (Custom implementation)**:
- `src/lib/workoutPlanStore.ts` - Current workout plan (manual listener pattern)

### Technical Constraints

- **React Native 0.81** with New Architecture enabled
- **Expo 54** runtime
- **Zustand 5.x** with middleware support
- **AsyncStorage** for local persistence
- **PersistQueue** utility for sequential writes to prevent race conditions

---

## Assumptions

1. **Persistence Strategy**: `createQueuedJSONStorage()` from `src/lib/stores/storage/createQueuedAsyncStorage.ts` is the preferred persistence mechanism
2. **Backward Compatibility**: Migration must preserve existing data stored in AsyncStorage
3. **Testing Target**: All stores require >85% test coverage per quality.yaml
4. **Hydration Pattern**: All persisted stores must use the `hydrated: boolean` state pattern to gate UI rendering
5. **API Compatibility**: Existing imperative getter/setter functions should be preserved for non-React code

---

## Functional Requirements

### FR-1: Migrate workoutStore to createQueuedJSONStorage

**Priority**: High

**WHEN** the workoutStore is updated **THEN** the system **SHALL** use `createQueuedJSONStorage()` for AsyncStorage persistence.

**Rationale**: Workout history is critical user data. Queued writes prevent race conditions during rapid set logging.

**Implementation Details**:
- Replace `storage: createJSONStorage(() => AsyncStorage)` with `storage: createQueuedJSONStorage()`
- Preserve storage key: `workoutSessions.v2`
- Maintain migration logic from `workoutSessions.v1` if present
- Ensure `hydrated` state is properly set via `onRehydrateStorage`

**Success Criteria**:
- Workout sessions persist across app closes
- No data loss during migration from v2 storage
- All existing tests pass with new storage mechanism

---

### FR-2: Migrate settingsStore to createQueuedJSONStorage

**Priority**: High

**WHEN** the settingsStore is updated **THEN** the system **SHALL** use `createQueuedJSONStorage()` for AsyncStorage persistence.

**Rationale**: User preferences must persist reliably. Settings changes are infrequent but critical when they occur.

**Implementation Details**:
- Replace `storage: createJSONStorage(() => AsyncStorage)` with `storage: createQueuedJSONStorage()`
- Preserve storage key: `forgerank.settings.v2`
- Maintain default values for all settings
- Ensure `hydrated` state is properly set via `onRehydrateStorage`

**Success Criteria**:
- Settings persist across app closes
- Default values are applied on first launch
- All settings (haptics, sounds, units, rest timer) persist correctly

---

### FR-3: Migrate routinesStore to createQueuedJSONStorage

**Priority**: High

**WHEN** the routinesStore is updated **THEN** the system **SHALL** use `createQueuedJSONStorage()` for AsyncStorage persistence.

**Rationale**: User-created routines are valuable user-generated content that must be preserved.

**Implementation Details**:
- Replace `storage: createJSONStorage(() => AsyncStorage)` with `storage: createQueuedJSONStorage()`
- Preserve storage key: `routines.v2`
- Maintain upsert and delete actions
- Ensure `hydrated` state is properly set via `onRehydrateStorage`

**Success Criteria**:
- Routines persist across app closes
- Upsert and delete operations work correctly
- Routine sorting by `updatedAtMs` is preserved

---

### FR-4: Migrate friendsStore to createQueuedJSONStorage

**Priority**: Medium

**WHEN** the friendsStore is updated **THEN** the system **SHALL** use `createQueuedJSONStorage()` for AsyncStorage persistence.

**Rationale**: Friend relationships are social data that must persist across sessions.

**Implementation Details**:
- Replace `storage: createJSONStorage(() => AsyncStorage)` with `storage: createQueuedJSONStorage()`
- Preserve storage key: `friends.v2`
- Maintain V1 to V2 migration logic in `onRehydrateStorage`
- Preserve mock data seeding for fresh installs
- Ensure `hydrated` state is properly set via `onRehydrateStorage`

**Success Criteria**:
- Friend edges persist correctly
- V1 migration works for existing users
- Mock data seeds for new users
- Status checks (friends, pending, requested, blocked) work correctly

---

### FR-5: Migrate socialStore to createQueuedJSONStorage

**Priority**: Medium

**WHEN** the socialStore is updated **THEN** the system **SHALL** use `createQueuedJSONStorage()` for AsyncStorage persistence.

**Rationale**: Social posts, reactions, and comments are user-generated content that must persist.

**Implementation Details**:
- Replace `storage: createJSONStorage(() => AsyncStorage)` with `storage: createQueuedJSONStorage()`
- Preserve storage key: `social.v2`
- Maintain V1 to V2 migration logic in `onRehydrateStorage`
- Preserve mock data seeding for fresh installs
- Ensure `hydrated` state is properly set via `onRehydrateStorage`

**Success Criteria**:
- Posts, reactions, comments persist correctly
- Like and comment counts update correctly
- Mock data seeds for new users

---

### FR-6: Migrate feedStore to createQueuedJSONStorage

**Priority**: Medium

**WHEN** the feedStore is updated **THEN** the system **SHALL** use `createQueuedJSONStorage()` for AsyncStorage persistence.

**Rationale**: Feed posts are social content that must persist across sessions.

**Implementation Details**:
- Replace `storage: createJSONStorage(() => AsyncStorage)` with `storage: createQueuedJSONStorage()`
- Preserve storage key: `feed.v2`
- Maintain V1 to V2 migration logic in `onRehydrateStorage`
- Preserve mock data seeding for fresh installs
- Ensure `hydrated` state is properly set via `onRehydrateStorage`

**Success Criteria**:
- Feed posts persist correctly
- Like toggling works correctly
- Visibility rules (public/friends) are enforced
- Mock data seeds for new users

---

### FR-7: Migrate chatStore to createQueuedJSONStorage

**Priority**: Medium

**WHEN** the chatStore is updated **THEN** the system **SHALL** use `createQueuedJSONStorage()` for AsyncStorage persistence.

**Rationale**: Chat threads and messages are social content that must persist across sessions.

**Implementation Details**:
- Replace `storage: createJSONStorage(() => AsyncStorage)` with `storage: createQueuedJSONStorage()`
- Preserve storage key: `chat.v2`
- Maintain V1 to V2 migration logic in `onRehydrateStorage`
- Preserve mock data seeding for fresh installs
- Preserve ephemeral typing state (not persisted)
- Ensure `hydrated` state is properly set via `onRehydrateStorage`

**Success Criteria**:
- Threads and messages persist correctly
- Read state persists correctly
- Typing indicators work (ephemeral, not persisted)
- Mock data seeds for new users

---

### FR-8: Migrate workoutPlanStore to Zustand

**Priority**: High

**WHEN** the workoutPlanStore is migrated **THEN** the system **SHALL** use Zustand with `createQueuedJSONStorage()` for AsyncStorage persistence.

**Rationale**: workoutPlanStore is the last remaining custom state management implementation. Migrating it to Zustand completes the migration goal.

**Implementation Details**:
- Create new file: `src/lib/stores/workoutPlanStore.ts`
- Use Zustand `create()` with `persist` middleware
- Use `createQueuedJSONStorage()` for persistence
- Preserve storage key: `currentPlan.v1` (or bump to `currentPlan.v2`)
- Maintain existing API:
  - `setCurrentPlan(plan: WorkoutPlan | null)`
  - `getCurrentPlan(): WorkoutPlan | null`
  - `updateCurrentPlan(updater: (prev: WorkoutPlan) => WorkoutPlan)`
  - `clearCurrentPlan()`
  - `useCurrentPlan(): WorkoutPlan | null`
- Add `hydrated: boolean` state and `setHydrated` action
- Replace custom listener pattern with Zustand hooks
- Update re-export in `src/lib/workoutPlanStore.ts` to point to new location
- Deprecate old `hydrateWorkoutPlanStore()` function (no-op with Zustand)

**Success Criteria**:
- Current plan persists across app closes
- All existing API functions work correctly
- Hooks (`useCurrentPlan`) work correctly
- No data loss during migration

---

## Non-Functional Requirements

### NFR-1: Consistency

**STATE**: All stores use Zustand as the state management library.

**JUSTIFICATION**: Consistent state management patterns improve code maintainability and reduce cognitive load for developers.

**VERIFICATION**:
- No non-Zustand state management implementations remain in `src/lib/`
- All stateful modules export from `src/lib/stores/`

---

### NFR-2: Test Coverage

**STATE**: All stores have comprehensive tests with >85% coverage.

**JUSTIFICATION**: State management is critical infrastructure. High test coverage ensures reliability and prevents data loss bugs.

**VERIFICATION**:
- Run `npm run test:coverage` for all store tests
- Each store has dedicated test file in `__tests__/src/lib/stores/`
- Tests cover:
  - State initialization
  - Actions (add, update, delete)
  - Persistence (hydration, rehydration)
  - Migration from V1 storage (if applicable)
  - Edge cases (null inputs, duplicate keys, etc.)

---

### NFR-3: Backward Compatibility

**STATE**: Migration preserves existing user data in AsyncStorage.

**JUSTIFICATION**: Users must not lose data during the migration. Existing data in V1/V2 storage must be migrated correctly.

**VERIFICATION**:
- V1 to V2 migration logic in `onRehydrateStorage` works correctly
- No data loss when upgrading from previous app versions
- Storage key changes are handled via migration logic

---

### NFR-4: Performance

**STATE**: State updates and persistence do not block the UI thread.

**JUSTIFICATION**: State management should not cause jank or slow UI interactions. Queued writes prevent AsyncStorage blocking.

**VERIFICATION**:
- State updates complete synchronously (Zustand store updates)
- Persistence is queued and handled asynchronously (PersistQueue)
- No ANR (Application Not Responding) warnings during rapid state updates

---

### NFR-5: Type Safety

**STATE**: All stores have complete TypeScript type definitions.

**JUSTIFICATION**: TypeScript prevents runtime errors and improves developer experience.

**VERIFICATION**:
- All state interfaces are exported
- All actions are typed
- No `any` types in store implementations
- Selectors are typed functions

---

## Constraints

### CON-1: API Compatibility

Existing imperative getter/setter functions must be preserved for non-React code.

**Example**:
```typescript
// Must preserve these functions for backwards compatibility
export function getWorkoutSessions(): WorkoutSession[];
export function addWorkoutSession(session: WorkoutSession): void;
```

### CON-2: Storage Key Bumping

When storage structure changes, bump the storage key version (e.g., `v2` → `v3`) and add migration logic.

### CON-3: Hydration Pattern

All persisted stores must follow the hydration pattern:
```typescript
interface State {
  hydrated: boolean;
  // ... other state
}

// In persist config:
onRehydrateStorage: () => (state) => {
  state?.setHydrated(true);
}
```

### CON-4: Re-Export Pattern

For stores moved from `src/lib/` to `src/lib/stores/`, preserve the old path with a re-export:
```typescript
// src/lib/workoutPlanStore.ts (after migration)
export {
  useCurrentPlan,
  getCurrentPlan,
  // ... other exports
} from "./stores/workoutPlanStore";
```

---

## Out of Scope

- **Supabase Integration**: Supabase-specific state (auth, remote sync) is out of scope for this migration
- **Server State**: Queries and mutations for remote data are not part of this SPEC
- **UI State**: Component-level state (e.g., modal open/close, input values) should use React `useState`, not global stores
- **PersistenceQueue Implementation**: The `PersistQueue` utility is already implemented and is not part of this migration

---

## Traceability

**TAG**: SPEC-ARCH-009

**Related SPECs**:
- None (standalone architecture migration)

**Dependencies**:
- `src/lib/stores/storage/createQueuedAsyncStorage.ts` - Must exist and be functional
- `src/lib/utils/PersistQueue.ts` - Global queue for sequential writes

**Affected Files**:
- `src/lib/stores/workoutStore.ts`
- `src/lib/stores/settingsStore.ts`
- `src/lib/stores/routinesStore.ts`
- `src/lib/stores/friendsStore.ts`
- `src/lib/stores/socialStore.ts`
- `src/lib/stores/feedStore.ts`
- `src/lib/stores/chatStore.ts`
- `src/lib/workoutPlanStore.ts` (custom → Zustand migration)
- `src/lib/stores/workoutPlanStore.ts` (new file)

---

## Definitions

**createQueuedJSONStorage**: Custom Zustand storage adapter that uses `PersistQueue` for sequential AsyncStorage writes. Prevents race conditions when state updates occur rapidly.

**Hydration**: The process of loading persisted state from AsyncStorage into the Zustand store on app startup.

**Persisted Store**: A Zustand store with `persist` middleware that saves state to AsyncStorage.

**Ephemeral State**: State that is not persisted (e.g., typing indicators, loading states).

---

**SPEC Status**: Draft
**Version**: 1.0.0
**Created**: 2025-01-26
