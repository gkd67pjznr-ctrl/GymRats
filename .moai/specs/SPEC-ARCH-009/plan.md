# Implementation Plan: SPEC-ARCH-009 - Zustand Migration (Complete)

**TAG**: SPEC-ARCH-009

---

## Overview

Complete the Zustand migration by updating all remaining stores to use `createQueuedJSONStorage()` and migrating the last custom implementation (`workoutPlanStore`) to Zustand.

---

## Milestones

### Milestone 1: Update Existing Stores to createQueuedJSONStorage (Priority: Primary)

**Objective**: Migrate all existing Zustand stores from `createJSONStorage(() => AsyncStorage)` to `createQueuedJSONStorage()`.

**Stores to Update**:
- workoutStore
- settingsStore
- routinesStore
- friendsStore
- socialStore
- feedStore
- chatStore

**Success Criteria**:
- All stores use `createQueuedJSONStorage()`
- All existing tests pass
- No data loss during migration
- Persistence works correctly across app closes

---

### Milestone 2: Migrate workoutPlanStore to Zustand (Priority: Primary)

**Objective**: Migrate the last custom state implementation to Zustand with proper persistence.

**Deliverables**:
- New `src/lib/stores/workoutPlanStore.ts` using Zustand
- Re-export in `src/lib/workoutPlanStore.ts` for backward compatibility
- Tests for the new store

**Success Criteria**:
- workoutPlanStore uses Zustand with `createQueuedJSONStorage()`
- All existing API functions work correctly
- Current plan persists across app closes
- Tests achieve >85% coverage

---

### Milestone 3: Test Coverage Verification (Priority: Secondary)

**Objective**: Ensure all stores have comprehensive test coverage.

**Deliverables**:
- Test files for all stores in `__tests__/src/lib/stores/`
- Coverage report showing >85% for each store

**Success Criteria**:
- All store tests pass
- Coverage report shows >85% for each store
- Tests cover initialization, actions, persistence, and migration logic

---

### Milestone 4: Documentation and Cleanup (Priority: Final)

**Objective**: Update documentation and clean up deprecated code.

**Deliverables**:
- Update CLAUDE.md with final store patterns
- Remove deprecated `_old/` store files if migration is complete
- Verify no unused imports or code

**Success Criteria**:
- Documentation reflects current architecture
- No deprecated code remains
- Codebase is clean and consistent

---

## Technical Approach

### Phase 1: Storage Migration Pattern

For each store using `createJSONStorage(() => AsyncStorage)`, apply the following change:

**Before**:
```typescript
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useMyStore = create<MyState>()(
  persist(
    (set, get) => ({ /* ... */ }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // ... other config
    }
  )
);
```

**After**:
```typescript
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";

export const useMyStore = create<MyState>()(
  persist(
    (set, get) => ({ /* ... */ }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      // ... other config
    }
  )
);
```

**Key Changes**:
1. Remove `createJSONStorage` import
2. Remove `AsyncStorage` import (no longer needed in store file)
3. Import `createQueuedJSONStorage` from storage utility
4. Replace `storage: createJSONStorage(() => AsyncStorage)` with `storage: createQueuedJSONStorage()`

### Phase 2: workoutPlanStore Migration

**Step 1: Create new Zustand store**

