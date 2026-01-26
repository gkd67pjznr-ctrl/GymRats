# Forgerank Performance Optimization Guide

**Goal:** Sub-100ms interactions, smooth 60fps animations

---

## Current Performance Baseline

### Measurements Needed

Before optimizing, measure:

```typescript
// Add performance monitoring
import { PerformanceObserver } from 'react-native';

const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

observer.observe({ entryTypes: ['measure'] });

// In components:
performance.mark('workout-start');
// ... your code
performance.mark('workout-end');
performance.measure('workout-interaction', 'workout-start', 'workout-end');
```

**Target Metrics:**
- App launch: < 2s
- Set logging: < 100ms
- Screen transitions: < 300ms
- List scrolling: 60fps (16.67ms per frame)

---

## Optimization #1: Memoization

### Problem: Expensive Recalculations

**File:** `src/lib/hooks/useLiveWorkoutSession.ts`

```typescript
// ❌ Before: Recreated every render
const kgToLb = (kg: number) => kg * 2.2046226218;
const estimateE1RMLb = (weightLb: number, reps: number) => {
  if (!weightLb || reps <= 0) return 0;
  return weightLb * (1 + reps / 30);
};

// ✅ After: Stable references
const kgToLb = useCallback((kg: number) => kg * 2.2046226218, []);
const estimateE1RMLb = useCallback((weightLb: number, reps: number) => {
  if (!weightLb || reps <= 0) return 0;
  return weightLb * (1 + reps / 30);
}, []);
```

### Apply to All Callbacks

Pattern to find: Search for `function` or arrow functions in components

```bash
# Find unmemoized functions
grep -r "const.*=.*=>" src/ui/components/ | grep -v "useCallback"
```

---

## Optimization #2: List Performance

### FlatList Configuration

**File:** `src/ui/components/LiveWorkout/ExercisePicker.tsx`

```typescript
// ❌ Before: Minimal config
<FlatList
  data={data}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
/>

// ✅ After: Optimized
<FlatList
  data={data}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  
  // Performance props
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
  updateCellsBatchingPeriod={50}
  
  // Prevent unnecessary re-renders
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Use React.memo for List Items

```typescript
const ExerciseListItem = React.memo(({ 
  item, 
  isSelected, 
  onPress 
}: ExerciseListItemProps) => {
  return (
    <Pressable onPress={() => onPress(item.id)}>
      <Text>{item.name}</Text>
    </Pressable>
  );
}, (prev, next) => {
  // Custom comparison
  return prev.item.id === next.item.id && 
         prev.isSelected === next.isSelected;
});
```

---

## Optimization #3: Reduce Re-renders

### Problem: Entire component tree re-renders on state change

**Tool:** React DevTools Profiler

1. Install: Chrome extension "React DevTools"
2. Enable: Profiler tab → Start profiling
3. Interact: Log a set
4. Stop: Review flame graph

### Fix: Split Components

**Before:**
```typescript
function LiveWorkout() {
  const [sets, setSets] = useState([]);
  const [weight, setWeight] = useState(135);
  const [reps, setReps] = useState(8);
  // Everything re-renders when sets change!
  
  return (
    <>
      <QuickAddCard weight={weight} /> {/* Unnecessary re-render */}
      <ExerciseBlocks sets={sets} />
    </>
  );
}
```

**After:**
```typescript
function LiveWorkout() {
  return (
    <>
      <QuickAddCard /> {/* Independent state */}
      <WorkoutLog />    {/* Independent state */}
    </>
  );
}

const QuickAddCard = React.memo(() => {
  const [weight, setWeight] = useState(135);
  const [reps, setReps] = useState(8);
  // Only this re-renders
});
```

---

## Optimization #4: Async Operations

### Problem: UI Blocks on AsyncStorage Writes

**File:** `src/lib/currentSessionStore.ts`

```typescript
// ❌ Before: Blocks UI thread
async function persist() {
  await AsyncStorage.setItem(KEY, JSON.stringify(current));
}

