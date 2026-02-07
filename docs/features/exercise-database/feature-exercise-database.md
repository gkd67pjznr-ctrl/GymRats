# Feature: Exercise Database Management

## Overview

A maintainable system for managing the GymRats exercise database (637+ exercises). Includes a human-readable master file as the single source of truth, sync scripts for updates, and an exercise icon generation pipeline.

**Status:** In Progress | **Progress:** 1/6 features
**Priority:** P1 (Launch)
**Source:** Voice Memo 6 (2026-02-05)

---

## Problem Statement

The exercise database has grown to 637 exercises with issues:
- Verbose/redundant naming ("Barbell Bench Press - Medium Grip" vs "Bench Press")
- Duplicate entries for similar exercises
- Missing or inconsistent metadata
- No visual icons for exercises
- Hard to maintain directly in JSON

---

## Sub-Features

### 1. Master Exercise File (Source of Truth)
**Status:** Done | **Priority:** Critical

- [x] Human-readable markdown file with ALL exercises
- [x] Organized by primary muscle group (alphabetical within groups)
- [x] Equipment flags (BB, DB, Machine, Cable, Bands, KB, Bodyweight)
- [x] Secondary muscle information
- [x] Generation script (`scripts/generateExerciseMaster.js`)

**File:** `docs/data/EXERCISE-DATABASE-MASTER.md`

**Format:**
```markdown
## Chest (152)

| # | Exercise Name | Secondary | Equipment | BB | DB | M | C | BN | KB | BW |
|---|--------------|-----------|-----------|----|----|---|---|----|----|----|
| 1 | Bench Press | shoulders, triceps | barbell | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
```

**Tasks:** Completed

---

### 2. Sync Script (MD → JSON)
**Status:** Not Started | **Priority:** High

- [ ] Read `EXERCISE-DATABASE-MASTER.md` after user edits
- [ ] Parse markdown tables back to exercise objects
- [ ] Update `exercises-raw.json` with changes
- [ ] Handle: name changes, deletions, new exercises
- [ ] Preserve metadata not in markdown (instructions, images, etc.)
- [ ] Validation: warn on duplicate IDs, missing required fields

**Script:** `scripts/syncExercisesFromMaster.js`

**Workflow:**
```
User edits EXERCISE-DATABASE-MASTER.md
    ↓
Run: node scripts/syncExercisesFromMaster.js
    ↓
Script parses markdown, diffs against JSON
    ↓
Shows preview of changes (added/removed/modified)
    ↓
User confirms
    ↓
exercises-raw.json updated
```

**Tasks:** #55

---

### 3. Exercise Name Cleanup
**Status:** Not Started | **Priority:** High

Manual review of exercise names to:
- Remove verbose suffixes ("- Medium Grip", "- NB")
- Consolidate duplicates
- Standardize naming (Title Case, consistent terminology)
- Mark exercises for deletion if redundant

**Process:**
1. Review `EXERCISE-DATABASE-MASTER.md` section by section
2. Edit names directly in the markdown
3. Run sync script to apply changes
4. Verify in app

---

### 4. Exercise Icon Style Definition
**Status:** Not Started | **Priority:** Medium

- [ ] Define visual style for exercise icons
- [ ] Options: silhouette, line art, minimalist, anatomical
- [ ] Consistent dimensions (128x128 or 256x256)
- [ ] File format: SVG preferred, PNG fallback
- [ ] Color scheme: monochrome or accent-tinted

**Tasks:** #56

---

### 5. Exercise Icon Generation Pipeline
**Status:** Not Started | **Priority:** Medium

- [ ] Create prompt templates for AI image generation
- [ ] Organize prompts by muscle group/movement pattern
- [ ] Batch generation workflow
- [ ] Post-processing (resize, format conversion)
- [ ] Storage location (`src/assets/exercises/` or Supabase)

**Prompt Template:**
```
Simple fitness icon, [exercise name], minimalist black silhouette
on transparent background, showing proper form, clean lines,
app icon style, no text, consistent with fitness app aesthetic
```

**Tasks:** #57

---

### 6. Exercise Image Storage & Integration
**Status:** Not Started | **Priority:** Medium

- [ ] Define storage strategy (local vs cloud)
- [ ] Update `GrExercise` type with `iconUrl` field
- [ ] Fallback for exercises without icons
- [ ] Lazy loading for performance
- [ ] CDN integration for fast delivery

---

## Technical Details

### Current Data Structure

```typescript
// src/data/exercises-raw.json (637 exercises)
type RawExercise = {
  id: string;                    // "Barbell_Bench_Press_-_Medium_Grip"
  name: string;                  // "Barbell Bench Press - Medium Grip"
  force: 'push' | 'pull' | 'static';
  level: 'beginner' | 'intermediate' | 'expert';
  mechanic: 'compound' | 'isolation';
  equipment: string;             // "barbell", "dumbbell", etc.
  primaryMuscles: string[];      // ["chest"]
  secondaryMuscles: string[];    // ["shoulders", "triceps"]
  instructions: string[];        // Step-by-step guide
  category: string;              // "strength", "stretching", etc.
  images: string[];              // External image URLs (if any)
};
```

### Proposed Enhanced Structure

```typescript
type GrExercise = {
  // ... existing fields ...
  iconUrl?: string;              // Local or CDN URL
  displayName?: string;          // Clean name (overrides verbose name)
  aliases?: string[];            // Alternative names for search
  isHidden?: boolean;            // Hide from picker without deleting
};
```

---

## Key Files

| File | Purpose |
|------|---------|
| `docs/data/EXERCISE-DATABASE-MASTER.md` | Source of truth (human-editable) |
| `src/data/exercises-raw.json` | Runtime exercise data (1.4MB) |
| `src/data/exerciseDatabase.ts` | Exercise database module |
| `scripts/generateExerciseMaster.js` | Generate MD from JSON |
| `scripts/syncExercisesFromMaster.js` | Sync MD back to JSON (TODO) |

---

## Maintenance Workflow

### Adding New Exercises
1. Add row to appropriate muscle group section in `EXERCISE-DATABASE-MASTER.md`
2. Run `node scripts/syncExercisesFromMaster.js`
3. Generate icon for new exercise
4. Test in app

### Editing Exercise Names
1. Edit name in `EXERCISE-DATABASE-MASTER.md`
2. Run sync script
3. Verify name appears correctly in app

### Removing Exercises
1. Delete row from `EXERCISE-DATABASE-MASTER.md`
2. Run sync script (will warn about deletion)
3. Confirm deletion

---

## Related Tasks

- #55: Create sync script: exercise master .md to exercises-raw.json
- #56: Define consistent exercise icon style
- #57: Generate AI prompts for exercise icons by category

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Exercises | 637 |
| Muscle Groups | 21 |
| Equipment Types | 7+ |
| File Size (JSON) | 1.4MB |
| File Size (MD) | ~100KB |

---

## Future Enhancements

- Custom exercise creation by users (separate from master database)
- Community-submitted exercises with moderation
- Exercise video integration (short clips)
- AI-powered exercise recommendations
- Fuzzy search with aliases

---

*Created: 2026-02-05*
*Source: Voice Memo 6*
