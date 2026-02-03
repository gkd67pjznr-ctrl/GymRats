# Feature: Collapsible Workout Drawer

**Status:** Phase 1 Complete
**Phase:** 1 of 4 (Complete)
**Priority:** P0 - Core UX Redesign
**Created:** 2026-02-02

---

## Overview

A slide-in drawer system that contains the entire workout logging experience. When a workout is active, the drawer can be expanded to full screen or collapsed to a thin edge, allowing users to navigate the rest of the app while maintaining their workout session.

This replaces the current `/live-workout` screen navigation pattern with a persistent drawer that lives outside the navigation stack.

---

## User Stories

1. **As a user**, I want to start a workout and have it persist while I browse other parts of the app, so I can check my profile or feed without losing my workout.

2. **As a user**, I want to swipe to collapse my workout to a thin edge, so I can quickly access other features.

3. **As a user**, I want to swipe from the right edge to expand my workout back to full view, so I can continue logging.

4. **As a user**, I want to see a visual indicator (thin edge) when I have an active workout, so I always know a session is in progress.

5. **As a user**, I want to complete my workout from within the drawer, and only then have my data saved.

---

## Technical Requirements

### Gesture System
- **Collapse gesture:** Swipe right anywhere on drawer → slides off screen, thin edge remains
- **Expand gesture:** Swipe left from right edge → slides drawer back to full screen
- **Edge width:** ~20-30px visible when collapsed
- **Animation:** Smooth spring animation using Reanimated 3

### State Management
- **Global state:** Zustand store tracks:
  - `isDrawerOpen: boolean` - is drawer expanded or collapsed
  - `hasActiveWorkout: boolean` - is there an active session
  - `workoutSession: CurrentSession | null` - the session data
- **Persistence:** Session data saved to AsyncStorage only on "Complete Workout"
- **Crash recovery:** Consider periodic background saves (every 60s?) for safety

### Component Architecture
```
RootLayout
├── Stack (main navigation)
│   └── ... all screens
├── PersistentTabBar (bottom)
└── WorkoutDrawer (NEW - absolutely positioned)
    ├── DrawerEdge (thin visible edge when collapsed)
    └── DrawerContent (full workout UI when expanded)
        ├── WorkoutTopBar (header with complete button)
        ├── ExerciseCards
        └── WorkoutActions
```

### Integration Points
- **Workout Hub (tab):** Entry points trigger `startWorkout()` → opens drawer
- **PersistentTabBar:** Should remain visible when drawer is collapsed
- **Navigation:** Drawer exists outside Stack, doesn't interfere with routing
- **Deep links:** Consider how to handle `/live-workout` deep links

---

## UI/UX Specifications

### Collapsed State
- Thin edge (~24px) visible on right side of screen
- Edge shows workout indicator (pulsing dot? timer? exercise count?)
- Subtle shadow to indicate depth
- Tap edge = expand drawer

### Expanded State
- Full screen width (or 95% with subtle peek of main content?)
- Slides in from right
- Contains all workout logging UI
- Top-right: collapse icon + complete workout icon

### Transitions
- **Duration:** ~300ms
- **Easing:** Spring with damping
- **Backdrop:** Optional dim/blur of main content when expanded

### Gesture Details
- **Swipe velocity threshold:** Fast swipe completes action regardless of distance
- **Swipe distance threshold:** 50% of screen width for slow swipes
- **Edge detection zone:** 30px from right edge for expand gesture

---

## Implementation Plan

### Phase 1.1: Basic Drawer Structure ✅
- [x] Create `WorkoutDrawer` component
- [x] Create `workoutDrawerStore.ts` Zustand store
- [x] Add drawer to `_layout.tsx` (above PersistentTabBar)
- [x] Basic open/close state without gestures

### Phase 1.2: Gesture Implementation ✅
- [x] Add `GestureDetector` with pan gesture
- [x] Implement collapse (swipe right)
- [x] Implement expand (swipe from edge)
- [x] Add spring animations with Reanimated

### Phase 1.3: Edge UI ✅
- [x] Design collapsed edge indicator
- [x] Show workout status (pulsing dot, set count)
- [x] Tap-to-expand interaction

### Phase 1.4: Content Migration ✅
- [x] Basic drawer content with exercise list
- [x] Show workout timer, exercise names, set counts
- [x] Update workout tab to use drawer instead of navigation
- [x] Integrate full ExerciseCard component with set logging
- [x] Add ExercisePicker modal
- [x] Handle deep links to `/live-workout` (redirects to drawer)
- [x] Update notification handlers to use drawer
- [x] Update all navigation entry points to use drawer directly:
  - [x] `app/routines/index.tsx` - Quick start from routine list
  - [x] `app/routines/[routineId].tsx` - Start workout from routine detail
  - [x] `app/workout/plan-detail/[id].tsx` - Start workout from plan detail
  - [x] `app/workout/start.tsx` - Free workout and routine preview modal
- [ ] Migrate rest timer and PR celebration (Phase 2)

### Phase 1.5: Polish & Edge Cases ✅
- [x] Handle keyboard interactions (dismiss on scroll)
- [x] Handle modals/overlays within drawer (rest timer, exercise picker)
- [x] Rest timer integration (auto-starts on set completion)
- [x] PR cue toast structure (ready for Phase 2 integration)
- [x] Haptic feedback on set completion
- [ ] Handle orientation changes (deferred - low priority)
- [ ] Performance optimization (deferred - test on device first)

---

## Files to Create/Modify

### New Files
- `src/ui/components/WorkoutDrawer/index.tsx` - Main drawer component
- `src/ui/components/WorkoutDrawer/DrawerContent.tsx` - Workout UI container
- `src/ui/components/WorkoutDrawer/DrawerEdge.tsx` - Collapsed edge indicator
- `src/lib/stores/workoutDrawerStore.ts` - Drawer state management

### Modified Files
- `app/_layout.tsx` - Add WorkoutDrawer to root
- `app/(tabs)/workout.tsx` - Convert to hub, trigger drawer open
- `app/live-workout.tsx` - Deprecate or remove
- `src/lib/stores/currentSessionStore.ts` - Adjust persistence strategy

---

## Success Criteria

1. [x] User can start workout from hub → drawer opens
2. [x] User can collapse drawer with swipe → thin edge visible
3. [x] User can expand drawer from edge → full workout view
4. [x] User can navigate app with collapsed drawer → workout persists
5. [x] User can complete workout → data saved, drawer closes (basic implementation)
6. [ ] App handles crash → workout recoverable on relaunch (needs testing)
7. [ ] Performance: 60fps animations, no jank (needs device testing)

---

## Dependencies

- `react-native-gesture-handler` (already installed)
- `react-native-reanimated` (already installed)
- Zustand (already installed)

---

## Open Questions

1. Should tab bar be visible when drawer is expanded? (Probably yes for consistency)
2. Should there be a backdrop dim when drawer is open? (Maybe subtle)
3. How to handle the "peek" edge on notched devices? (Safe area consideration)
4. Should workout auto-save periodically for crash protection? (Probably yes, every 60s)

---

## Related Documents

- [Workout UX Vision Interview](../../AskUQ/2026-02-02-workout-ux-vision.md)
- [Workout Logging UX](../workout-logging/feature-workout-logging-ux.md)
- [Current Session Store](../../../../src/lib/stores/currentSessionStore.ts)
