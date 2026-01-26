# Feature: UI & Design

## Overview
Visual design, theming, components, and polish. The "mysterious, exclusive" aesthetic inspired by Pure dating app.

---

## Sub-Features

### Done - Dark Theme Foundation
- [x] Dark background (#0a0a0a)
- [x] Card backgrounds (#1a1a1a)
- [x] Border colors (#333333)
- [x] Text colors (white, muted)

**Implementation:** `src/ui/designSystem.ts`, `src/ui/theme.ts`

### Done - Design System Tokens
- [x] Spacing scale (4px base)
- [x] Border radii
- [x] Typography scale
- [x] Design system factory function

**Implementation:** `src/ui/designSystem.ts`

### Done - Accent Color Themes
- [x] Toxic (lime green)
- [x] Electric (purple)
- [x] Ember (pink)
- [x] Ice (cyan)
- [x] Ultra (mixed)

**Implementation:** `src/ui/designSystem.ts`

### Done - Rank Colors
- [x] Iron, Bronze, Silver colors
- [x] Gold, Platinum, Diamond colors
- [x] Mythic color

**Implementation:** `src/ui/designSystem.ts`

### Done - Tab Navigation
- [x] Bottom tab bar
- [x] Tab icons
- [x] Tab labels
- [x] Active state styling

**Implementation:** `app/(tabs)/_layout.tsx`

### Done - Error Boundaries
- [x] Root error boundary
- [x] Tab error boundary component
- [x] Error screen UI
- [x] "Try Again" recovery

**Implementation:** `src/ui/error-boundary.tsx`, `src/ui/tab-error-boundary.tsx`

---

### In Progress - Screen Layouts
- [x] Basic screen structure
- [x] Safe area handling
- [ ] Consistent headers
- [ ] Back navigation

### In Progress - Input Components
- [x] Basic text inputs
- [ ] Number pad
- [ ] Stepper inputs
- [ ] Styled select/picker

### In Progress - Loading States
- [x] Basic loading indicators
- [ ] Skeleton screens
- [ ] Pull-to-refresh

---

### Planned - PR Celebration Animation
- [ ] Toast slide-in animation
- [ ] Particle/sparkle effects
- [ ] Rank tier gradient background

### Planned - Rank-Up Animation
- [ ] Level-up modal
- [ ] Number increment animation
- [ ] Confetti effect

### Planned - Smooth Transitions
- [ ] Screen transition animations
- [ ] Tab switch animations
- [ ] Modal animations

### Planned - Empty States
- [ ] No workouts state
- [ ] No friends state
- [ ] No posts state

### Planned - Onboarding Screens
- [ ] Welcome screen
- [ ] Feature highlights
- [ ] Personality picker

### Planned - Dark Gradients
- [ ] Gradient backgrounds
- [ ] Subtle depth
- [ ] "Pure" aesthetic

### Planned - Bold Typography
- [ ] Statement headings
- [ ] Confident font weights
- [ ] Type hierarchy refinement

### Planned - Minimal Chrome
- [ ] Reduced UI elements
- [ ] More negative space
- [ ] Content-focused layouts

---

## Technical Notes

**Key Files:**
- `src/ui/designSystem.ts` - Design tokens factory
- `src/ui/theme.ts` - Theme colors hook
- `src/ui/forgerankStyle.ts` - Brand-specific styles
- `src/ui/error-boundary.tsx` - Error boundary component
- `src/ui/tab-error-boundary.tsx` - Tab-specific error boundary
- `app/_layout.tsx` - Root layout
- `app/(tabs)/_layout.tsx` - Tab layout

**Design System Usage:**
```typescript
const ds = makeDesignSystem("dark", "toxic");

// Colors
ds.tone.bg       // #0a0a0a
ds.tone.card     // #1a1a1a
ds.tone.text     // #ffffff
ds.tone.muted    // #888888
ds.tone.accent   // Toxic lime green

// Spacing
ds.space.x4      // 16px
ds.space.x6      // 24px

// Radii
ds.radii.lg      // 20px
ds.radii.md      // 12px
```

**Theme Colors Hook:**
```typescript
const c = useThemeColors();
// c.bg, c.card, c.text, c.muted, c.border, c.accent
```

---

## Visual Direction

**Inspired by Pure dating app:**
- Mysterious/exclusive vibe
- Dark gradients
- Bold typography
- Minimal UI chrome
- Accent color pops
- Premium feel

**Target Audience:**
- Young lifters (18-30)
- Aesthetic-focused
- Social media savvy
