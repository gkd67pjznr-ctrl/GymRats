# Feature: Workout Logging UX

## Overview
The core workout logging interface - where users record their sets, weight, and reps. This is the most-used screen in the app and needs to be fast, intuitive, and visually appealing.

**Current Status:** Done (Phase 1 complete, Phase 2 complete, Phase 3 complete)

**Inspiration:** Fitbod, Liftoff - clean list-based logging with exercise cards and inline set entry

---

## Current Problems

1. **Cluttered UI** - Too many cards, confusing layout
2. **Confusing "Quick Add" vs "Exercise Blocks"** - Two different ways to add sets
3. **No clear "Add Exercise" button** - Users can't easily add exercises to their workout
4. **Set entry is clunky** - Need to tap multiple times to log a set
5. **"Mark Done" flow is awkward** - Sets are logged immediately, then marked done later
6. **Missing clear visual hierarchy** - Hard to tell what's editable vs completed

---

## Target Design (Fitbod/Liftoff Style)

### Main Screen Structure
```
┌─────────────────────────────────────────┐
│  [Workout Timer]         [Finish] [•••] │  <- Top bar
├─────────────────────────────────────────┤
│                                         │
│  [+ Add Exercise]                       │  <- Prominent button
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Bench Press                  [↓] │ │  <- Exercise card (collapsible)
│  │                                  │ │
│  │  Set 1  [____] lb  [____] reps  [✓]│  <- Set line with inputs + checkmark
│  │  Set 2  [____] lb  [____] reps  [✓]│
│  │  Set 3  [____] lb  [____] reps  [✓]│
│  │                                  │ │
│  │  [+ Add Set]                     │ │  <- Add another set to this exercise
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Squat                        [↓] │ │
│  │                                  │ │
│  │  Set 1  [____] lb  [____] reps  [✓]│
│  │  Set 2  [____] lb  [____] reps  [✓]│
│  │                                  │ │
│  │  [+ Add Set]                     │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [+ Add Exercise]                       │  <- Also at bottom
└─────────────────────────────────────────┘
```

### Key Interaction Flow

1. **User taps [+ Add Exercise]**
   - Opens exercise picker modal
   - Selected exercise is added as a new card

2. **Exercise card shows set lines**
   - Each line has: weight input | reps input | [✓] button
   - Tapping [✓] logs the set (triggers PR check, rest timer, etc.)
   - Completed sets show values (not editable)

3. **User can add more sets**
   - Tap [+ Add Set] in the exercise card
   - Adds a new empty line below

4. **Exercises can be reordered/removed**
   - Long press to drag reorder
   - Swipe to remove

---

## Sub-Features

### 1. Add Exercise Button
- [x] Prominent [+ Add Exercise] button at top of list
- [x] Also at bottom for easy access
- [ ] Opens exercise picker modal
- [ ] Selected exercise added as new card
- [ ] Scroll to newly added exercise

**Status:** Done (component created)

**Implementation:** `src/ui/components/LiveWorkout/AddExerciseButton.tsx`

---

### 2. Exercise Card Component
- [x] Exercise name header (tap to collapse/expand)
- [x] Remove button (X) on card
- [x] Drag handle for reordering
- [x] Show set count (e.g., "3 sets")
- [x] Collapse/expand state
- [x] Visual distinction between collapsed/expanded

**Status:** Done (component created)

**Implementation:** `src/ui/components/LiveWorkout/ExerciseCard.tsx`

---

### 3. Set Line Component
- [x] Weight input box (lb/kg based on settings)
- [x] Reps input box
- [x] Checkmark/Done button on right
- [x] Set number indicator ("Set 1", "Set 2", etc.)
- [x] Empty state vs completed state styling
- [ ] Auto-focus next line after completing? (maybe)

**Status:** Done (component created)

**Implementation:** `src/ui/components/LiveWorkout/SetLine.tsx`

---

### 4. Add Set Button (per exercise)
- [x] [+ Add Set] button at bottom of exercise card
- [x] Adds new empty set line
- [x] Auto-fill from previous set (smart defaults)
- [ ] Scroll to new set

**Status:** Done (component created)

**Implementation:** `src/ui/components/LiveWorkout/ExerciseCard.tsx` (integrated)

---

### 5. Set Completion Flow
- [x] Tapping [✓] logs the set
- [x] Triggers PR detection
- [x] Shows celebration toast if PR
- [ ] Starts rest timer
- [x] Haptic feedback
- [x] Line becomes non-editable after completion

