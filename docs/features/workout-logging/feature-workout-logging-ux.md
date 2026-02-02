# Feature: Workout Logging UX

## Overview
The core workout logging interface - where users record their sets, weight, and reps. This is the most-used screen in the app and needs to be fast, intuitive, and visually appealing.

**Current Status:** Done (All phases complete, fully integrated into live-workout.tsx)

**Inspiration:** Hevy, Liftoff - clean list-based logging with exercise cards and inline set entry

---

## Current Implementation (Hevy/Liftoff Style)

### Screen Structure
```
┌─────────────────────────────────────────┐
│  [v]     [timer] 0:34:12     [Finish]  │  <- WorkoutTopBar (fixed)
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ [+ Add Exercise]  (accent tint)     ││  <- Prominent button
│  └─────────────────────────────────────┘│
│  [Switch] [Focus]                       │  <- Small pill buttons
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Bench Press (accent color)     [^]  ││  <- ExerciseCard header
│  │ SET  PREVIOUS  LBS   REPS    [✓]   ││  <- Column headers
│  │ ─────────────────────────────────── ││  <- Hairline divider
│  │ (1)   185x8   [185]  [8]     (●)   ││  <- SetRow (clean, no border)
│  │ (2)   185x8   [185]  [8]     (✓)   ││  <- Completed (filled check)
│  │ (3)    -      [   ]  [ ]     ( )   ││  <- Empty row
│  │         + Add Set                   ││  <- Add set link
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Squat (accent color)          [^]   ││
│  │ SET  PREVIOUS  LBS   REPS    [✓]   ││
│  │ ...                                 ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │     [  Finish Workout  ]  (accent)  ││  <- WorkoutActions
│  │  [Save as Routine]  [Discard]       ││  <- Secondary actions
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### Key Design Decisions
- **Exercise name in accent/primary color** (tappable to switch exercise)
- **No individual borders on set rows** - clean table rows within the card
- **Flex-based column widths** - columns fill available space instead of fixed pixels
- **Circular check button** - fills with accent color when done (like Hevy)
- **Circular set number badge** - subtle background, accent when done
- **Input fields** - background-only styling, no borders (subtle)
- **Hairline divider** between column headers and set rows
- **"Add Set" as text link** - not a bordered button
- **Empty state** - tappable dashed-border card that opens exercise picker

### Key Interaction Flow

1. **User taps [+ Add Exercise]** - Opens exercise picker modal, exercise added as new card
2. **Exercise card shows set rows** - Each row: SET | PREVIOUS | LBS | REPS | check button
3. **Tapping check marks set done** - Triggers PR check, rest timer, haptic feedback
4. **Completed sets lock** - Values become non-editable text
5. **Swipe left on set row** - Reveals delete action
6. **Tap exercise name** - Opens exercise picker to swap
7. **Collapse/expand** - Chevron toggle on exercise card header

---

## Component Architecture

### Active Components (in live-workout.tsx)

| Component | File | Purpose |
|-----------|------|---------|
| `WorkoutTopBar` | `src/ui/components/LiveWorkout/WorkoutTopBar.tsx` | Fixed top bar: back, timer, finish |
| `WorkoutControls` | `src/ui/components/LiveWorkout/WorkoutControls.tsx` | Add Exercise button + secondary pills |
| `ExerciseCard` | `src/ui/components/LiveWorkout/ExerciseCard.tsx` | Exercise container with column headers + set rows |
| `SetRow` | `src/ui/components/LiveWorkout/SetRow.tsx` | Individual set row (editable or locked) |
| `WorkoutActions` | `src/ui/components/LiveWorkout/WorkoutActions.tsx` | Bottom actions: Finish, Save Routine, Discard |
| `ExercisePicker` | `src/ui/components/LiveWorkout/ExercisePicker.tsx` | Exercise selection modal |
| `RestTimerOverlay` | `src/ui/components/RestTimerOverlay.tsx` | Full-screen rest timer countdown |
| `InstantCueToast` | `src/ui/components/LiveWorkout/InstantCueToast.tsx` | PR/achievement toast |
| `PRCelebration` | `src/ui/components/LiveWorkout/PRCelebration.tsx` | PR celebration modal |
| `ValidationToast` | `src/ui/components/LiveWorkout/ValidationToast.tsx` | Error/success feedback |

### Legacy Components (no longer used in main flow)
- `ExerciseBlocksCard.tsx` - Replaced by ExerciseCard
- `QuickAddSetCard.tsx` - Replaced by SetRow inline editing
- `WorkoutNotes.tsx` - Removed from default view (still exists)
- `RecapCues.tsx` - Removed from default view (still exists)

---

## Sub-Features

### 1. Add Exercise Button
- [x] Prominent button at top with accent color tint
- [x] Opens exercise picker modal
- [x] Selected exercise added as new card

**Implementation:** `WorkoutControls.tsx` - full-width accent-tinted button

---

### 2. Exercise Card
- [x] Exercise name in accent color (tappable)
- [x] Collapse/expand with chevron
- [x] Set count display (in plan mode)
- [x] Clean tabular layout with flex columns
- [x] Hairline divider between headers and rows

**Implementation:** `ExerciseCard.tsx`

---

### 3. Set Row
- [x] Circular set number badge
- [x] Previous workout data column
- [x] Weight input (background-only, no border)
- [x] Reps input (background-only, no border)
- [x] Circular check button (fills accent when done)
- [x] Swipe-to-delete action
- [x] Locked values when completed
- [x] Haptic feedback on interactions

**Implementation:** `SetRow.tsx`

---

### 4. Add Set Button (per exercise)
- [x] "Add Set" text link at bottom of exercise card
- [x] Adds new set with smart defaults
- [x] Triggers rest timer
- [x] Haptic feedback

**Implementation:** Integrated in `ExerciseCard.tsx`

---

### 5. Set Completion Flow
- [x] Tapping check marks set done
- [x] Triggers PR detection
- [x] Shows celebration toast if PR
- [x] Starts rest timer
- [x] Haptic feedback
- [x] Row becomes non-editable

**Implementation:** `SetRow.tsx`, `live-workout.tsx` orchestration

---

### 6. Smart Defaults
- [x] Auto-fill weight from previous set
- [x] Auto-fill reps from previous set
- [x] Remember last weight for this exercise

**Implementation:** `useLiveWorkoutSession` hook

---

### 7. Keyboard Handling
- [x] Number pad for weight (decimal-pad)
- [x] Number pad for reps (number-pad)
- [x] Select all on focus
- [x] KeyboardAvoidingView wrapper

**Implementation:** `SetRow.tsx`, `live-workout.tsx`

---

### 8. Empty State
- [x] Tappable dashed-border card
- [x] "No exercises yet" + "Tap to add your first exercise"
- [x] Opens exercise picker on tap

**Implementation:** Inline in `live-workout.tsx`

---

### 9. Top Bar
- [x] Back chevron (minimize)
- [x] Timer icon + elapsed duration (tappable for rest timer)
- [x] Finish button (accent color)
- [x] Safe area insets

**Implementation:** `WorkoutTopBar.tsx`

---

### 10. Bottom Actions
- [x] Full-width "Finish Workout" button (accent)
- [x] "Save as Routine" (outlined, only if sets exist)
- [x] "Discard Workout" (danger text)

**Implementation:** `WorkoutActions.tsx`

---

## Resolved Issues

All original bugs have been fixed by the redesign:

| Bug | Resolution |
|-----|-----------|
| BUG-LOG-001: Duplicate set logging | Consolidated to single ExerciseCard + SetRow pattern |
| BUG-LOG-002: "Mark Done" backwards | Check button now marks set done (correct flow) |
| BUG-LOG-003: No exercise removal | Swipe-to-delete on set rows |
| BUG-LOG-004: No reordering | Exercise blocks managed by picker state |
| BUG-LOG-005: Auto-focus | Select-on-focus for inputs |
| BUG-LOG-006: Keyboard covers | KeyboardAvoidingView wrapper |
| BUG-LOG-007: No active indicator | Focus mode highlights selected exercise |

---

## Technical Notes

### Key Files
- `app/live-workout.tsx` - Main orchestrator screen (~680 lines)
- `src/ui/components/LiveWorkout/ExerciseCard.tsx` - Exercise card with table layout
- `src/ui/components/LiveWorkout/SetRow.tsx` - Individual set row
- `src/ui/components/LiveWorkout/WorkoutTopBar.tsx` - Fixed top bar
- `src/ui/components/LiveWorkout/WorkoutControls.tsx` - Add Exercise + secondary controls
- `src/ui/components/LiveWorkout/WorkoutActions.tsx` - Bottom actions
- `src/lib/hooks/useLiveWorkoutSession.ts` - Session logic hook
- `src/lib/hooks/useWorkoutOrchestrator.ts` - PR detection, buddy, finish logic
- `src/lib/hooks/useWorkoutTimer.ts` - Timer logic
- `src/lib/hooks/useExercisePickerState.ts` - Exercise picker state management

### Design Tokens Used
- Colors: `c.primary` (accent), `c.card` (backgrounds), `c.bg` (inputs), `c.border`, `c.muted`, `c.text`
- Spacing: Direct pixel values (12, 14, 16px) for tight control
- Radii: 12px (cards), 8px (inputs), 14px/13px (circular badges/checks), 20px (pill buttons)
- Typography: Direct fontSize/fontWeight for consistency

---

## Dependencies

- Exercise Library (for picker)
- PR Detection (triggers on set complete)
- Rest Timer (starts on set complete)
- Settings Store (for lb/kg preference)
- Buddy Engine (for contextual messages)
- Gamification Store (for XP/level-up)

---

*Last Updated: 2026-02-02*
*Status: Complete - All phases done, fully integrated*