export function updateCurrentSession(updater) {
  current = updater(current);
  persist(); // Fire-and-forget, but still blocks
  notify();
}
```

**Solution 1: Web Workers (for heavy computation)**

```typescript
// src/lib/workers/workout-processor.ts
export async function processWorkoutInBackground(session) {
  // Heavy computation here
  return result;
}
```

**Solution 2: Batching (for frequent writes)**

```typescript
import { debounce } from 'lodash';

const persistQueue: CurrentSession[] = [];

const debouncedPersist = debounce(async () => {
  if (persistQueue.length === 0) return;
  
  const latest = persistQueue[persistQueue.length - 1];
  persistQueue.length = 0; // Clear queue
  
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(latest));
  } catch (err) {
    console.error('Persist failed:', err);
  }
}, 500);

export function updateCurrentSession(updater) {
  current = updater(current);
  persistQueue.push(current);
  debouncedPersist();
  notify();
}
```

---

## Optimization #5: Image Optimization

### Current Issue

```typescript
// Loading full-res images
<Image source={require('./assets/icon.png')} />
```

### Solution: expo-image

```bash
npm install expo-image
```

**Usage:**

```typescript
import { Image } from 'expo-image';

<Image
  source={require('./assets/icon.png')}
  contentFit="cover"
  transition={200}
  // Blurhash placeholder
  placeholder={require('./assets/icon-thumb.png')}
/>
```

**Benefits:**
- Automatic caching
- Progressive loading
- Lower memory usage

---

## Optimization #6: Animation Performance

### Use React Native Reanimated

**Already installed!** Check `package.json`:
```json
"react-native-reanimated": "~4.1.1"
```

### Optimize Animations

**File:** `src/ui/components/LiveWorkout/InstantCueToast.tsx`

```typescript
// ❌ Before: JavaScript-based animation
Animated.timing(opacity, {
  toValue: 1,
  duration: 180,
  useNativeDriver: true, // Good!
}).start();
```

**✅ Already using native driver!** 

Keep using `useNativeDriver: true` for all animations.

### Animation Checklist

- [x] `useNativeDriver: true` in all Animated calls
- [ ] Use `react-native-reanimated` for complex animations
- [ ] Avoid animating `width`/`height` (use `transform` instead)
- [ ] Use `LayoutAnimation` for layout changes

---

## Optimization #7: Bundle Size

### Analyze Bundle

```bash
npx expo-cli export --dev --public-url / --output-dir dist
du -sh dist/*
```

### Lazy Load Screens

**File:** `app/_layout.tsx`

```typescript
import { lazy, Suspense } from 'react';

// ❌ Before: All imported upfront
import History from './history';
import Calendar from './calendar';

// ✅ After: Lazy load
const History = lazy(() => import('./history'));
const Calendar = lazy(() => import('./calendar'));

function Routes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Stack.Screen name="history" component={History} />
      <Stack.Screen name="calendar" component={Calendar} />
    </Suspense>
  );
}
```

### Tree Shaking

Ensure imports are specific:

```typescript
// ❌ Bad: Imports entire library
import _ from 'lodash';

// ✅ Good: Only imports debounce
import debounce from 'lodash/debounce';
```

---

## Optimization #8: Database Queries

### Future: When You Add SQLite

**Install:**
```bash
npx expo install expo-sqlite
```

**Optimize Queries:**

```typescript
// ❌ Before: Load everything
const sessions = await db.getAllAsync('SELECT * FROM workouts');

// ✅ After: Paginate + index
const sessions = await db.getAllAsync(`
  SELECT * FROM workouts 
  WHERE user_id = ?
  ORDER BY started_at DESC 
  LIMIT 20 OFFSET ?
`, [userId, offset]);

// Create index
await db.execAsync(`
  CREATE INDEX IF NOT EXISTS idx_workouts_user_date 
  ON workouts(user_id, started_at DESC)
`);
```

---

## Optimization #9: Memory Management

### Monitor Memory Usage

```typescript
import { PerformanceObserver } from 'react-native';

const memoryObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.name === 'memory') {
      console.log(`Memory: ${entry.memory.usedJSHeapSize / 1024 / 1024}MB`);
    }
  });
});

memoryObserver.observe({ entryTypes: ['memory'] });
```

### Cleanup Listeners

```typescript
// ❌ Before: Memory leak
useEffect(() => {
  subscribeWorkoutSessions(() => setData(getData()));
  // Missing cleanup!
}, []);

// ✅ After: Proper cleanup
useEffect(() => {
  const unsubscribe = subscribeWorkoutSessions(() => setData(getData()));
  return unsubscribe; // ✅
}, []);
```

### Find Memory Leaks

```bash
# Search for useEffect without cleanup
grep -r "useEffect" src/ | grep -v "return" | grep -v "//"
```

---

## Performance Monitoring Setup

### Add Sentry (Optional but Recommended)

```bash
npx expo install sentry-expo
```

**Configuration:**

```typescript
// app/_layout.tsx
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableInExpoDevelopment: false,
  debug: __DEV__,
});

// Wrap root component
function App() {
  return (
    <Sentry.ErrorBoundary fallback={ErrorScreen}>
      {/* Your app */}
    </Sentry.ErrorBoundary>
  );
}
```

**Track Performance:**

```typescript
const transaction = Sentry.startTransaction({
  name: 'log-set',
  op: 'workout.interaction',
});

