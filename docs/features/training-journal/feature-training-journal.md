# Feature: Training Journal

## Overview
Free-form workout notes for serious lifters. Track how you felt, what went well, injuries, and mood. Low effort to build, high value for dedicated users.

**Status:** Implemented | **Progress:** 4/4 features
**Priority:** Post-launch
**Source:** 2026-01-29 brainstorm interview
**Implementation Date:** 2026-02-01

---

## Sub-Features

### Implemented - Per-Workout Notes
- [x] Free-form text field on workout completion (WorkoutNotesSection in workout summary)
- [x] "How did this workout go?" prompt (JournalTextInput with placeholder)
- [x] Notes attached to workout session (linked via sessionId in JournalEntry)
- [x] Visible in workout history detail view (WorkoutNotesSection in workout-summary.tsx)

---

### Implemented - Per-Day Journal
- [x] Daily journal entry (independent of workouts) (app/journal.tsx)
- [x] Rest day notes, recovery thoughts, meal notes (JournalEntryModal)
- [x] Accessible from profile or calendar view (app/journal.tsx and calendar/day/[dayMs].tsx)

---

### Planned - Mood & Energy Tracking
- [ ] Quick mood selector before/after workout (1-5 or emoji scale)
- [ ] Energy level indicator
- [ ] Soreness tracking (which muscle groups)
- [ ] Over time: patterns visible in Gym Lab (premium)

---

### Planned - Journal History
- [ ] Searchable journal entries
- [ ] Filter by date range
- [ ] Could feed into AI coaching suggestions over time
- [ ] Export option

---

## Technical Notes

```typescript
type JournalEntry = {
  id: string;
  userId: string;
  date: string;           // ISO date
  sessionId?: string;     // If tied to a workout
  text: string;
  mood?: number;          // 1-5
  energy?: number;        // 1-5
  soreness?: string[];    // muscle group IDs
  createdAt: number;
};
```

---

## Dependencies

- Workout history (linking notes to sessions)
- Backend sync (persistence)
- Gym Lab (mood/energy patterns — premium)

---

## Priority

**P3 (Post-Launch):**
- Per-workout notes
- Journal history

**P4 (Future):**
- Mood/energy tracking
- AI coaching integration
