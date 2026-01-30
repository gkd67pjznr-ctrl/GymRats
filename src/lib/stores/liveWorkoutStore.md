# Live Workout Store

This document explains the `liveWorkoutStore` Zustand store for managing live workout session state.

## Overview

The `liveWorkoutStore` is a centralized state management solution for the live workout experience. It replaces the previous React hook-based state management (`useLiveWorkoutSession`) with a Zustand store that provides better performance, easier testing, and more predictable state updates.

## Key Features

- **Centralized State**: All workout session data in one place
- **Type Safety**: Full TypeScript support with `LiveWorkoutState` type
- **Testable**: Easy to test without React components
- **Performance**: Optimized selectors for React components
- **Validation**: Built-in weight and rep validation

## Installation

```typescript
import {
  useLiveWorkoutStore,
  useLiveWorkoutSets,
  useLiveWorkoutWeightLb,
  useLiveWorkoutReps,
  // ... other selectors
} from '@/src/lib/stores';
```

## Usage

### Basic Example

```typescript
// In a React component
const LiveWorkoutComponent = () => {
  // Select only the state you need (optimized re-renders)
  const sets = useLiveWorkoutStore((state) => state.sets);
  const weightLb = useLiveWorkoutStore((state) => state.weightLb);
  const reps = useLiveWorkoutStore((state) => state.reps);
  const { addSet, incWeight, decWeight, incReps, decReps } = useLiveWorkoutStore();

  return (
    <View>
      <Text>Weight: {weightLb} lbs</Text>
      <Text>Reps: {reps}</Text>
      <Button onPress={() => incWeight()} title="+" />
      <Button onPress={() => decWeight()} title="-" />
      <Button onPress={() => addSet('bench')} title="Add Set" />
      <Text>Sets: {sets.length}</Text>
    </View>
  );
};
```

### Using Convenience Selectors

For even better performance, use the pre-defined selectors:

```typescript
const MyComponent = () => {
  const sets = useLiveWorkoutSets();
  const weightLb = useLiveWorkoutWeightLb();
  const reps = useLiveWorkoutReps();

  // ... render
};
```

### Imperative Access (Non-React Code)

```typescript
import { getLiveWorkoutSets, getLiveWorkoutSummary } from '@/src/lib/stores';

// Get current sets
const sets = getLiveWorkoutSets();

// Get workout summary
const { setCount, totalVolumeLb } = getLiveWorkoutSummary();
```

## API Reference

### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `sets` | `LoggedSet[]` | Array of logged sets |
| `doneBySetId` | `Record<string, boolean>` | Track which sets are marked as done |
| `weightLb` | `number` | Current weight in pounds |
| `reps` | `number` | Current reps |
| `weightLbText` | `string` | Current weight as text (for input) |
| `repsText` | `string` | Current reps as text (for input) |
| `weightStep` | `number` | Weight increment step (default: 2.5) |
| `defaultsByExerciseId` | `Record<string, Defaults>` | Per-exercise defaults |

### Actions

#### Set Management

- `addSet(exerciseId: string, setType?: SetType)`: Add a new set
- `updateSet(setId: string, patch: Partial<LoggedSet>)`: Update a set
- `toggleDone(setId: string)`: Toggle done status
- `isDone(setId: string)`: Check if set is done

#### Weight Management

- `incWeight()`: Increment weight by step
- `decWeight()`: Decrement weight by step
- `onWeightText(text: string)`: Handle weight text input
- `onWeightCommit()`: Commit weight on blur
- `setWeightForSet(setId: string, text: string)`: Set weight for specific set

#### Reps Management

- `incReps()`: Increment reps
- `decReps()`: Decrement reps
- `onRepsText(text: string)`: Handle reps text input
- `onRepsCommit()`: Commit reps on blur
- `setRepsForSet(setId: string, text: string)`: Set reps for specific set

#### Exercise Defaults

- `getDefaultsForExercise(exerciseId: string)`: Get defaults for exercise
- `setDefaultsForExercise(exerciseId: string, defaults: Defaults)`: Set defaults
- `syncQuickAddToExercise(exerciseId: string)`: Sync inputs to exercise defaults

#### History Helpers

- `getLastSetForExercise(exerciseId: string)`: Get last set for exercise
- `copyFromLastSet(exerciseId: string, targetSetId: string)`: Copy from last set

#### Utility Functions

- `kgToLb(kg: number)`: Convert kg to lb
- `estimateE1RMLb(weightLb: number, reps: number)`: Estimate 1RM in lb

#### Reset

- `resetSession()`: Reset entire session to initial state

## Migration from useLiveWorkoutSession Hook

The `liveWorkoutStore` is designed as a drop-in replacement for the `useLiveWorkoutSession` hook. All the same functionality is available, but through Zustand's API.

### Before (Hook)

```typescript
const {
  sets,
  weightLb,
  reps,
  addSet,
  incWeight,
  // ...
} = useLiveWorkoutSession();
```

### After (Store)

```typescript
const {
  sets,
  weightLb,
  reps,
  addSet,
  incWeight,
  // ...
} = useLiveWorkoutStore();
```

## Testing

The store includes comprehensive tests in `src/lib/stores/__tests__/liveWorkoutStore.test.ts`. Run tests with:

```bash
npm test -- --testPathPattern="liveWorkoutStore"
```

## Performance Tips

1. **Use selectors**: Prefer `useLiveWorkoutSets()` over `useLiveWorkoutStore(state => state.sets)` for better performance
2. **Select only what you need**: Avoid selecting the entire state in components
3. **Memoize derived data**: Use `useMemo` for expensive calculations based on store state

## Persistence

Note: This store does NOT persist to AsyncStorage. For persistence, use it in conjunction with `currentSessionStore` which handles the session metadata and persistence layer.

## See Also

- `currentSessionStore.ts` - Persistent session metadata
- `loggerTypes.ts` - Type definitions for LoggedSet
- `useLiveWorkoutSession.ts` - Original hook (deprecated in favor of this store)
