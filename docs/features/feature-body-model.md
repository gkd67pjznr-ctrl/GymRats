# Feature: Body Model

## Overview
A visual representation of the human body that shows muscle engagement based on workout volume. Serves as both a stats visualization and a default image for social posts when no photo is uploaded.

---

## Sub-Features

### Planned - Muscle Subdivisions
- [ ] Upper chest / lower chest separation
- [ ] Front delts / side delts / rear delts
- [ ] Bicep long head / short head
- [ ] Tricep heads
- [ ] Quad separation
- [ ] Hamstring detail
- [ ] Upper/lower back regions
- [ ] Core sections

---

### Planned - Volume-Based Coloring
- [ ] Gradient intensity based on sets per muscle
- [ ] Color scale (cool to hot)
- [ ] Weekly/monthly view toggle
- [ ] Exercise-to-muscle mapping
- [ ] Primary/secondary/tertiary muscle attribution

---

### Planned - Exercise Muscle Mapping
- [ ] Each exercise maps to affected muscles
- [ ] Primary muscle (100% attribution)
- [ ] Secondary muscles (50% attribution)
- [ ] Tertiary muscles (25% attribution)
- [ ] Stored in exercise database

**Example:**
```
Bench Press:
- Primary: Chest (100%)
- Secondary: Front Delts, Triceps (50%)
- Tertiary: None
```

---

### Planned - Default Post Image
- [ ] Auto-generate body model for workout posts
- [ ] Shows muscles worked in that session
- [ ] Used when user doesn't upload photo
- [ ] Maintains aesthetic consistency

---

### Planned - Interactive Body Screen
- [ ] Tap muscle to see stats
- [ ] Volume per muscle over time
- [ ] Exercises targeting that muscle
- [ ] Balance indicators (left/right, push/pull)

---

## Technical Notes

**Key Files (To Be Created):**
- `src/ui/components/BodyModel.tsx` - SVG body component
- `src/data/muscleGroups.ts` - Muscle definitions
- `src/lib/volumeCalculator.ts` - Volume per muscle calculation

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

---

## Priority

**P1 (Phase 4):**
- Basic body model display
- Volume coloring
- Default post image

**P2 (Post-Launch):**
- Interactive body screen
- Detailed subdivisions
- Balance indicators