Create `src/lib/stores/workoutPlanStore.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import type { WorkoutPlan } from "../workoutPlanModel";

const STORAGE_KEY = "currentPlan.v2";

interface WorkoutPlanState {
  plan: WorkoutPlan | null;
  hydrated: boolean;

  // Actions
  setPlan: (plan: WorkoutPlan | null) => void;
  updatePlan: (updater: (prev: WorkoutPlan) => WorkoutPlan) => void;
  clearPlan: () => void;
  setHydrated: (value: boolean) => void;
}

export const useWorkoutPlanStore = create<WorkoutPlanState>()(
  persist(
    (set, get) => ({
      plan: null,
      hydrated: false,

      setPlan: (plan) => set({ plan }),

      updatePlan: (updater) => {
        const current = get().plan;
        if (!current) return;
        set({ plan: updater(current) });
      },

      clearPlan: () => set({ plan: null }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({ plan: state.plan }),
      onRehydrateStorage: () => (state) => {
        // V1 to V2 migration
        AsyncStorage.getItem("currentPlan.v1").then((v1Data) => {
          if (v1Data && state) {
            try {
              const parsed = JSON.parse(v1Data) as WorkoutPlan;
              state.plan = parsed;
              AsyncStorage.removeItem("currentPlan.v1");
            } catch (e) {
              console.error("[workoutPlanStore] Migration failed:", e);
            }
          }
          state?.setHydrated(true);
        });
      },
    }
  )
);

// Selectors
export const selectPlan = (state: WorkoutPlanState) => state.plan;

// Hooks
export function useCurrentPlan(): WorkoutPlan | null {
  return useWorkoutPlanStore(selectPlan);
}

// Imperative getters
export function getCurrentPlan(): WorkoutPlan | null {
  return useWorkoutPlanStore.getState().plan;
}

// Imperative actions
export function setCurrentPlan(plan: WorkoutPlan | null): void {
  useWorkoutPlanStore.getState().setPlan(plan);
}

export function updateCurrentPlan(updater: (prev: WorkoutPlan) => WorkoutPlan): void {
  useWorkoutPlanStore.getState().updatePlan(updater);
}

export function clearCurrentPlan(): void {
  useWorkoutPlanStore.getState().clearPlan();
}

// Legacy hydrate function (no-op with Zustand)
export async function hydrateWorkoutPlanStore(): Promise<void> {
  // Zustand handles hydration automatically
}

// Legacy subscribe function (no-op with Zustand)
export function subscribeCurrentPlan(listener: () => void): () => void {
  return () => {};
}
```

**Step 2: Update re-export in `src/lib/workoutPlanStore.ts`**

```typescript
// src/lib/workoutPlanStore.ts
// RE-EXPORT: This file now re-exports from the new Zustand store location
// All functionality has been migrated to src/lib/stores/workoutPlanStore.ts

export {
  useWorkoutPlanStore,
  useCurrentPlan,
  getCurrentPlan,
  setCurrentPlan,
  updateCurrentPlan,
  clearCurrentPlan,
  hydrateWorkoutPlanStore,
  subscribeCurrentPlan,
} from "./stores/workoutPlanStore";
```

**Step 3: Verify all imports work correctly**

Run grep to find all imports of workoutPlanStore:
```bash
grep -r "workoutPlanStore" src/ app/
```

Update any direct imports if necessary.

### Phase 3: Testing Strategy

**Test Structure**:

For each store, create tests in `__tests__/src/lib/stores/{storeName}.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useWorkoutStore } from '@/src/lib/stores/workoutStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('workoutStore', () => {
  beforeEach(async () => {
    // Clear AsyncStorage before each test
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useWorkoutStore());
      expect(result.current.sessions).toEqual([]);
    });
  });

  describe('actions', () => {
    it('should add a session', () => {
      const { result } = renderHook(() => useWorkoutStore());
      const session = createMockSession();

      act(() => {
        result.current.addSession(session);
      });

      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.sessions[0]).toEqual(session);
    });
  });

  describe('persistence', () => {
    it('should persist state to AsyncStorage', async () => {
      const { result, unmount } = renderHook(() => useWorkoutStore());
      const session = createMockSession();

      act(() => {
        result.current.addSession(session);
      });

      // Unmount to trigger persistence
      unmount();

      // Remount to verify persistence
      const { result: result2 } = renderHook(() => useWorkoutStore());

      // Wait for hydration
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result2.current.sessions).toHaveLength(1);
    });
  });
});
```

**Test Coverage Goals**:
- State initialization: 100%
- Actions (add, update, delete): 90%+
- Persistence (hydration, rehydration): 85%+
- Migration logic (V1 to V2): 80%+
- Edge cases: 80%+

---

## Architecture Design

### Store Pattern Reference

**Standard Store Structure**:

```typescript
// 1. Imports
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";

// 2. Types
interface MyState {
  data: DataType[];
  hydrated: boolean;

  // Actions
  addItem: (item: DataType) => void;
  updateItem: (id: string, updates: Partial<DataType>) => void;
  deleteItem: (id: string) => void;
  setHydrated: (value: boolean) => void;
}

// 3. Storage key
const STORAGE_KEY = "myStore.v2";

// 4. Store creation
export const useMyStore = create<MyState>()(
  persist(
    (set, get) => ({
      // Initial state
      data: [],
      hydrated: false,

      // Actions
      addItem: (item) => set((state) => ({
        data: [item, ...state.data],
      })),

      updateItem: (id, updates) => set((state) => ({
        data: state.data.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      })),

      deleteItem: (id) => set((state) => ({
        data: state.data.filter((item) => item.id !== id),
      })),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({ data: state.data }),
      onRehydrateStorage: () => (state) => {
        // Optional: V1 to V2 migration
        state?.setHydrated(true);
      },
    }
  )
);

// 5. Selectors
export const selectData = (state: MyState) => state.data;
export const selectIsHydrated = (state: MyState) => state.hydrated;

// 6. Hooks
export function useData(): DataType[] {
  return useMyStore(selectData);
}

// 7. Imperative getters
export function getData(): DataType[] {
  return useMyStore.getState().data;
}

// 8. Imperative actions
export function addItem(item: DataType): void {
  useMyStore.getState().addItem(item);
}
```