// ... log set

transaction.finish();
```

---

## Performance Budget

Set performance budgets:

| Metric | Budget | Current | Status |
|--------|--------|---------|--------|
| App launch | 2s | ? | 🟡 Measure |
| Set logging | 100ms | ? | 🟡 Measure |
| Screen transition | 300ms | ? | 🟡 Measure |
| Bundle size | 5MB | ? | 🟡 Measure |
| Memory usage | 100MB | ? | 🟡 Measure |

---

## Quick Wins Checklist

- [ ] Add `useCallback` to all functions passed as props
- [ ] Add `React.memo` to list items
- [ ] Configure FlatList with performance props
- [ ] Batch AsyncStorage writes
- [ ] Use expo-image for all images
- [ ] Verify `useNativeDriver: true` in all animations
- [ ] Add cleanup to all useEffect hooks
- [ ] Split large components
- [ ] Lazy load screens

**Estimated impact:** 20-40% performance improvement

---

## Advanced Optimizations (V2)

1. **Hermes Engine:** Already enabled in Expo
2. **Web Workers:** For heavy computation
3. **SQLite:** For large datasets
4. **Virtual Lists:** For 1000+ items
5. **Code Splitting:** Reduce initial bundle
6. **CDN:** For static assets

---

## Monitoring Plan

### Week 1: Baseline
- Install performance monitoring
- Measure all metrics
- Document current performance

### Week 2: Quick Wins
- Apply memoization
- Optimize lists
- Batch writes

### Week 3: Measure Improvements
- Re-measure all metrics
- Compare to baseline
- Identify remaining bottlenecks

### Week 4: Advanced
- Profile with React DevTools
- Optimize hotspots
- Final measurements

---

## Tools

**Profiling:**
- React DevTools Profiler
- Flipper (React Native debugger)
- Expo Performance Monitor

**Monitoring:**
- Sentry
- Firebase Performance
- Custom metrics

**Analysis:**
- Metro bundler stats
- Source map explorer
- Bundle analyzer

---

## Success Criteria

✅ All interactions feel instant (<100ms perceived)
✅ Smooth 60fps scrolling
✅ No jank during animations
✅ App launches in <2s
✅ Memory usage stable (<100MB)

**Current Status:** 🟡 Needs measurement & optimization
**Target Date:** 2 weeks from now
