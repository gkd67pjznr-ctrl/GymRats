# Feature: Body Model

## Overview
A visual representation of the human body that shows muscle engagement based on workout volume. Serves as both a stats visualization and a default image for social posts when no photo is uploaded.

**Status:** In Progress | **Progress:** 4/6 features
**Priority:** P1 (Phase 4)

## Recent Updates (2026-01-30)
- Added complete muscle group system with 32 detailed subdivisions
- Implemented exercise-to-muscle mapping for 300+ exercises
- Built BodyModel component with SVG visualization
- Integrated body stats screen with volume-based coloring

---

## Sub-Features

### ✅ Done - Muscle Subdivisions
- [x] Upper chest / lower chest separation
- [x] Front delts / side delts / rear delts
- [x] Bicep long head / short head
- [x] Tricep heads
- [x] Quad separation
- [x] Hamstring detail
- [x] Upper/lower back regions
- [x] Core sections

---

### ✅ Done - Volume-Based Coloring
- [x] Gradient intensity based on sets per muscle
- [x] Color scale (cool to hot)
- [ ] Weekly/monthly view toggle
- [x] Exercise-to-muscle mapping
- [x] Primary/secondary/tertiary muscle attribution

---

### ✅ Done - Exercise Muscle Mapping
- [x] Each exercise maps to affected muscles
- [x] Primary muscle (100% attribution)
- [x] Secondary muscles (50% attribution)
- [x] Tertiary muscles (25% attribution)
- [x] Stored in exercise database

**Example:**
```
Bench Press:
- Primary: Chest (100%)
- Secondary: Front Delts, Triceps (50%)
- Tertiary: None
```

Includes comprehensive mappings for over 300 exercises with detailed muscle attribution.

---

### In Progress - Default Post Image
- [x] Auto-generate body model for workout posts
- [x] Shows muscles worked in that session
- [ ] Used when user doesn't upload photo
- [x] Maintains aesthetic consistency

Compact body model component implemented but not yet integrated into social posts.

---

### In Progress - Interactive Body Screen
- [x] Tap muscle to see stats
- [x] Volume per muscle over time (in Body Stats tab)
- [x] Exercises targeting that muscle
- [ ] Balance indicators (left/right, push/pull)

Basic interactive functionality implemented in the Body Stats screen with front/back view switching.

---

## Technical Notes

**Key Files:**
- `src/ui/components/BodyModel.tsx` - SVG body component (simplified implementation)
- `src/lib/bodyModel/bodyModel.tsx` - SVG body component (detailed implementation)
- `src/data/muscleGroups.ts` - Simplified muscle definitions
- `src/lib/bodyModel/muscleGroups.ts` - Detailed muscle definitions with exercise mappings
- `src/lib/volumeCalculator.ts` - Volume per muscle calculation
- `src/lib/bodyModel/index.ts` - Module exports

**Data Structure:**
```typescript
type MuscleGroup = {
  id: string;
  name: string;
  region: 'upper' | 'lower' | 'core';
  side: 'front' | 'back';
  svgPath: string;
};

type ExerciseMuscles = {
  exerciseId: string;
  primary: string[];    // muscle IDs (100%)
  secondary: string[];  // muscle IDs (50%)
  tertiary: string[];   // muscle IDs (25%)
};
```

**Color Gradient:**
```typescript
// Volume intensity to color
const volumeToColor = (sets: number): string => {
  if (sets === 0) return '#333333';  // inactive
  if (sets < 3) return '#4a90a4';    // cool blue
  if (sets < 6) return '#90c44c';    // green
  if (sets < 10) return '#f5a623';   // orange
  return '#d0021b';                   // hot red
};
```

---

## Visual Direction

**Style:**
- Stylized, not photorealistic
- Gender-neutral option
- Dark background compatible
- Accent color for muscle highlights
- Smooth gradients, not harsh boundaries

**Inspiration:**
- Fitness app muscle diagrams
- Anatomy illustration style
- Minimalist aesthetic

---

## Dependencies

- Exercise database with muscle mappings
- Workout history (for volume calculation)
- SVG rendering (react-native-svg)
- Body stats screen integration (app/(tabs)/body.tsx)
- Body stat store (src/lib/stores/bodyStatStore.ts)

---

## Priority

## Implementation Summary (2026-01-30)

### What Was Done
- Created complete muscle group system with 32 detailed subdivisions
- Implemented exercise-to-muscle mapping for 300+ exercises
- Built BodyModel component with SVG visualization
- Integrated body stats screen with volume-based coloring
- Implemented volume calculation logic from workout history
- Created Zustand store for body stat persistence

### Files Created
- `src/lib/bodyModel/muscleGroups.ts` - Detailed muscle definitions and mappings
- `src/lib/bodyModel/bodyModel.tsx` - Detailed body visualization component
- `src/lib/bodyModel/index.ts` - Module exports
- `src/ui/components/BodyModel.tsx` - Simplified body visualization component
- `src/lib/stores/bodyStatStore.ts` - Zustand store for persistence
- Integrated into `app/(tabs)/body.tsx`

### Test Status
- Basic functionality tested through body stats screen
- Volume calculation verified with sample data

### Score: 75/100

### Next Steps
- Replace placeholder SVG paths with actual muscle shapes
- Consolidate redundant muscle group definitions
- Integrate compact body model into social posts
- Implement Forge Lab muscle balance visualization
- Add time-based analytics for muscle development

---

**P1 (Phase 4):**
- ✅ Basic body model display
- ✅ Volume coloring
- In Progress - Default post image

**P2 (Post-Launch):**
- In Progress - Interactive body screen
- ✅ Detailed subdivisions
- Planned - Balance indicators
