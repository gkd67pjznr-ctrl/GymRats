# Feature: Exercise Library

## Overview
Static database of exercises with metadata. Used throughout the app for exercise selection, history, and scoring.

---

## Sub-Features

### Done - Exercise Database
- [x] 50+ exercises defined
- [x] Unique exercise IDs
- [x] Display names
- [x] Exercise lookup by ID

**Implementation:** `src/data/exercises.ts`

### Done - Muscle Group Mapping
- [x] Primary muscle per exercise
- [x] Exercise categories

**Implementation:** `src/data/exercises.ts`

### Done - Verified Standards
- [x] Top e1RM values for each exercise
- [x] Based on verified world-class lifts
- [x] Used for rank calculation

**Implementation:** `src/data/rankTops.ts`

---

### Planned - Exercise Search
- [ ] Full-text search
- [ ] Filter by muscle group
- [ ] Recent exercises first

### Planned - Exercise Details View
- [ ] Exercise description
- [ ] Muscle diagram
- [ ] Form tips/video

### Planned - Custom Exercises
- [ ] User-defined exercises
- [ ] Custom exercise sync

---

## Technical Notes

**Key Files:**
- `src/data/exercises.ts` - Exercise definitions
- `src/data/rankTops.ts` - Verified top standards

**Exercise Structure:**
```typescript
type Exercise = {
  id: string;        // e.g., "bench", "squat"
  name: string;      // e.g., "Bench Press", "Back Squat"
  category?: string; // e.g., "compound", "isolation"
  muscles?: string[];
}
```

**Standard Exercise IDs:**
- `bench`, `squat`, `deadlift`, `ohp`, `row`, `pullup`
- `incline_bench`, `rdl`, `leg_press`, `lat_pulldown`
- Plus 40+ more

---

## Future Enhancements

- Exercise animations/videos
- Form tracking with camera
- Equipment requirements