### Directory Structure (After Migration)

```
src/lib/
├── stores/
│   ├── storage/
│   │   └── createQueuedAsyncStorage.ts  (existing)
│   ├── currentSessionStore.ts  (already migrated)
│   ├── workoutStore.ts  (update to createQueuedJSONStorage)
│   ├── settingsStore.ts  (update to createQueuedJSONStorage)
│   ├── routinesStore.ts  (update to createQueuedJSONStorage)
│   ├── authStore.ts  (no changes needed)
│   ├── friendsStore.ts  (update to createQueuedJSONStorage)
│   ├── socialStore.ts  (update to createQueuedJSONStorage)
│   ├── feedStore.ts  (update to createQueuedJSONStorage)
│   ├── chatStore.ts  (update to createQueuedJSONStorage)
│   ├── workoutPlanStore.ts  (NEW - migrate from custom)
│   └── index.ts  (re-export all stores)
├── workoutPlanStore.ts  (re-export to stores/)
└── _old/
    ├── workoutStore.ts  (deprecated)
    ├── routinesStore.ts  (deprecated)
    ├── currentSessionStore.ts  (deprecated)
    ├── socialStore.ts  (deprecated)
    ├── feedStore.ts  (deprecated)
    └── chatStore.ts  (deprecated)
```

---

## Risks and Response Plans

### Risk 1: Data Loss During Migration

**Likelihood**: Low
**Impact**: High

**Mitigation**:
- Test migration logic thoroughly before deployment
- Preserve V1 data until V2 is confirmed working
- Add error logging in `onRehydrateStorage`
- Consider backup mechanism for critical data

**Response Plan**:
- If data loss occurs: Restore from AsyncStorage backup if available
- Improve error handling in migration logic
- Issue hotfix with corrected migration code

---

### Risk 2: AsyncStorage Write Blocking

**Likelihood**: Low
**Impact**: Medium

**Mitigation**:
- Use `createQueuedJSONStorage()` to serialize writes
- Monitor for ANR (Application Not Responding) warnings
- Test with rapid state updates

**Response Plan**:
- If blocking occurs: Verify PersistQueue is working correctly
- Check for missing `await` in queue operations
- Consider write throttling if issue persists

---

### Risk 3: Breaking Existing Imports

**Likelihood**: Medium
**Impact**: Medium

**Mitigation**:
- Use re-export pattern for backward compatibility
- Grep for all imports before changing file locations
- Test all screens that use stores

**Response Plan**:
- If imports break: Update all affected imports
- Ensure re-exports are in place before moving files

---

### Risk 4: Test Coverage Below Target

**Likelihood**: Medium
**Impact**: Low

**Mitigation**:
- Write tests alongside implementation
- Use coverage reports to identify gaps
- Focus on critical paths first

**Response Plan**:
- If coverage is low: Add more test cases for missing paths
- Document any intentionally untested code (e.g., error logging)

---

## Execution Order

1. **Verify createQueuedJSONStorage works correctly**
   - Run existing tests for currentSessionStore (already uses it)
   - Verify no AsyncStorage errors

2. **Migrate stores one by one**
   - Start with low-risk stores (settingsStore)
   - Progress to higher-risk stores (workoutStore, workoutPlanStore)
   - Test each store thoroughly before moving to the next

3. **Write tests for migrated stores**
   - Achieve >85% coverage for each store
   - Verify persistence and migration logic

4. **Integration testing**
   - Test app flows that use multiple stores
   - Verify no data loss or corruption

5. **Documentation and cleanup**
   - Update CLAUDE.md
   - Remove deprecated code if safe to do so
   - Verify all tests pass

---

## Rollback Plan

If critical issues arise:

1. **Revert storage changes**: Switch back to `createJSONStorage(() => AsyncStorage)`
2. **Revert workoutPlanStore migration**: Keep using custom implementation
3. **Fix issues and retry**: Address root causes before migrating again

---

**Plan Version**: 1.0.0
**Last Updated**: 2025-01-26
