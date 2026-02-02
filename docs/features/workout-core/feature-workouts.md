# Feature: Workout Core

## Overview
The core workout logging experience - the heart of Forgerank. Users start workouts, log sets with weight and reps, and track their progress over time.

---

## Sub-Features

### Done - Live Workout Session
- [x] Start a workout session
- [x] Session ID generation
- [x] Session start timestamp
- [x] Session persistence to AsyncStorage
- [x] Resume workout after app close/crash

**Implementation:** `app/live-workout.tsx`, `src/lib/stores/currentSessionStore.ts`

### Done - Set Logging (Basic)
- [x] Log weight and reps
- [x] Store sets in session
- [x] Exercise ID linking
- [x] Set timestamps

**Implementation:** `src/lib/hooks/useLiveWorkoutSession.ts`

### Done - Exercise Selection
- [x] Exercise picker modal
- [x] Exercise search
- [x] Exercise blocks display
- [x] Selected exercise state

**Implementation:** `src/ui/components/LiveWorkout/ExercisePicker.tsx`

### Done - Rest Timer (Basic)
- [x] Timer countdown
- [x] Timer overlay display
- [x] Haptic notification
- [x] Manual start

**Implementation:** `src/ui/components/LiveWorkout/RestTimerOverlay.tsx`

### Done - Workout History
- [x] Save completed workouts
- [x] View history list
- [x] Session detail view
- [x] Calendar visualization (basic)

**Implementation:** `src/lib/stores/workoutStore.ts`, `app/history.tsx`, `app/calendar.tsx`

### Done - Routine Builder (Basic)
- [x] Create routine
- [x] Add exercises to routine
- [x] Save routine
- [x] View saved routines

**Implementation:** `app/routines/`, `src/lib/stores/routinesStore.ts`

### Done - Premade Plans
- [x] Browse plan categories
- [x] View plan details
- [x] Plan to routine conversion

**Implementation:** `src/lib/premadePlans/`, `app/workout/plans/`

### Done - Session Persistence
- [x] Auto-save on state change
- [x] Restore on app launch
- [x] Hydration flag for UI

**Implementation:** `src/lib/stores/currentSessionStore.ts`

---

### In Progress - Routine-Based Workout Flow
- [ ] Start workout from routine
- [ ] Show routine exercises in workout
- [ ] Track progress against routine
- [ ] Completion percentage

**Status:** Basic functionality works
**Next:** Polish UI and add progress tracking


### Done - Rest Timer Enhancement
- [x] Auto-start after set
- [x] Push notification when backgrounded
- [x] Sound effects
- [x] Skip/add time buttons
- [x] Circular progress display

**Status:** Complete - All rest timer enhancement features implemented

### Done - Audio & Feedback Preferences
- [x] Audio cue preferences (PR celebration, rest timer start/end, workout complete, rank up, level up)
- [x] Rest timer feedback preferences (audio, haptic, voice, notification, visual progress)
- [x] Settings UI with toggle controls for each preference
- [x] Integration with sound system and haptic feedback

**Implementation:** `src/lib/stores/settingsStore.ts`, `app/settings.tsx`, `src/lib/sound/soundUtils.ts`, `src/ui/components/RestTimerOverlay.tsx`, `src/ui/components/LiveWorkout/PRCelebration.tsx`

### Done - PR Detection & Celebration
- [x] Weight PR detection
- [x] Rep PR detection
- [x] e1RM PR detection
- [x] Celebration toast (InstantCueToast)
- [x] Full-screen PR celebration modal
- [x] Sound effects (SoundManager)
- [x] Haptic feedback
- [ ] One-tap share

**Implementation:** `src/lib/perSetCue.ts`, `src/ui/components/LiveWorkout/PRCelebration.tsx`, `src/lib/sound/SoundManager.ts`, `src/lib/celebration/`

---

### Planned - Finish Workout Flow
- [ ] Workout summary screen
- [ ] Stats display (duration, sets, PRs)
- [ ] Post to feed prompt
- [ ] Streak update

### Planned - Workout Templates
- [ ] Save workout as template
- [ ] Quick-start from template

### Planned - Voice Input
- [ ] Voice command for sets
- [ ] "225 for 5" parsing

### Future - Apple Watch Integration
- [ ] Watch app
- [ ] Set logging from watch
- [ ] Timer on watch

### Future - Barcode Scanning
- [ ] Scan gym equipment
- [ ] Auto-fill weight

---

## Technical Notes

**Key Files:**
- `app/live-workout.tsx` - Main workout screen (577 lines, needs refactor)
- `src/lib/stores/currentSessionStore.ts` - Session state (Zustand)
- `src/lib/hooks/useLiveWorkoutSession.ts` - Session logic hook
- `src/lib/hooks/useWorkoutOrchestrator.ts` - PR detection orchestration
- `src/ui/components/LiveWorkout/` - UI components

**Data Models:**
- `WorkoutSet`: { id, exerciseId, weightKg, reps, timestampMs }
- `WorkoutSession`: { id, startedAtMs, endedAtMs, sets[], routineId?, completionPct? }
- `CurrentSession`: { id, startedAtMs, sets[], selectedExerciseId, exerciseBlocks[] }

**Storage:**
- Key: `currentSession.v2` (AsyncStorage)
- Workouts stored in Zustand with persistence

---

## Dependencies

- Exercise library (for exercise IDs)
- Scoring system (for PR detection)
- Settings store (for unit preferences)
