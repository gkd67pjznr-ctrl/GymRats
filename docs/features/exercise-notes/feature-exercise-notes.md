# Feature: Exercise Notes

## Overview

Persistent per-exercise notes that allow users to attach personal reminders, form cues, or equipment notes to specific exercises. Unlike workout journal entries (per-session), these notes stick to the exercise itself and appear every time the user logs that exercise.

**Status:** Planned | **Progress:** 0/4 features
**Priority:** P1 (Launch)
**Source:** Voice Memo 7 (2026-02-05)

---

## Problem Statement

Users often need to remember specific details about exercises:
- Machine weight calibration ("Brand X feels 20% heavier than Brand Y")
- Form reminders ("Keep elbows tucked")
- Equipment settings ("Seat position 3, back pad 2")
- Injury accommodations ("Avoid full ROM due to shoulder")

Currently, users have no persistent way to attach these notes to exercises.

---

## Sub-Features

### 1. Exercise Note Storage
**Status:** Not Started | **Priority:** High

- [ ] `exerciseNotesStore.ts` - Zustand store with AsyncStorage persistence
- [ ] Data model: `{ odiv: string, note: string, updatedAt: number }`
- [ ] Sync to Supabase for cross-device access
- [ ] Max note length: 280 characters

**Technical:**
```typescript
type ExerciseNote = {
  odiv: string;        // Exercise ID (e.g., "Barbell_Bench_Press_-_Medium_Grip")
  note: string;        // User's note (max 280 chars)
  updatedAt: number;   // Timestamp for sync conflict resolution
};

// Store structure
interface ExerciseNotesState {
  notes: Record<string, ExerciseNote>;  // Keyed by odiv
  setNote: (odiv: string, note: string) => void;
  getNote: (odiv: string) => string | undefined;
  deleteNote: (odiv: string) => void;
}
```

**Tasks:** #58

---

### 2. Note Icon on Exercise Cards
**Status:** Not Started | **Priority:** High

- [ ] Small note icon (📝) on exercise card header in workout drawer
- [ ] Icon appears for ALL exercises (not just those with notes)
- [ ] Visual indicator when note exists (filled vs outline icon)
- [ ] Positioned in card header, non-intrusive

**Tasks:** #59

---

### 3. Note Dropdown UI
**Status:** Not Started | **Priority:** High

- [ ] Tap icon → slide-down text input area
- [ ] TextInput with placeholder: "Add note for this exercise..."
- [ ] Auto-save on blur (debounced)
- [ ] Shows truncated preview when collapsed if note exists
- [ ] Smooth animation (Reanimated)

**UI Mockup:**
```
┌─────────────────────────────────────┐
│ Bench Press                    [📝] │  ← Tap icon
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │  ← Dropdown appears
│ │ Machine weights feel heavy...   │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ SET | PREVIOUS | LBS | REPS | ✓    │
```

**Tasks:** #59

---

### 4. Note Display in Exercise Selection
**Status:** Not Started | **Priority:** Medium

- [ ] Show note preview in exercise picker
- [ ] Helps user identify exercises with existing notes
- [ ] Optional: search notes when searching exercises

---

## Data Flow

```
User taps note icon
    ↓
Dropdown expands with TextInput
    ↓
User types/edits note
    ↓
On blur: save to exerciseNotesStore
    ↓
Store persists to AsyncStorage immediately
    ↓
Background sync to Supabase (when online)
    ↓
Note appears next time exercise is selected
```

---

## Database Schema

```sql
-- Supabase table
CREATE TABLE exercise_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  exercise_id TEXT NOT NULL,
  note TEXT NOT NULL CHECK (char_length(note) <= 280),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- RLS Policy
ALTER TABLE exercise_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own notes"
  ON exercise_notes FOR ALL
  USING (auth.uid() = user_id);
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/stores/exerciseNotesStore.ts` | Zustand store for notes |
| `src/ui/components/WorkoutDrawer/ExerciseNoteDropdown.tsx` | Dropdown UI component |
| `src/ui/components/WorkoutDrawer/ExerciseCard.tsx` | Add note icon to header |

---

## Dependencies

- Workout Drawer (exercise cards exist)
- Backend Sync (for cross-device persistence)
- Design System (for consistent styling)

---

## Acceptance Criteria

1. User can tap note icon on any exercise card during workout
2. Dropdown appears with text input
3. Note auto-saves when user taps away
4. Note persists across sessions and app restarts
5. Note syncs to cloud and appears on other devices
6. Note icon shows filled state when note exists

---

## Related Tasks

- #58: Create exerciseNotesStore for per-exercise user notes
- #59: Add note icon and dropdown UI to exercise cards

---

## Future Enhancements

- Note templates (common cues like "Focus on mind-muscle connection")
- Share notes with friends
- AI-suggested form cues based on exercise
- Voice-to-text for quick note entry

---

*Created: 2026-02-05*
*Source: Voice Memo 7*
