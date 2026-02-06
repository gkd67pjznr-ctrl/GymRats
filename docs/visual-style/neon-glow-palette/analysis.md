# Neon Glow Palette - Visual Analysis

**Last Updated:** 2026-02-03

High-fidelity UI mockups showcasing a cosmic/neon aesthetic for GymRats.

---

## Image Inventory

| File | Screen Type |
|------|-------------|
| `04149a0e-...` | Exercise Grid Dashboard |
| `2ed8be63-...` | Profile/Body Stats Screen |
| `7aceb58a-...` | Routines Screen |
| `a1feb5a3-...` | Live Workout Logging |
| `e4b3a93f-...` | Social Feed |

---

## Screen-by-Screen Analysis

### 1. Exercise Grid Dashboard
- **Layout:** 5x5 grid of exercise cards with rank badges (S, A, B tiers)
- **Visual style:** Cosmic starfield background with particle effects
- **Color palette:** Deep space black, magenta/pink glows, cyan accents, green rank badges
- **Notable:** Each card shows a workout pose with glowing rank indicator

### 2. Profile/Body Stats Screen
- **Features:**
  - Muscle group ranks (Chest A, Biceps S, Back S, Shoulders B)
  - Glowing anatomical body model with "S" rank overlay
  - Progress bars with neon glow effects
  - Top lifts section (Bench 105kg, Deadlift 145kg, OHP 70kg)
- **Design elements:** Pink/magenta progress bars, green rank badges, particle effects

### 3. Routines Screen
- **Layout:** Today's routine card + saved routines list
- **Features:**
  - "PUSH POWER" featured routine
  - Quick actions: "Build New Routine" / "Freestyle Workout"
  - Routine cards with XP rewards, duration, rank indicators
- **Style:** Gradient cards with cosmic backgrounds, neon button glows

### 4. Live Workout Logging
- **Features:**
  - Exercise cards (Bench Press, Cable Fly)
  - Set logging: reps, weight, with +1 buttons
  - Progress percentage with rank badge
  - AI buddy cues ("PUSH HARDER!", "FEEL THE BURN!")
- **UX:** Clean set rows, prominent LOG button, coin rewards visible

### 5. Social Feed
- **Layout:** User workout posts (Jason, Kelly, Mike)
- **Features:**
  - Exercise summaries with ranks (S, A, B)
  - Social engagement (likes, comments, shares)
  - Personal captions ("Felt super strong today!")
  - Avatar thumbnails with workout imagery
- **Engagement:** Heart counts (253, 184), comment counts, share icons

---

## Design System Extraction

### Color Palette

| Element | Color | Hex (approx) |
|---------|-------|--------------|
| Background | Deep space black | `#0a0a0f` |
| Primary accent | Magenta/Pink | `#ff00ff`, `#ff1493` |
| Secondary accent | Cyan/Teal | `#00ffff` |
| Rank S | Green glow | `#00ff00` |
| Rank A | Green/Yellow | `#7fff00` |
| Rank B | Blue/Cyan | `#00bfff` |
| Card background | Semi-transparent | `rgba(20,20,30,0.8)` |
| Text primary | White | `#ffffff` |
| Text secondary | Gray | `#a0a0a0` |

### Visual Effects

- **Starfield particles:** Animated cosmic dust in background
- **Neon glow:** Soft blur on buttons, badges, progress bars
- **Gradient borders:** Cards have subtle gradient outlines
- **Glass morphism:** Semi-transparent cards with backdrop blur

### Typography

- **Headers:** Bold, all-caps for section titles
- **Body:** Clean sans-serif
- **Numbers:** Prominent, high contrast for stats

### UI Components

- **Rank badges:** Hexagonal with letter grade, colored glow
- **Progress bars:** Rounded, neon gradient fill
- **Cards:** Rounded corners (~16px), gradient border, glass effect
- **Buttons:** Pill-shaped, neon glow on hover/active
- **Bottom nav:** Icon-based with glow indicator for active tab

---

## Implementation Notes

This palette represents a **premium visual direction** - very polished, game-like aesthetic that would differentiate GymRats from typical fitness apps.

**Best suited for:**
- Premium/paid theme tier
- "Legendary" buddy themes
- Special event UI (competitions, seasons)

**Technical considerations:**
- Heavy use of blur effects (performance on lower-end devices)
- Particle animations need optimization
- Consider reduced motion accessibility option