**Status:** Done

**Implementation:** `src/ui/components/LiveWorkout/SetLine.tsx`, `src/ui/components/LiveWorkout/LiveWorkoutContent.tsx`

---

### 6. Exercise Reordering
- [x] Drag handle on card
- [x] Long press drag to reorder exercises
- [x] Visual feedback during drag
- [x] Drop indicator
- [x] Save new order to session

**Status:** Done

**Implementation:** `src/ui/components/LiveWorkout/DraggableExerciseCard.tsx`, `src/ui/components/LiveWorkout/DraggableExerciseList.tsx`

---

### 7. Exercise Removal
- [x] Remove button (X) on card
- [ ] Swipe to remove exercise card
- [x] Confirmation dialog
- [x] Also removes all associated sets

**Status:** Partial (button done, swipe pending)

**Implementation:** `src/ui/components/LiveWorkout/ExerciseCard.tsx`, `src/ui/components/LiveWorkout/LiveWorkoutContent.tsx`

---

### 8. Smart Defaults
- [x] Auto-fill weight from previous set
- [x] Auto-fill reps from previous set
- [x] Remember last weight for this exercise
- [ ] Suggest weight increment from last workout

**Status:** Done

**Implementation:** `src/lib/stores/workoutEditingStore.ts` (createNewSetLine function)

---

### 9. Keyboard Handling
- [x] Number pad for weight
- [x] Number pad for reps
- [x] Dismiss keyboard on done
- [x] Next field focus (weight → reps → done)

**Status:** Done

**Implementation:** `src/ui/components/LiveWorkout/SetLine.tsx`

---

### 10. Empty States
- [x] "Add your first exercise to get started"
- [x] Illustration or icon
- [x] Call to action

**Status:** Done

**Implementation:** `src/ui/components/LiveWorkout/EmptyWorkoutState.tsx`
- [x] Remove button (X) on card
- [ ] Swipe to remove exercise card
- [ ] Confirmation dialog
- [x] Also removes all associated sets

**Status:** Partial (button done, swipe/dialog pending)

**Implementation:** `src/ui/components/LiveWorkout/ExerciseCard.tsx`

---

### 8. Smart Defaults
- [x] Auto-fill weight from previous set
- [x] Auto-fill reps from previous set
- [x] Remember last weight for this exercise
- [ ] Suggest weight increment from last workout

**Status:** Done

**Implementation:** `src/lib/stores/workoutEditingStore.ts` (createNewSetLine function)

---

### 9. Keyboard Handling
- [x] Number pad for weight
- [x] Number pad for reps
- [x] Dismiss keyboard on done
- [x] Next field focus (weight → reps → done)

**Status:** Done

**Implementation:** `src/ui/components/LiveWorkout/SetLine.tsx`

---

### 10. Empty States
- [x] "Add your first exercise to get started"
- [x] Illustration or icon
- [x] Call to action

**Status:** Done

**Implementation:** `src/ui/components/LiveWorkout/EmptyWorkoutState.tsx`

---

## Bugs / Issues to Fix

### BUG-LOG-001: Duplicate set logging flows
**Severity:** High
**Description:** QuickAddSetCard and ExerciseBlocksCard both add sets but in different ways. Confusing.

**Fix:** Consolidate to single set entry pattern using set lines in exercise cards.

---

### BUG-LOG-002: "Mark Done" is backwards
**Severity:** High
**Description:** Sets are logged immediately, then marked "done" later. This is backwards.

**Fix:** Set line should be empty, then tapping [✓] logs it. Completed sets show values.

---

### BUG-LOG-003: No way to remove exercises
**Severity:** Medium
**Description:** Once an exercise is added, it can't be removed from the workout.

**Fix:** Add swipe-to-remove or X button on exercise cards.

---

### BUG-LOG-004: Exercise cards can't be reordered
**Severity:** Medium
**Description:** Exercise order is fixed. Users often want to change order mid-workout.

**Fix:** Implement drag-to-reorder.

---

### BUG-LOG-005: Auto-focus issues
**Severity:** Medium
**Description:** After adding a set, focus doesn't go to the new set's inputs.

**Fix:** Auto-focus first input on new set line.

---

### BUG-LOG-006: Keyboard covers inputs
**Severity:** Medium
**Description:** When editing sets, keyboard covers the inputs.

