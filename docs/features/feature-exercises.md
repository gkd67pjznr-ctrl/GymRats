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

### Planned - ExerciseDB API Integration
- [ ] ExerciseDB API service implementation
- [ ] Name simplifier (removes "medium grip", "narrow stance", etc.)
- [ ] Sync service with AsyncStorage caching
- [ ] Initial sync of all body parts
- [ ] Periodic incremental sync (ongoing task)

**Implementation:** `src/lib/exerciseAPI/`

**Ongoing Task - Daily Exercise Sync:**
- [ ] Run daily sync job to fetch new exercises from ExerciseDB
- [ ] Add ~50-100 new exercises per day (free tier: 500 req/day)
- [ ] Merge with existing database (avoid duplicates via name simplification)
- [ ] Update bundled JSON file weekly
- [ ] Target: 3,000+ exercises within 60 days

**API Key Setup:**
```bash
# Add to .env
EXPO_PUBLIC_EXERCISEDB_API_KEY=your_key_here
```

**Pricing:**
- Free: 500 requests/day (sufficient for daily sync)
- Paid: $5/month for 5,000 requests/day (if needed later)

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
- `src/data/exerciseDatabase.ts` - Full exercise database (873 exercises)
- `src/data/rankTops.ts` - Verified top standards
- `src/lib/exerciseAPI/` - ExerciseDB API integration

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

**Name Simplification:**
The name simplifier removes verbose descriptors:
- "Barbell Bench Press - Medium Grip" → "Barbell Bench Press"
- "Dumbbell Shoulder Press - Neutral Grip" → "Dumbbell Shoulder Press"
- "Barbell Squat - Narrow Stance" → "Barbell Squat"

Variants removed: grip (medium, narrow, wide, neutral), stance (narrow, wide), position (seated, standing, incline)

---

## Future Enhancements

- Exercise animations/videos (from ExerciseDB GIFs)
- Form tracking with camera
- Equipment requirements
- 3,000+ exercise database via API sync
