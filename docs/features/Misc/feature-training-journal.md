# Feature: Training Journal

## Overview
Free-form workout notes for serious lifters. Track how you felt, what went well, injuries, and mood. Low effort to build, high value for dedicated users.

**Status:** Planned | **Progress:** 0/4 features
**Priority:** Post-launch
**Source:** 2026-01-29 brainstorm interview

---

## Sub-Features

### Planned - Per-Workout Notes
- [ ] Free-form text field on workout completion
- [ ] "How did this workout go?" prompt
- [ ] Notes attached to workout session
- [ ] Visible in workout history detail view

---

### Planned - Per-Day Journal
- [ ] Daily journal entry (independent of workouts)
- [ ] Rest day notes, recovery thoughts, meal notes
- [ ] Accessible from profile or calendar view

---

### Planned - Mood & Energy Tracking
- [ ] Quick mood selector before/after workout (1-5 or emoji scale)
- [ ] Energy level indicator
- [ ] Soreness tracking (which muscle groups)
- [ ] Over time: patterns visible in Forge Lab (premium)

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
- Forge Lab (mood/energy patterns — premium)

---

## Priority

**P3 (Post-Launch):**
- Per-workout notes
- Journal history

**P4 (Future):**
- Mood/energy tracking
- AI coaching integration