**Fix:** Scroll to visible input on focus.

---

### BUG-LOG-007: No indication of current exercise
**Severity:** Low
**Description:** In free workout mode, no clear indication which exercise is "active".

**Fix:** Highlight current exercise card or first incomplete set.

---

## Technical Notes

**Key Files Modified/Created:**

**New Components (Phase 1 - Complete):**
- `src/ui/components/LiveWorkout/AddExerciseButton.tsx` - Prominent add button (done)
- `src/ui/components/LiveWorkout/SetLine.tsx` - Individual set input row (done)
- `src/ui/components/LiveWorkout/ExerciseCard.tsx` - Single exercise with set lines (done)
- `src/ui/components/LiveWorkout/EmptyWorkoutState.tsx` - Empty state illustration (done)

**New Components (Phase 2 - Complete):**
- `src/ui/components/LiveWorkout/LiveWorkoutContent.tsx` - Main content component with PR detection and haptics
- `src/ui/components/LiveWorkout/DraggableExerciseCard.tsx` - Exercise card with drag handle
- `src/ui/components/LiveWorkout/DraggableExerciseList.tsx` - List with drag-to-reorder

**New Components (Phase 3 - Complete):**
- `src/ui/components/LiveWorkout/NewWorkoutSection.tsx` - Wrapper component for integration

**New State Management:**
- `src/lib/stores/workoutEditingStore.ts` - Manages "editing" state, bridges to currentSessionStore (done)
- `src/lib/stores/settingsStore.ts` - Added `useNewWorkoutUX` toggle setting (done)

**Adapter Layer:**
- `src/lib/workoutSessionAdapter.ts` - Transforms between data models (done)

**Files to Modify (Integration - In Progress):**
- `app/live-workout.tsx` - Integrate NewWorkoutSection with settings toggle
- `src/ui/components/LiveWorkout/ExerciseBlocksCard.tsx` - Can be removed after migration
- `src/ui/components/LiveWorkout/QuickAddSetCard.tsx` - Can be removed after migration

**Data Model Approach:**

Instead of modifying the existing `currentSessionStore`, we created a `workoutEditingStore` that:
- Manages exercises in the workout (exerciseOrder)
- Tracks "editing" sets (not yet logged)
- Tracks completed set IDs
- Bridges to existing session store for persistence

This approach allows gradual migration without breaking existing functionality.

**Implementation Status:**
- Phase 1 (Core Components): **Done** - All components created
- Phase 2 (Integration & Polish): **Done** - PR detection, haptics, drag-to-reorder implemented
- Phase 3 (Final Integration): **In Progress** - Settings toggle, wrapper component, main screen integration pending

---

## Implementation Phases

### Phase 1: Core Redesign
- [x] Create new ExerciseCard component with set lines
- [x] Implement AddExerciseButton
- [x] Basic set line with weight/reps inputs
- [x] Checkmark button to complete set
- [x] Empty state component
- [x] Editing state management (workoutEditingStore)

**Status:** Complete

### Phase 2: Polish
- [x] Exercise reordering (DraggableExerciseCard)
- [x] Exercise removal (button done, swipe pending)
- [x] Smart defaults (auto-fill)
- [x] Keyboard handling
- [x] PR detection integration
- [x] Haptic feedback

**Status:** Complete

### Phase 3: Delight & Integration
- [x] PR celebration on set complete
- [x] Haptic feedback
- [ ] Smooth animations
- [x] Empty states
- [x] Settings toggle (useNewWorkoutUX in settingsStore)
- [x] NewWorkoutSection wrapper component
- [ ] Integration into live-workout.tsx (uses settings toggle)
- [ ] Swipe-to-remove gesture
- [ ] Rest timer auto-trigger after set completion

**Status:** In Progress

---

## Dependencies

- Exercise Library (for picker)
- PR Detection (triggers on set complete)
- Rest Timer (starts on set complete)
- Settings Store (for lb/kg preference)

---

## Examples / References

**Fitbod:**
- Clean exercise cards with expand/collapse
- Inline set entry with weight/reps
- Green checkmark to complete sets
- Smooth animations

**Liftoff:**
- Similar card-based layout
- Drag-to-reorder exercises
- Swipe to remove
- Minimal UI chrome

---

*Last Updated: 2026-01-29*
*Status: Phase 1 Complete, Phase 2 Complete, Phase 3 In Progress*
